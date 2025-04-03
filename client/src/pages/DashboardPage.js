import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileSidebar from '../components/ProfileSidebar';
import WorkoutForm from '../components/WorkoutForm';
import Recommendation from '../components/Recommendation';
import Progress from '../components/Progress';
import WorkoutList from '../components/WorkoutList';
import ExerciseLibrary from '../components/ExerciseLibrary';
import UsersList from '../components/UsersList';
const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'


function DashboardPage({ token, setToken, setMessage }) {
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

  const handleWorkoutSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${backendUrl}/workouts`, { exercise, reps, sets, weight }, {
        headers: { Authorization: token }
      });
      setExercise('');
      setReps('');
      setSets('');
      setWeight('');
      fetchWorkouts();
      setStreak(streak + 1);
    } catch (error) {
      setMessage('Failed to save workout');
    }
  };

  const fetchWorkouts = useCallback(async () => {
    try {
      const response = await axios.get(`${backendUrl}/workouts`, { 
        headers: { Authorization: token },
        params: filter
      });
      setWorkouts(response.data);
    } catch (error) {
      setMessage('Failed to fetch workouts');
    }
  }, [token, filter, setMessage]);

  const fetchRecommendation = useCallback(async () => {
    try {
      const response = await axios.get(`${backendUrl}/recommend`, { headers: { Authorization: token } });
      setRecommendation(response.data);
    } catch (error) {
      setMessage('Failed to fetch recommendation');
    }
  }, [token, setMessage]);

  const fetchProgress = useCallback(async () => {
    try {
      const response = await axios.get(`${backendUrl}/progress`, { headers: { Authorization: token } });
      setProgress(response.data);
    } catch (error) {
      setMessage('Failed to fetch progress');
    }
  }, [token, setMessage]);

  const fetchLibrary = useCallback(async () => {
    try {
      const response = await axios.get(`${backendUrl}/library`, { headers: { Authorization: token } });
      setLibrary(response.data);
    } catch (error) {
      setMessage('Failed to fetch library');
    }
  }, [token, setMessage]);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await axios.get(`${backendUrl}/profile`, { headers: { Authorization: token } });
      const { weight, targetCalories, profilePic, _id } = response.data;
      setProfile({
        weight: weight || '',
        targetCalories: targetCalories || '',
        profilePic: profilePic || ''
      });
      setShowProfilePrompt(!weight || !targetCalories);
      setCurrentUserId(_id);
    } catch (error) {
      setMessage('Failed to fetch profile');
      setShowProfilePrompt(true);
    }
  }, [token, setMessage]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get(`${backendUrl}/users`, { headers: { Authorization: token } });
      setUsers(response.data);
    } catch (error) {
      setMessage('Failed to fetch users');
    }
  }, [token, setMessage]);

  useEffect(() => {
    if (token) {
      fetchWorkouts();
      fetchRecommendation();
      fetchProgress();
      fetchLibrary();
      fetchProfile();
      fetchUsers();

      const interval = setInterval(() => {
        fetchUsers();
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [token, fetchWorkouts, fetchRecommendation, fetchProgress, fetchLibrary, fetchProfile, fetchUsers]);

  const pageVariants = {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeInOut' } },
    exit: { opacity: 0, y: -50, transition: { duration: 0.5, ease: 'easeInOut' } }
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)' },
    tap: { scale: 0.95 }
  };

  const dialogVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeInOut' } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.3, ease: 'easeInOut' } }
  };

  const circleVariants = {
    collapsed: { width: '64px', height: '64px', borderRadius: '50%', padding: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
    expanded: { width: '300px', height: 'auto', borderRadius: '16px', padding: '1.5rem', transition: { type: 'spring', stiffness: 300, damping: 25 } }
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
      {/* Left Sidebar */}
      <div className="w-full md:w-1/4 flex flex-col gap-6">
        <ProfileSidebar 
          profile={profile} 
          setProfile={setProfile} 
          token={token} 
          showProfilePrompt={showProfilePrompt} 
          setShowProfilePrompt={setShowProfilePrompt} 
          setMessage={setMessage} 
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
                  allowTransparency="true"
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
                  {Object.keys(showWidgets).map(widget => (
                    <label key={widget} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={showWidgets[widget]}
                        onChange={() => setShowWidgets(prev => ({ ...prev, [widget]: !prev[widget] }))}
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
        {showWidgets.library && <ExerciseLibrary library={library} />}
        <motion.button 
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={() => setToken(null)} 
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
                    <li>Advanced Analytics</li>
                    <li>Expert Guidance</li>
                    <li>Custom Plans</li>
                    <li>Ad-Free</li>
                    <li>E-commerce Access</li>
                  </ul>
                </div>
              </div>
              <p className="mt-4 text-center">Contact <a href="mailto:123@gmail.com" className="text-blue-600 underline">123@gmail.com</a> to subscribe!</p>
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