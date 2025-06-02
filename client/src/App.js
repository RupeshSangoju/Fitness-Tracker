import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersList from './components/UsersList'; // Adjust if page
import Progress from './components/Progress'; // Adjust if page

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check for existing token
    if (localStorage.getItem('token')) {
      setToken(localStorage.getItem('token'));
    }
  }, []);

  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route
          path="/login"
          element={<LoginPage setToken={setToken} message={message} setMessage={setMessage} />}
        />
        <Route
          path="/dashboard"
          element={<DashboardPage token={token} setToken={setToken} message={message} setMessage={setMessage} />}
        />
        <Route
          path="/friends"
          element={<UsersList token={token} />} // Adjust props if needed
        />
        <Route
          path="/progress"
          element={<Progress token={token} />} // Adjust props if needed
        />
        <Route
          path="/"
          element={<LoginPage setToken={setToken} message={message} setMessage={setMessage} />}
        />
      </Routes>
    </AnimatePresence>
  );
}

export default App;