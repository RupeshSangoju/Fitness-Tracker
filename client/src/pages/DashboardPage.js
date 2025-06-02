// src/pages/DashboardPage.js
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from 'react-modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../utils/api';
import ProfileSidebar from '../components/ProfileSidebar';
import WorkoutForm from '../components/WorkoutForm';
import Recommendation from '../components/Recommendation';
import Progress from '../components/Progress';
import WorkoutList from '../components/WorkoutList';
import ExerciseLibrary from '../components/ExerciseLibrary';
import UsersList from '../components/UsersList';

function DashboardPage({ token, setToken }) {
  Modal.setAppElement('#root');

  const [exercise, setExercise] = useState('');
  const [reps, setReps] = useState('');
  const [sets, setSets] = useState('');
  const [weight, setWeight] = useState('');
  const [workouts, setWorkouts] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [progress, setProgress] = useState(null);
  const [library, setLibrary] = useState([]);
  const [profile, setProfile] = useState({ weight: '', targetCalories: '', profilePic: '' });
  const [filter, setFilter] = useState({ startDate: '', endDate: '', exercise: '' });
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [streak, setStreak] = useState(0);
  const [isProfileMinimized, setIsProfileMinimized] = useState(true);
  const [isUsersMinimized, setIsUsersMinimized] = useState(true);
  const [showSpotify, setShowSpotify] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [showWidgets, setShowWidgets] = useState({
    workoutForm: true,
    recommendation: true,
    progress: true,
    workoutList: true,
    library: true,
  });
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [video, setVideo] = useState(null);
  const [cameraResult, setCameraResult] = useState(null);

  const handleWorkoutSubmit = async (e) => {
    e.preventDefault();
    if (!exercise || !reps || !sets || reps < 0 || sets < 0 || (weight && weight < 0)) {
      toast.error('Please enter valid workout details');
      return;
    }
    try {
      await api.post('/exercise/log', {
        exercise,
        reps: Number(reps),
        sets: Number(sets),
        weight: weight ? Number(weight) : undefined,
      });
      setExercise('');
      setReps('');
      setSets('');
      setWeight('');
      fetchWorkouts();
      fetchProgress();
      fetchStreak();
      toast.success('Workout logged successfully!');
    } catch (error) {
      console.error('Workout submit error:', error);
      toast.error('Failed to save workout');
    }
  };

  const fetchWorkouts = useCallback(async () => {
    try {
      const response = await api.get('/exercise/workouts', { params: filter });
      setWorkouts(response.data);
    } catch (error) {
      console.error('Fetch workouts error:', error);
      toast.error('Failed to fetch workouts');
    }
  }, [filter]);

  const fetchRecommendation = useCallback(async () => {
    try {
      const response = await api.get('/exercise/grok-recommend');
      setRecommendation(response.data);
    } catch (error) {
      console.error('Fetch recommendation error:', error);
      toast.error('Failed to fetch recommendation');
    }
  }, []);

  const fetchProgress = useCallback(async () => {
    try {
      const response = await api.get('/exercise/progress');
      setProgress(response.data);
    } catch (error) {
      console.error('Fetch progress error:', error);
      toast.error('Failed to fetch progress');
    }
  }, []);

  const fetchLibrary = useCallback(async () => {
    try {
      const response = await api.get('/exercise/library');
      setLibrary(response.data);
    } catch (error) {
      console.error('Fetch library error:', error);
      toast.error('Failed to fetch library');
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await api.get('/user/profile');
      const { weight, targetCalories, profilePic, _id } = response.data;
      setProfile({
        weight: weight || '',
        targetCalories: targetCalories || '',
        profilePic: profilePic || '',
      });
      setShowProfilePrompt(!weight || !targetCalories);
      setCurrentUserId(_id);
    } catch (error) {
      console.error('Fetch profile error:', error);
      toast.error('Failed to fetch profile');
      setShowProfilePrompt(true);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await api.get('/user/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Fetch users error:', error);
      toast.error('Failed to fetch users');
    }
  }, []);

  const fetchStreak = useCallback(async () => {
    try {
      const response = await api.get('/exercise/streak');
      setStreak(response.data.streak);
    } catch (error) {
      console.error('Fetch streak error:', error);
      toast.error('Failed to fetch streak');
    }
  }, []);

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setVideo(file);
    toast.info('Processing video...');

    const formData = new FormData();
    formData.append('video', file);
    formData.append('weight', profile.weight || 75);

    try {
      const { data } = await api.post('/exercise/detect', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 300000,
      });
      toast.success(`Video processed! Calories burned: ${data.calories} kcal`);
      setCameraResult({
        exercise: data.current_state || 'None',
        calories: data.calories || 0,
        exercise_types_count: data.exercise_types_count || 0,
        squat_reps: data.squat_reps || 0,
        pushup_reps: data.pushup_reps || 0,
        jumping_jack_reps: data.jumping_jack_reps || 0,
      });
      setVideo(null);
    } catch (error) {
      console.error('Video upload error:', error);
      toast.error(`Error processing video: ${error.response?.data?.error || error.message}`);
      setCameraResult(null);
      setVideo(null);
    }
  };

  useEffect(() => {
    if (token) {
      fetchWorkouts();
      fetchRecommendation();
      fetchProgress();
      fetchLibrary();
      fetchProfile();
      fetchUsers();
      fetchStreak();
      const interval = setInterval(fetchUsers, 10000);
      return () => clearInterval(interval);
    }
  }, [token, fetchWorkouts, fetchRecommendation, fetchProgress, fetchLibrary, fetchProfile, fetchUsers, fetchStreak]);

  const pageVariants = {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeInOut' } },
    exit: { opacity: 0, y: -50, transition: { duration: 0.5, ease: 'easeInOut' } },
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)' },
    tap: { scale: 0.95 },
  };

  const dialogVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeInOut' } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.3, ease: 'easeInOut' } },
  };

  const circleVariants = {
    collapsed: { width: '64px', height: '64px', borderRadius: '50%', padding: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
    expanded: { width: '300px', height: 'auto', borderRadius: '16px', padding: '1.5rem', transition: { type: 'spring', stiffness: 300, damping: 25 } },
  };

  const allMinimized = isProfileMinimized && isUsersMinimized && !showSpotify && !showCustomize;

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 flex flex-col md:flex-row p-6 relative"
    >
      <ToastContainer position="top-right" autoClose={3000} />
      {/* Left Sidebar */}
      <div className="w-full md:w-1/4 flex flex-col gap-6">
        <ProfileSidebar
          profile={profile}
          setProfile={setProfile}
          token={token}
          showProfilePrompt={showProfilePrompt}
          setShowProfilePrompt={setShowProfilePrompt}
          setMessage={(msg) => toast.info(msg)}
          setIsMinimized={setIsProfileMinimized}
        />
        <UsersList
          users={users}
          currentUserId={currentUserId}
          setIsMinimized={setIsUsersMinimized}
          token={token}
        />
        {/* Spotify Circle */}
        <motion.div
          initial="collapsed"
          animate={showSpotify ? 'expanded' : 'collapsed'}
          variants={circleVariants}
          className="bg-white shadow-lg flex flex-col items-center overflow-hidden"
        >
          <motion.div
            whileHover={{ scale: 1.05, boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSpotify(!showSpotify)}
            className="cursor-pointer w-16 h-16 rounded-full overflow-hidden bg-green-500 flex items-center justify-center"
          >
            <span className="text-white text-2xl">🎵</span>
          </motion.div>
          <AnimatePresence>
            {showSpotify && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full mt-4"
              >
                <h3 className="text-xl font-bold text-green-700 mb-2">Workout Playlist</h3>
                <iframe
                  src="https://open.spotify.com/embed/playlist/37i9dQZF1DX76Wlfdnj7AP"
                  width="100%"
                  height="80"
                  frameBorder="0"
                  allow="encrypted-media"
                  title="Spotify Workout Playlist"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        {/* Customize Circle */}
        <motion.div
          initial="collapsed"
          animate={showCustomize ? 'expanded' : 'collapsed'}
          variants={circleVariants}
          className="bg-white shadow-lg flex flex-col items-center overflow-hidden"
        >
          <motion.div
            whileHover={{ scale: 1.05, boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCustomize(!showCustomize)}
            className="cursor-pointer w-16 h-16 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center"
          >
            <span className="text-white text-2xl">⚙️</span>
          </motion.div>
          <AnimatePresence>
            {showCustomize && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full mt-4"
              >
                <h3 className="text-xl font-bold text-blue-700 mb-2">Customize Dashboard</h3>
                <div className="flex flex-col gap-2">
                  {Object.keys(showWidgets).map((widget) => (
                    <label key={widget} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={showWidgets[widget]}
                        onChange={() => setShowWidgets((prev) => ({ ...prev, [widget]: !prev[widget] }))}
                        className="form-checkbox h-5 w-5 text-blue-600"
                      />
                      <span>{widget.charAt(0).toUpperCase() + widget.slice(1).replace(/([A-Z])/g, ' $1')}</span>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Main Dashboard */}
      <div className={`flex-1 flex flex-col ${allMinimized ? 'w-full max-w-5xl ml-24' : 'md:w-3/4 ml-6'}`}>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Your Fitness Dashboard
          </h1>
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => setShowPremiumDialog(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg shadow-lg"
          >
            Premium
          </motion.button>
        </div>

        {/* Streaks & Rewards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 rounded-lg shadow-lg mb-6"
        >
          <h2 className="text-xl font-bold text-blue-700">Streaks & Rewards</h2>
          <p>Current Streak: {streak} days</p>
          {streak >= 5 && <p className="text-green-600">🎉 Reward: 5-Day Streak Bonus!</p>}
        </motion.div>

        {showWidgets.workoutForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white bg-opacity-90 p-6 rounded-xl shadow-lg mb-6"
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Log Your Workout</h2>
            <WorkoutForm
              exercise={exercise}
              setExercise={setExercise}
              reps={reps}
              setReps={setReps}
              sets={sets}
              setSets={setSets}
              weight={weight}
              setWeight={setWeight}
              handleWorkoutSubmit={handleWorkoutSubmit}
            />
          </motion.div>
        )}
        {showWidgets.recommendation && <Recommendation recommendation={recommendation} />}
        {showWidgets.progress && <Progress progress={progress} workouts={workouts} />}
        {showWidgets.workoutList && (
          <WorkoutList
            workouts={workouts}
            filter={filter}
            setFilter={setFilter}
            fetchWorkouts={fetchWorkouts}
            token={token}
          />
        )}
        {showWidgets.workoutForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white bg-opacity-90 p-6 rounded-xl shadow-lg mb-6"
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Exercise Detection</h2>
            <div className="space-y-4">
              <div>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              {video && (
                <p className="text-gray-700">
                  Uploading: <span className="font-semibold">{video.name}</span>
                </p>
              )}
              {cameraResult && (
                <div className="bg-gray-100 p-4 rounded-lg border-l-4 border-blue-500">
                  <p><strong>Exercise:</strong> {cameraResult.exercise}</p>
                  <p><strong>Calories Burned:</strong> {cameraResult.calories.toFixed(2)} kcal</p>
                  <p><strong>Exercise Types:</strong> {cameraResult.exercise_types_count}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
        {showWidgets.library && <ExerciseLibrary library={library} />}
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={() => {
            setToken(null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }}
          className="bg-red-600 text-white p-3 rounded-lg shadow-lg w-full max-w-xs mx-auto"
        >
          Logout
        </motion.button>
      </div>

      {/* Premium Dialog */}
      <AnimatePresence>
        {showPremiumDialog && (
          <motion.div
            variants={dialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          >
            <div className="bg-white p-6 rounded-lg shadow-2xl max-w-md w-full border-t-4 border-purple-500">
              <h2 className="text-2xl font-bold text-purple-700 mb-4">Go Premium!</h2>
              <div className="grid grid-cols-2 gap-4 text-gray-700">
                <div>
                  <h3 className="font-semibold text-blue-600">Free Version</h3>
                  <ul className="list-disc pl-4">
                    <li>Basic Features</li>
                    <li>Limited Analytics</li>
                    <li>Ads Included</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-purple-600">Premium Version</h3>
                  <ul className="list-disc pl-4">
                    <li>Live Camera Calorie Count</li>
                    <li>Advanced Analytics</li>
                    <li>Expert Guidance</li>
                    <li>Ad-Free</li>
                  </ul>
                </div>
              </div>
              <p className="mt-4 text-center">
                Contact <a href="mailto:123@gmail.com" className="text-blue-600 underline">rupeshbabu.sangoju@gmail.com</a> to subscribe!
              </p>
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => setShowPremiumDialog(false)}
                className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 rounded-lg w-full"
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default DashboardPage;