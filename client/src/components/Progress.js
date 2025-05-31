import React,{ useEffect, useRef } from 'react';
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
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

function Progress({ progress, workouts }) {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [timePeriod, setTimePeriod] = React.useState('day');

  useEffect(() => {
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, []);

  if (!progress || !progress.labels || !progress.labels.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white p-6 rounded-xl shadow-lg mb-6 border-l-4 border-yellow-500"
      >
        <h3 className="text-2xl font-bold mb-4 text-yellow-700">Progress</h3>
        <p className="text-gray-700">No workout data available</p>
      </motion.div>
    );
  }

  // Aggregate data based on time period
  const aggregateData = () => {
    const dataMap = new Map();
    progress.labels.forEach((label, index) => {
      const date = new Date(label);
      let key;
      if (timePeriod === 'day') {
        key = date.toLocaleDateString();
      } else if (timePeriod === 'week') {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        key = startOfWeek.toLocaleDateString();
      } else if (timePeriod === 'month') {
        key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      }
      const calories = (dataMap.get(key) || 0) + (progress.calories[index] || 0);
      dataMap.set(key, calories);
    });

    const labels = Array.from(dataMap.keys());
    const data = Array.from(dataMap.values());
    return { labels, data };
  };

  const { labels, data } = aggregateData();

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Calories Burned',
        data,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: `Calories Burned by ${timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)}` },
    },
    scales: {
      x: {
        title: { display: true, text: timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1) },
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
      <p className="text-gray-700">
        Total Workouts: <span className="font-semibold">{progress.totalWorkouts || workouts.length}</span>
      </p>
      <p className="text-gray-700">
        Total Calories: <span className="font-semibold">{progress.totalCalories || data.reduce((sum, val) => sum + val, 0)}</span>
      </p>
      <p className="text-gray-700">
        Avg Calories/Workout:{' '}
        <span className="font-semibold">
          {progress.totalWorkouts ? (progress.totalCalories / progress.totalWorkouts).toFixed(1) : 0}
        </span>
      </p>
      <div className="mb-4">
        <label className="mr-2">View by:</label>
        <select
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value)}
          className="p-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none bg-yellow-50"
        >
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
        </select>
      </div>
      <div style={{ position: 'relative', height: '300px', width: '100%' }}>
        <Line
          ref={(el) => {
            chartRef.current = el;
            if (el) chartInstanceRef.current = el;
          }}
          data={chartData}
          options={options}
        />
      </div>
    </motion.div>
  );
}

export default Progress;