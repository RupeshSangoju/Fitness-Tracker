import { motion } from 'framer-motion';
const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'


function Recommendation({ recommendation }) {
  if (!recommendation) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }} 
      className="bg-white p-6 rounded-xl shadow-lg mb-6 border-l-4 border-purple-500"
    >
      <h3 className="text-2xl font-bold mb-4 text-purple-700">Recommended Workout</h3>
      <p className="text-gray-700 text-lg">{recommendation.exercise} - {recommendation.reps} reps, {recommendation.sets} sets, {recommendation.weight}kg</p>
    </motion.div>
  );
}

export default Recommendation;