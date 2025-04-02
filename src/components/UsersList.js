import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import axios from 'axios';

function UsersList({ users, currentUserId, setIsMinimized, token }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [friendRequest, setFriendRequest] = useState('');
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [message, setMessage] = useState('');

  const fetchFriends = async () => {
    try {
      const response = await axios.get(`${backendUrl}/friends`, {
        headers: { Authorization: token }
      });
      setFriends(response.data);
    } catch (error) {
      setMessage('Failed to fetch friends');
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const response = await axios.get(`${backendUrl}/friends/requests`, {
        headers: { Authorization: token }
      });
      setFriendRequests(response.data);
    } catch (error) {
      setMessage('Failed to fetch friend requests');
    }
  };

  useEffect(() => {
    setIsMinimized(!isExpanded);
    if (token) {
      fetchFriends();
      fetchFriendRequests();
    }
  }, [isExpanded, setIsMinimized, token]);

  const sendFriendRequest = async () => {
    try {
      await axios.post(`${backendUrl}/friends/request`, { friendName: friendRequest }, {
        headers: { Authorization: token }
      });
      setMessage(`Friend request sent to ${friendRequest}`);
      setFriendRequest('');
      fetchFriends();
    } catch (error) {
      setMessage('Failed to send friend request');
    }
  };

  const acceptFriendRequest = async (friendId) => {
    try {
      await axios.post(`${backendUrl}/friends/accept`, { friendId }, {
        headers: { Authorization: token }
      });
      setMessage('Friend request accepted');
      fetchFriends();
      fetchFriendRequests();
    } catch (error) {
      setMessage('Failed to accept friend request');
    }
  };

  const listVariants = {
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

  const worldwideLeaderboard = [...users].sort((a, b) => (b.progress?.caloriesBurned || 0) - (a.progress?.caloriesBurned || 0));
  const friendsLeaderboard = friends.sort((a, b) => (b.progress?.caloriesBurned || 0) - (a.progress?.caloriesBurned || 0));

  return (
    <motion.div
      initial="collapsed"
      animate={isExpanded ? 'expanded' : 'collapsed'}
      variants={listVariants}
      className="bg-white shadow-lg flex flex-col items-center overflow-hidden"
      style={{ maxWidth: '300px' }}
    >
      <motion.div
        whileHover={{ scale: 1.05, boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)' }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="cursor-pointer w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center"
      >
        <span className="text-2xl">👥</span>
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
            <h3 className="text-2xl font-bold text-blue-700 mb-4 text-center">Challenge the Best</h3>

            {/* Friends Leaderboard */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-700 mb-2">Friends Leaderboard</h4>
              <ul className="space-y-2 max-h-40 overflow-y-auto">
                {friendsLeaderboard.map(user => (
                  <li 
                    key={user._id} 
                    className={`p-2 rounded-lg flex items-center gap-2 ${user._id === currentUserId ? 'bg-blue-100 text-blue-700 font-semibold' : 'bg-gray-100'}`}
                  >
                    <img
                      src={user.profile.profilePic || 'https://placehold.co/32x32?text=No+Image'}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                      onError={e => e.target.src = 'https://placehold.co/32x32?text=No+Image'}
                    />
                    <div>
                      <span>{user.name}</span>
                      <span className="block text-sm text-gray-600">
                        Calories: {user.progress?.caloriesBurned || 0} cal
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  placeholder="Friend's username"
                  value={friendRequest}
                  onChange={(e) => setFriendRequest(e.target.value)}
                  className="p-2 border rounded-lg flex-1"
                />
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={sendFriendRequest}
                  className="bg-blue-600 text-white p-2 rounded-lg"
                >
                  Send
                </motion.button>
              </div>
              {/* Friend Requests */}
              {friendRequests.length > 0 && (
                <div className="mt-2">
                  <h5 className="text-sm font-semibold text-gray-700">Pending Requests</h5>
                  {friendRequests.map(request => (
                    <div key={request._id} className="flex justify-between items-center p-1">
                      <span>{request.name}</span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => acceptFriendRequest(request._id)}
                        className="bg-green-600 text-white p-1 rounded-lg text-sm"
                      >
                        Accept
                      </motion.button>
                    </div>
                  ))}
                </div>
              )}
              {message && <p className="text-sm text-green-600 mt-2">{message}</p>}
            </div>

            {/* Worldwide Leaderboard */}
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-2">Worldwide Leaderboard</h4>
              <ul className="space-y-2 max-h-40 overflow-y-auto">
                {worldwideLeaderboard.map(user => (
                  <li 
                    key={user._id} 
                    className={`p-2 rounded-lg flex items-center gap-2 ${user._id === currentUserId ? 'bg-blue-100 text-blue-700 font-semibold' : 'bg-gray-100'}`}
                  >
                    <img
                      src={user.profile.profilePic || 'https://placehold.co/32x32?text=No+Image'}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                      onError={e => e.target.src = 'https://placehold.co/32x32?text=No+Image'}
                    />
                    <div>
                      <span>{user.name}</span>
                      <span className="block text-sm text-gray-600">
                        Calories: {user.progress?.caloriesBurned || 0} cal
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default UsersList;