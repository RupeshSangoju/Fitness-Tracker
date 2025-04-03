import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

function LoginPage({ setToken, message, setMessage }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(false);
  const [profile, setProfile] = useState({ weight: '', targetCalories: '', profilePic: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isLogin ? `${backendUrl}/login` : `${backendUrl}/signup`;
    const payload = isLogin 
      ? { email, password } 
      : { name, email, password, ...profile };
    
    try {
      const response = await axios.post(url, payload); // Define response here
      if (isLogin) {
        setMessage('Login successful!');
        setToken(response.data.token); // Use response now that it’s defined
      } else {
        setMessage('Account created! Please log in.');
        setName('');
        setEmail('');
        setPassword('');
        setProfile({ weight: '', targetCalories: '', profilePic: '' });
        setIsLogin(true);
      }
    } catch (error) {
      setMessage(error.response?.data || 'Something went wrong!');
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -50, transition: { duration: 0.5 } }
  };

  return (
    <motion.div 
      variants={pageVariants} 
      initial="initial" 
      animate="animate" 
      exit="exit" 
      className="w-full min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 flex items-center justify-center p-6 relative overflow-hidden"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Rest of your JSX remains unchanged */}
      <div className="absolute inset-0 bg-black opacity-50 z-0"></div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.5 }} 
        animate={{ opacity: 0.3, scale: 1 }} 
        transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }} 
        className="absolute top-10 left-10 w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center z-10"
      >
        <span className="text-white text-2xl">🏋️</span>
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.5 }} 
        animate={{ opacity: 0.3, scale: 1 }} 
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }} 
        className="absolute bottom-10 right-10 w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center z-10"
      >
        <span className="text-white text-2xl">🏃</span>
      </motion.div>
      <div className="relative z-20 bg-white bg-opacity-90 p-8 rounded-xl shadow-lg w-full max-w-lg">
        <h1 className="text-4xl font-extrabold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
          Fitness Tracker
        </h1>
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">{isLogin ? 'Login' : 'Sign Up'}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <>
              <motion.input 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.3 }} 
                type="text" 
                placeholder="Name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="p-3 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none bg-purple-50"
              />
              <motion.input 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.3, delay: 0.1 }} 
                type="number" 
                placeholder="Weight (kg)" 
                value={profile.weight} 
                onChange={(e) => setProfile({ ...profile, weight: e.target.value })} 
                className="p-3 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none bg-purple-50"
              />
              <motion.input 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.3, delay: 0.2 }} 
                type="number" 
                placeholder="Target Calories" 
                value={profile.targetCalories} 
                onChange={(e) => setProfile({ ...profile, targetCalories: e.target.value })} 
                className="p-3 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none bg-purple-50"
              />
              <motion.input 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.3, delay: 0.25 }} 
                type="text" 
                placeholder="Profile Picture URL (e.g., https://example.com/image.jpg)" 
                value={profile.profilePic} 
                onChange={(e) => setProfile({ ...profile, profilePic: e.target.value })} 
                className="p-3 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none bg-purple-50"
              />
            </>
          )}
          <motion.input 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.3, delay: isLogin ? 0 : 0.3 }} 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="p-3 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none bg-purple-50"
          />
          <motion.input 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.3, delay: isLogin ? 0.1 : 0.4 }} 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="p-3 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none bg-purple-50"
          />
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }} 
            type="submit" 
            className="bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </motion.button>
        </form>
        <motion.button 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }} 
          onClick={() => setIsLogin(!isLogin)} 
          className="bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition-colors mt-4 w-full"
        >
          {isLogin ? 'Need to sign up?' : 'Already have an account? Login'}
        </motion.button>
        {message && (
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="text-center mt-4 text-red-500 font-semibold"
          >
            {message}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}

export default LoginPage;