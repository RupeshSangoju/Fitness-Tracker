import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useState, useEffect } from 'react';
const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'


function ProfileSidebar({ profile, setProfile, token, showProfilePrompt, setShowProfilePrompt, setMessage, setIsMinimized }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageSrc, setImageSrc] = useState(profile.profilePic || 'https://placehold.co/64x64?text=No+Image');

  useEffect(() => {
    console.log('Profile prop changed, setting imageSrc to:', profile.profilePic);
    setImageSrc(profile.profilePic || 'https://placehold.co/64x64?text=No+Image');
  }, [profile.profilePic]);

  useEffect(() => {
    setIsMinimized(!isExpanded);
  }, [isExpanded, setIsMinimized]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedProfile = { ...profile };
      await axios.put(`${backendUrl}/profile`, updatedProfile, {
        headers: { Authorization: token }
      });
      setProfile(updatedProfile);
      setMessage('Profile updated!');
      setShowProfilePrompt(false);
      setIsExpanded(false);
    } catch (error) {
      setMessage('Failed to update profile');
    }
  };

  const sidebarVariants = {
    collapsed: { 
      width: '64px', 
      height: '64px', 
      borderRadius: '50%', 
      padding: 0, 
      transition: { type: 'spring', stiffness: 300, damping: 25 } 
    },
    expanded: { 
      width: '100%', 
      height: 'auto', 
      borderRadius: '16px', 
      padding: '1.5rem', 
      transition: { type: 'spring', stiffness: 300, damping: 25 } 
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeInOut' } }
  };

  const placeholderImage = 'https://placehold.co/64x64?text=No+Image';

  return (
    <motion.div
      initial="collapsed"
      animate={isExpanded ? 'expanded' : 'collapsed'}
      variants={sidebarVariants}
      className="bg-white shadow-lg flex flex-col items-center overflow-hidden"
      style={{ maxWidth: '300px' }}
    >
      <motion.div
        whileHover={{ scale: 1.05, boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)' }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="cursor-pointer w-16 h-16 rounded-full overflow-hidden"
      >
        <img
          src={imageSrc}
          alt="Profile"
          className="w-full h-full object-cover rounded-full"
          onError={(e) => {
            console.log('Image failed to load:', profile.profilePic);
            setImageSrc(placeholderImage);
            console.log('Switched to placeholder:', placeholderImage);
          }}
          onLoad={() => console.log('Image loaded successfully:', imageSrc)}
        />
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={contentVariants}
            className="w-full mt-4"
          >
            <h3 className="text-2xl font-bold text-blue-700 mb-4 text-center">Your Profile</h3>
            {showProfilePrompt ? (
              <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4 w-full">
                <input
                  type="number"
                  placeholder="Weight (kg)"
                  value={profile.weight}
                  onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none bg-blue-50"
                />
                <input
                  type="number"
                  placeholder="Target Calories"
                  value={profile.targetCalories}
                  onChange={(e) => setProfile({ ...profile, targetCalories: e.target.value })}
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none bg-blue-50"
                />
                <input
                  type="text"
                  placeholder="Profile Picture URL (e.g., https://example.com/image.jpg)"
                  value={profile.profilePic}
                  onChange={(e) => setProfile({ ...profile, profilePic: e.target.value })}
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none bg-blue-50"
                />
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)' }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="bg-blue-600 text-white p-3 rounded-lg shadow-lg"
                >
                  Save Profile
                </motion.button>
              </form>
            ) : (
              <div className="text-gray-700 text-center">
                <p><span className="font-semibold">Weight:</span> {profile.weight} kg</p>
                <p><span className="font-semibold">Target Calories:</span> {profile.targetCalories}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default ProfileSidebar;