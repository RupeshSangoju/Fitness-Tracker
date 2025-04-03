import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  const [token, setToken] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check for existing token if needed (e.g., from localStorage)
  }, []);

  return (
    <AnimatePresence mode="wait">
      {token ? (
        <DashboardPage token={token} setToken={setToken} message={message} setMessage={setMessage} />
      ) : (
        <LoginPage setToken={setToken} message={message} setMessage={setMessage} />
      )}
    </AnimatePresence>
  );
}

export default App;