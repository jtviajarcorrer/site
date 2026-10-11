import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient.js';
import { EXPEDITIONS as STATIC_EXPEDITIONS } from './data/expeditions.js';
import HomePage from './pages/HomePage.jsx';
import ExpeditionPage from './pages/ExpeditionPage.jsx';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [expeditions, setExpeditions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handlePop = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePop);
    
    // Fetch data from Supabase
    async function fetchExpeditions() {
      const { data, error } = await supabase.from('expeditions').select('*');
      if (!error && data && data.length > 0) {
        setExpeditions(data);
      } else {
        setExpeditions(STATIC_EXPEDITIONS); // fallback
      }
      setLoading(false);
    }
    fetchExpeditions();

    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route matching
  const slug = currentPath.replace(/^\//, '').replace(/\/$/, '');
  const expedition = slug ? expeditions.find(e => e.slug === slug) : null;

  if (loading) {
    return <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Carregando expedições...</div>;
  }

  if (expedition) {
    return <ExpeditionPage expedition={expedition} navigate={navigate} />;
  }

  return <HomePage expeditions={expeditions} navigate={navigate} />;
}
