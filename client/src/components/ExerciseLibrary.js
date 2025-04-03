import { motion } from 'framer-motion';

function ExerciseLibrary({ library }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5, delay: 0.6 }} 
      className="bg-white p-6 rounded-xl shadow-lg mb-6 border-l-4 border-teal-500"
    >
      <h3 className="text-2xl font-bold mb-4 text-teal-700">Exercise Library</h3>
      <ul className="space-y-2">
        {library.map((e, i) => (
          <motion.li 
            key={i} 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.3 }} 
            className="text-gray-700 hover:bg-teal-50 p-2 rounded flex items-center"
          >
            <img src={e.demo} alt={e.name} className="w-12 h-12 mr-2 rounded" />
            <span>{e.name}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

export default ExerciseLibrary;