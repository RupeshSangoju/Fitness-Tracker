import { motion } from 'framer-motion';
import axios from 'axios';
const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'


function WorkoutList({ workouts, filter, setFilter, fetchWorkouts, token }) {
  const handleDelete = async (workoutId) => {
    try {
      await axios.delete(`${backendUrl}/workouts/${workoutId}`, {
        headers: { Authorization: token }
      });
      fetchWorkouts(); // Refresh workouts after deletion
    } catch (error) {
      console.error('Failed to delete workout:', error);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5, delay: 0.4 }} 
      className="bg-white p-6 rounded-xl shadow-lg mb-6 border-l-4 border-pink-500"
    >
      <h3 className="text-2xl font-bold mb-4 text-pink-700">Your Workouts</h3>
      <div className="flex gap-4 flex-wrap mb-4">
        <input 
          type="date" 
          value={filter.startDate} 
          onChange={(e) => setFilter({ ...filter, startDate: e.target.value })} 
          className="p-2 border rounded-lg focus:ring-2 focus:ring-pink-400 focus:outline-none bg-pink-50"
        />
        <input 
          type="date" 
          value={filter.endDate} 
          onChange={(e) => setFilter({ ...filter, endDate: e.target.value })} 
          className="p-2 border rounded-lg focus:ring-2 focus:ring-pink-400 focus:outline-none bg-pink-50"
        />
        <input 
          type="text" 
          placeholder="Filter by exercise" 
          value={filter.exercise} 
          onChange={(e) => setFilter({ ...filter, exercise: e.target.value })} 
          className="p-2 border rounded-lg focus:ring-2 focus:ring-pink-400 focus:outline-none bg-pink-50"
        />
        <motion.button 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }} 
          onClick={fetchWorkouts} 
          className="bg-pink-600 text-white p-2 rounded-lg hover:bg-pink-700 transition-colors"
        >
          Apply Filter
        </motion.button>
      </div>
      <ul className="space-y-2">
        {workouts.map(w => (
          <motion.li 
            key={w._id} 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.3 }} 
            className="text-gray-700 hover:bg-pink-50 p-2 rounded flex justify-between items-center"
          >
            <span>{w.exercise} - {w.reps} reps, {w.sets} sets, {w.calories} cal ({new Date(w.date).toLocaleDateString()})</span>
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }} 
              onClick={() => handleDelete(w._id)} 
              className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
            >
              Delete
            </motion.button>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

export default WorkoutList;