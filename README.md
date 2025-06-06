# Fitness Tracker

A modern, full-stack web application for tracking workouts, monitoring fitness progress, and enhancing your exercise experience with AI-powered features. Built with React, Node.js, MongoDB, and a Python-based computer vision service, Fitness Tracker offers a user-friendly dashboard to log workouts, analyze progress, detect exercises via video, and enjoy motivational features like Spotify playlists and streaks.

🌐 **Live Demo**: [https://fitness-trackery.netlify.app](https://fitness-trackery.netlify.app)

## Features

- **Workout Logging**: Log exercises with details like reps, sets, and weight, with real-time feedback via toast notifications.
- **Exercise Detection**: Upload videos to detect exercises (e.g., squats, push-ups) and estimate calories burned using a Python-based computer vision service.
- **Progress Tracking**: Visualize calories burned over time (day, week, month) with interactive charts powered by Chart.js.
- **Customizable Dashboard**: Toggle widgets (workout form, progress, recommendations, etc.) to personalize your experience.
- **Spotify Integration**: Embed workout playlists to keep you motivated during sessions.
- **Profile Management**: Update weight, target calories, and profile picture, with a dynamic sidebar that expands/collapses.
- **Leaderboards**: View top users based on workout activity, fostering community engagement.
- **Streaks & Rewards**: Track daily workout streaks and earn rewards for consistency (e.g., 5-day streak bonus).
- **Premium Dialog**: Learn about premium features like live camera calorie counting and ad-free experience.
- **Responsive Design**: Optimized for desktop and mobile using Tailwind CSS and Framer Motion animations.

## Tech Stack

### Frontend
- **React**: Component-based UI with hooks for state management.
- **Tailwind CSS**: Utility-first CSS for styling.
- **Framer Motion**: Smooth animations and transitions.
- **Chart.js**: Interactive charts for progress visualization.
- **React Toastify**: Notifications for user feedback.
- **Axios**: HTTP requests to the backend.
- **Netlify**: Hosting and deployment.

### Backend
- **Node.js & Express**: RESTful API for user management, workouts, and recommendations.
- **MongoDB**: NoSQL database for storing user profiles, workouts, and progress.
- **Mongoose**: MongoDB object modeling.
- **JWT**: Token-based authentication.
- **Bcrypt**: Password hashing.
- **Render**: Hosting and deployment.

### Machine Learning and Computer Vision Service
- **Machine Learning Model**: Random Forest algorithm trained on a curated fitness dataset for predictive analytics and performance optimization.
- **Python & Flask**: AI-powered exercise detection via video analysis.
- **OpenCV**: Video processing for detecting movements.
- **Render**: Hosting the CV service.


## Getting Started

### Prerequisites
- **Node.js** (v14+)
- **npm** (v6+)
- **Python** (3.8+)
- **MongoDB Atlas** account
- **Netlify** account
- **Render** account

## Installation

1. **Clone the Repository**
   git clone https://github.com/RupeshSangoju/Fitness-Tracker.git
   cd Fitness-Tracker

2. **Frontend Setup**
    cd client
    npm install

    *Create a .env file in client/:*
    REACT_APP_API_URL=************
    REACT_APP_BACKEND_URL=************
    REACT_APP_CV_SERVICE_URL=************

3. **Backend Setup**
    cd ..
    npm install

    *Create a .env file in server/:*
    MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/fitness-tracker
    JWT_SECRET=<your-secret>
    PORT=5000
    CV_SERVICE_URL=******

4. **CV Service Setup**
    cd ../cv-service
    python -m venv .venv
    source .venv/bin/activate  # Windows: .venv\Scripts\activate
    pip install -r requirements.txt

    Update app.py with any necessary environment variables.

## Running Locally

1. **Start the Backend**
    cd server
    npm start
     
     Backend runs at http://localhost:5000

2. **Start the CV Service**
    cd cv-service
    source .venv/bin/activate
    python app.py

    CV service runs at http://localhost:5001

3. **Start the Frontend**
    cd client
    npm start

    Frontend runs at http://localhost:3000.

4. **Build and Serve Production**
    cd client
    npm run build
    npx serve -s build

## Deployment

1. **Frontend (Netlify)**
    Push client/ to a GitHub repository.

    Connect the repository to Netlify.

    Set environment variables in Netlify:

        REACT_APP_API_URL

        REACT_APP_BACKEND_URL

        REACT_APP_CV_SERVICE_URL

    Configure build settings:

        Build command: npm run build

        Publish directory: client/build

    Deploy: https://fitness-trackery.netlify.app

2. **Backend (Render)**

    Push server/ to a GitHub repository.

    Create a Render Web Service, linking the repository.

    Set environment variables in Render:

        MONGO_URI

        JWT_SECRET

        PORT

        CV_SERVICE_URL

    Deploy: https://fitness-tracker-5zbc.onrender.com

3. **CV Service (Render)**

    Push cv-service/ to a GitHub repository.

    Create a Render Web Service.

    Set environment variables as needed.

    Deploy: https://fitness-tracker-cv-service.onrender.com

## Usage

- **Sign Up/Login:**Create an account or log in with credentials (e.g., email: 11@gmail.com, password: 11).

- **Complete Profile**: Set weight, target calories, and profile picture.

- **Log Workouts**: Use the workout form to track exercises.

- **Upload Videos**: Detect exercises and estimate calories via video uploads.

- **Explore Dashboard**: Customize widgets, view progress, enjoy Spotify playlists, and track streaks.

- **Engage with Community**: Check leaderboards and connect with other users.

## Contributing

Contributions are welcome! Please follow these steps:

    Fork the repository.

    Create a feature branch (git checkout -b feature/YourFeature).

    Commit changes (git commit -m 'Add YourFeature').

    Push to the branch (git push origin feature/YourFeature).

    Open a Pull Request.

## License

This project is licensed under the MIT License.

## Contact

For questions or feedback, reach out to me rupeshbabu.sangoju@gmail.com.

Built with ❤️💪 by Rupesh Babu 



























