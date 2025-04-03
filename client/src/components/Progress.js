import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler, // Add Filler plugin
} from 'chart.js';

// Register all components, including Filler
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);
function Progress({ progress, workouts }) {
  const chartRef = useRef(null); // Ref to hold the canvas element
  const chartInstanceRef = useRef(null); // Ref to hold the Chart.js instance

  useEffect(() => {
    // Cleanup function to destroy chart instance on unmount or update
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [workouts]);

  if (!progress || !workouts.length) return null;

  const chartData = {
    labels: workouts.map(w => new Date(w.date).toLocaleDateString()), // Workout dates as labels
    datasets: [{
      label: 'Calories Burned',
      data: workouts.map(w => w.calories), // Calorie data
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
      fill: true, // Keep fill option
    }],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
    },
    scales: {
      x: {
        type: 'category',
        title: { display: true, text: 'Date' },
      },
      y: {
        title: { display: true, text: 'Calories' },
      },
    },
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5, delay: 0.2 }} 
      className="bg-white p-6 rounded-xl shadow-lg mb-6 border-l-4 border-yellow-500"
    >
      <h3 className="text-2xl font-bold mb-4 text-yellow-700">Progress</h3>
      <p className="text-gray-700">Total Workouts: <span className="font-semibold">{progress.totalWorkouts}</span></p>
      <p className="text-gray-700">Total Calories: <span className="font-semibold">{progress.totalCalories}</span></p>
      <p className="text-gray-700">Avg Calories/Workout: <span className="font-semibold">{progress.avgCalories}</span></p>
      <div style={{ position: 'relative', height: '300px', width: '100%' }}>
        <Line
          ref={chartRef}
          data={chartData}
          options={options}
          // Removed getDatasetAtEvent prop
        />
      </div>
    </motion.div>
  );
}

export default Progress;