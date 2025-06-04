import cv2
import mediapipe as mp
import numpy as np
import time
import json
import joblib
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import logging
import warnings
import base64
from io import BytesIO
from PIL import Image
from dotenv import load_dotenv

# Suppress warnings
warnings.filterwarnings("ignore", category=UserWarning, module="google.protobuf.symbol_database")
warnings.filterwarnings("ignore", category=UserWarning, module="sklearn.utils.validation")
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'  # Suppress TensorFlow oneDNN warnings

# Setup logging before using logger
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load environment variables from cv_service/.env
env_path = os.path.join(os.path.dirname(__file__), '.env')
logger.info(f"Looking for .env file at: {env_path}")

if not os.path.exists(env_path):
    logger.error(f".env file not found at {env_path}")
load_dotenv(dotenv_path=env_path, override=True)
logger.info(f"Loaded .env file: {os.path.exists(env_path)}")
logger.info(f"PORT from env: {os.environ.get('PORT')}")
logger.info(f"UPLOAD_FOLDER from env: {os.environ.get('UPLOAD_FOLDER')}")

# Initialize Flask app
app = Flask(__name__, static_folder='public')
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "https://fitness-tracker-5zbc.onrender.com"]}})

# Configure upload folder and max content length
app.config['UPLOAD_FOLDER'] = os.environ.get('UPLOAD_FOLDER', 'Uploads')
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB limit

# Load RandomForest model
model_path = os.path.join(os.path.dirname(__file__), r'C:\Users\rupes\Fitness-Tracker\cv_service\exercise_classifier.pkl')
try:
    logger.info(f"Loading model from {model_path}")
    model = joblib.load(model_path)
    logger.info("Model loaded successfully")
    logger.info(f"Model classes: {model.classes_}")
except Exception as e:
    logger.error(f"Failed to load model: {e}")
    raise

# Initialize MediaPipe
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils

def calculate_angle(p1, p2, p3):
    p1, p2, p3 = np.array(p1), np.array(p2), np.array(p3)
    ab = p1 - p2
    bc = p3 - p2
    cosine_angle = np.dot(ab, bc) / (np.linalg.norm(ab) * np.linalg.norm(bc))
    return np.degrees(np.arccos(np.clip(cosine_angle, -1.0, 1.0)))

def get_angles(landmarks, mp_pose):
    try:
        shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER].x, landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER].y]
        elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW].x, landmarks[mp_pose.PoseLandmark.LEFT_ELBOW].y]
        wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST].x, landmarks[mp_pose.PoseLandmark.LEFT_WRIST].y]
        hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP].x, landmarks[mp_pose.PoseLandmark.LEFT_HIP].y]
        knee = [landmarks[mp_pose.PoseLandmark.LEFT_KNEE].x, landmarks[mp_pose.PoseLandmark.LEFT_KNEE].y]
        ankle = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE].x, landmarks[mp_pose.PoseLandmark.LEFT_ANKLE].y]

        shoulder_angle = calculate_angle(hip, shoulder, elbow)
        elbow_angle = calculate_angle(shoulder, elbow, wrist)
        hip_angle = calculate_angle(shoulder, hip, knee)
        knee_angle = calculate_angle(hip, knee, ankle)
        ankle_angle = calculate_angle(knee, ankle, [ankle[0], ankle[1] + 1])
        return [shoulder_angle, elbow_angle, hip_angle, knee_angle, ankle_angle]
    except Exception as e:
        logger.error(f"Error calculating angles: {e}")
        return [0, 0, 0, 0, 0]

def detect_state(angles):
    try:
        angles_array = np.array(angles).reshape(1, -1)
        return model.predict(angles_array)[0]
    except Exception as e:
        logger.error(f"Error detecting state: {e}")
        return 'Idle'

class Counter:
    def __init__(self):
        self.reps = 0
        self.prev_state = 'Idle'
        self.last_transition_time = None

    def update(self, state, current_time):
        if state != self.prev_state and current_time - (self.last_transition_time or 0) > 0.5:
            if state in ['Squats', 'Push Ups', 'Jumping Jacks', 'Pull-ups', 'Russian Twists'] and self.prev_state == 'Idle':
                self.reps += 1
                self.last_transition_time = current_time
        self.prev_state = state
        return self.reps

def process_frame(frame, calorie_tracker, exercise_types, counters, met_values, weight_kg):
    with mp_pose.Pose(min_detection_confidence=1.0, min_tracking_confidence=1.0) as pose:
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(frame_rgb)
        state = 'Idle'
        current_exercise = None

        if results.pose_landmarks:
            angles = get_angles(results.pose_landmarks.landmark, mp_pose)
            if all(a != 0 for a in angles):
                state = detect_state(angles)

        exercise_types.add(state)
        for exercise in counters:
            counters[exercise].update(state, time.time())

        current_exercise = state if state in met_values else None
        if current_exercise:
            if calorie_tracker['start_time'] is None:
                calorie_tracker['start_time'] = time.time()
            duration_hours = (time.time() - calorie_tracker['start_time']) / 3600
            calorie_tracker['calories'] += met_values[current_exercise] * weight_kg * duration_hours
            calorie_tracker['start_time'] = time.time()
        else:
            calorie_tracker['start_time'] = None

        return {
            'calories': round(calorie_tracker['calories'], 2),
            'exercise_types_count': len(exercise_types),
            'current_state': current_exercise or 'None'
        }

def process_video(video_path, weight_kg=75):
    cap = None
    out = None
    try:
        if not os.path.exists(video_path):
            raise FileNotFoundError(f"Video file {video_path} not found")

        met_values = {
            'Squats': 5,
            'Push Ups': 2,
            'Jumping Jacks': 8,
            'Pull-ups': 6,
            'Russian Twists': 4
        }
        counters = {
            'Squats': Counter(),
            'Push Ups': Counter(),
            'Jumping Jacks': Counter(),
            'Pull-ups': Counter(),
            'Russian Twists': Counter()
        }
        calorie_tracker = {'calories': {}, 'start_time': None}
        exercise_types = set()

        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise RuntimeError(f"Could not open video {video_path}")

        fps = int(cap.get(cv2.CAP_PROP_FPS)) or 30
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 10000
        logger.info(f"Video: {video_path}, FPS: {fps}, Resolution: {width}x{height}, Frames: {total_frames}")

        output_path = os.path.join(app.config['UPLOAD_FOLDER'], 'output.mp4')
        out = cv2.VideoWriter(output_path, cv2.VideoWriter_fourcc(*'mp4v'), fps, (width, height))
        if not out.isOpened():
            raise RuntimeError("Could not create output video")

        frame_count = 0
        with mp_pose.Pose(min_detection_confidence=1.0, min_tracking_confidence=1.0) as pose:
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    logger.info(f"End of video at frame {frame_count}")
                    break

                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                results = pose.process(frame_rgb)
                frame_bgr = cv2.cvtColor(frame_rgb, cv2.COLOR_RGB2BGR)

                state = 'Idle'
                current_exercise = None
                if results.pose_landmarks:
                    mp_drawing.draw_landmarks(frame_bgr, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)
                    angles = get_angles(results.pose_landmarks.landmark, mp_pose)
                    if all(a != 0 for a in angles):
                        state = detect_state(angles)
                        logger.debug(f"Frame {frame_count}: State = {state}")

                exercise_types.add(state)

                for exercise in counters:
                    counters[exercise].update(state, time.time())

                current_exercise = state if state in met_values else None
                if current_exercise:
                    if calorie_tracker['start_time'] is None:
                        calorie_tracker['start_time'] = time.time()
                    duration_hours = (time.time() - calorie_tracker['start_time']) / 3600
                    calorie_tracker['calories'] += met_values[current_exercise] * weight_kg * duration_hours
                    calorie_tracker['start_time'] = time.time()
                else:
                    calorie_tracker['start_time'] = None

                cv2.putText(frame_bgr, f'Exercise: {current_exercise or "None"}', (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                cv2.putText(frame_bgr, f'Calories: {calorie_tracker["calories"]:.2f}', (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                out.write(frame_bgr)
                frame_count += 1

        results_data = {
            'calories': round(calorie_tracker['calories'], 2),
            'exercise_types_count': len(exercise_types)
        }
        with open('results.json', 'w') as f:
            json.dump(results_data, f)
        logger.info(f"Results saved to results.json: {results_data}")

        return results_data

    except Exception as e:
        logger.error(f"Error processing {video_path}: {e}")
        return None
    finally:
        if cap is not None:
            cap.release()
        if out is not None:
            out.release()
        if os.path.exists(os.path.join(app.config['UPLOAD_FOLDER'], 'output.mp4')):
            try:
                os.remove(os.path.join(app.config['UPLOAD_FOLDER'], 'output.mp4'))
            except Exception as e:
                logger.error(f"Error removing output.mp4: {e}")

@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/health')
def health_check():
    logger.info("Health check endpoint called")
    return jsonify({'status': 'ok'})

@app.route('/detect', methods=['POST', 'OPTIONS'])
def detect_exercise():
    if request.method == 'OPTIONS':
        logger.info("Received OPTIONS request for /detect")
        return '', 204
    logger.info("Received /detect request")
    try:
        if 'video' not in request.files:
            logger.error("No video file provided")
            return jsonify({'error': 'No video file provided'}), 400
        file = request.files['video']
        filename = secure_filename(file.filename)
        video_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(video_path)
        logger.info(f"Video saved: {video_path}")

        result = process_video(video_path)
        os.remove(video_path)

        if result is None:
            logger.error("Video processing failed")
            return jsonify({'error': 'Video processing failed'}), 500

        return jsonify(result)
    except Exception as e:
        logger.error(f"Error in /detect: {str(e)}")
        if 'video_path' in locals() and os.path.exists(video_path):
            os.remove(video_path)
        return jsonify({'error': str(e)}), 500

@app.route('/live', methods=['POST', 'OPTIONS'])
def process_live_frame():
    if request.method == 'OPTIONS':
        logger.info("Received OPTIONS request for /live")
        return '', 204
    logger.info("Received live frame")
    try:
        data = request.form.get('frame')
        weight_kg = float(request.form.get('weight', 75))
        if not data:
            return jsonify({'error': 'No frame data provided'}), 400

        img_data = base64.b64decode(data.split(',')[1])
        img = Image.open(BytesIO(img_data))
        frame = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

        session_id = request.form.get('session_id', str(time.time()))
        if not hasattr(app, 'live_state'):
            app.live_state = {}
        if session_id not in app.live_state:
            app.live_state[session_id] = {
                'calorie_tracker': {'calories': 0, 'start_time': None},
                'exercise_types': set(),
                'counters': {
                    'Squats': Counter(),
                    'Push Ups': Counter(),
                    'Jumping Jacks': Counter(),
                    'Pull-ups': Counter(),
                    'Russian Twists': Counter()
                },
                'met_values': {
                    'Squats': 5,
                    'Push Ups': 8,
                    'Jumping Jacks': 8,
                    'Pull-ups': 6,
                    'Russian Twists': 4
                }
            }

        state = app.live_state[session_id]
        result = process_frame(
            frame,
            state['calorie_tracker'],
            state['exercise_types'],
            state['counters'],
            state['met_values'],
            weight_kg=weight_kg
        )

        return jsonify(result)
    except Exception as e:
        logger.error(f"Error in /live: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/stop_live', methods=['POST', 'OPTIONS'])
def stop_live():
    if request.method == 'OPTIONS':
        logger.info("Received OPTIONS request for /stop_live")
        return '', 204
    logger.info("Received stop live request")
    try:
        session_id = request.form.get('session_id')
        if not session_id or not hasattr(app, 'live_state') or session_id not in app.live_state:
            return jsonify({'error': 'Invalid or missing session ID'}), 400

        state = app.live_state.pop(session_id)
        results_data = {
            'calories': round(state['calorie_tracker']['calories'], 2),
            'exercise_types_count': len(state['exercise_types'])
        }
        with open('results.json', 'w') as f:
            json.dump(results_data, f)
        logger.info(f"Live session stopped, results saved: {results_data}")

        return jsonify(results_data)
    except Exception as e:
        logger.error(f"Error in /stop_live: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    logger.info(f"Starting Flask app on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)