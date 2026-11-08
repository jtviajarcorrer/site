import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient.js';
import HomePage from './pages/HomePage.jsx';
import ExpeditionPage from './pages/ExpeditionPage.jsx';
import LinksPage from './pages/LinksPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';

// Rola até a seção (#id). Tenta por ~3s porque a página de destino pode demorar a montar.
function scrollToHash(hash, tries = 0) {
  const el = hash ? document.querySelector(hash) : null;
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  else if (tries < 30) setTimeout(() => scrollToHash(hash, tries + 1), 100);
}

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [expeditions, setExpeditions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handlePop = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePop);
    
    // Fonte única: Supabase (alimentado pelo sync-monday). Sem dados de exemplo como plano B.
    async function fetchExpeditions() {
      const { data, error } = await supabase.from('expeditions').select('*').eq('highlight', true);
      if (error) console.error('[expeditions] erro ao buscar no Supabase:', error.message);
      setExpeditions(!error && data ? data : []);
      setLoading(false);
    }
    fetchExpeditions();
    if (window.location.hash) scrollToHash(window.location.hash);

    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const navigate = (path) => {
    const [pathname, hash] = path.split('#');
    const cleanTarget = pathname || '/';
    // Preserva UTMs / fbclid na URL ao navegar internamente entre a Home e uma Landing Page
    const currentSearch = window.location.search || '';
    const finalUrl = `${cleanTarget}${currentSearch}${hash ? '#' + hash : ''}`;
    window.history.pushState({}, '', finalUrl);
    setCurrentPath(cleanTarget);
    if (hash) scrollToHash('#' + hash);
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route matching
  const slug = currentPath.replace(/^\//, '').replace(/\/$/, '').toLowerCase();

  if (slug === 'links' || slug === 'bio' || slug === 'linktree') {
    return <LinksPage expeditions={expeditions} loading={loading} navigate={navigate} />;
  }

  if (slug === 'analytics' || slug === 'gestao' || slug === 'metricas') {
    return <AnalyticsPage expeditions={expeditions} navigate={navigate} />;
  }

  const expedition = slug ? expeditions.find(e => e.slug === slug) : null;

  // A Home carrega na hora; o estado de carregamento fica só na seção de expedições.
  // Apenas a página de uma expedição específica depende dos dados para renderizar.
  if (loading && slug) {
    return <div style={{ minHeight: '100vh', backgroundColor: '#080d18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(241,245,249,0.6)', fontFamily: "'Inter', sans-serif" }}>Carregando...</div>;
  }

  if (expedition) {
    return <ExpeditionPage expedition={expedition} navigate={navigate} />;
  }

  return <HomePage expeditions={expeditions} loading={loading} navigate={navigate} />;
}
