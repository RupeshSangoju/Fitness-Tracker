import { motion } from 'framer-motion';
const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'


function WorkoutForm({ exercise, setExercise, reps, setReps, sets, setSets, weight, setWeight, handleWorkoutSubmit }) {
  return (
    <motion.div 
      initial={{ scale: 0.9 }} 
      animate={{ scale: 1 }} 
      transition={{ duration: 0.3 }} 
      className="bg-white p-6 rounded-xl shadow-lg mb-6 border-l-4 border-green-500"
    >
      <h3 className="text-2xl font-bold mb-4 text-green-700">Log a Workout</h3>
      <form onSubmit={handleWorkoutSubmit} className="flex gap-4 flex-wrap">
        <input 
          type="text" 
          placeholder="Exercise" 
          value={exercise} 
          onChange={(e) => setExercise(e.target.value)} 
          className="p-3 border rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none bg-green-50"
        />
        <input 
          type="number" 
          placeholder="Reps" 
          value={reps} 
          onChange={(e) => setReps(e.target.value)} 
          className="p-3 border rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none bg-green-50"
        />
        <input 
          type="number" 
          placeholder="Sets" 
          value={sets} 
          onChange={(e) => setSets(e.target.value)} 
          className="p-3 border rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none bg-green-50"
        />
        <input 
          type="number" 
          placeholder="Weight (kg)" 
          value={weight} 
          onChange={(e) => setWeight(e.target.value)} 
          className="p-3 border rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none bg-green-50"
        />
        <motion.button 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }} 
          type="submit" 
          className="bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          Log
        </motion.button>
      </form>
    </motion.div>
  );
}

export default WorkoutForm;