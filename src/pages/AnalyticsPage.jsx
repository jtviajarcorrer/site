import { useEffect, useMemo, useState } from 'react';
import {
  Users, Clock, CheckCircle2, XCircle, AlertTriangle, RefreshCw,
  Smartphone, Monitor, TrendingUp, MousePointerClick, ArrowLeft, Filter, Eye, Lock, LogOut,
  Link2, Copy, Check, UserCheck
} from 'lucide-react';
import { supabase } from '../supabaseClient.js';

const PWD_STORAGE_KEY = 'jt_analytics_pwd_v1';

const EXPEDITION_SECTIONS = [
  { id: 'hero',       label: '1. Topo / Capa da Expedição' },
  { id: 'destaques',  label: '2. Barra de Datas, Parcelamento e Vagas' },
  { id: 'sobre',      label: '3. Sobre a Expedição' },
  { id: 'perfil',     label: '4. Perfil do Grupo' },
  { id: 'incluso',    label: '5. O que está Incluso / Não Incluso' },
  { id: 'hospedagem', label: '6. A Hospedagem' },
  { id: 'prova',      label: '7. A Prova de Corrida' },
  { id: 'roteiro',    label: '8. Roteiro Dia a Dia' },
  { id: 'galeria',    label: '9. O Destino (Galeria de Fotos)' },
  { id: 'formulario', label: '10. Formulário "Quero saber mais"' },
  { id: 'contato',    label: '11. Rodapé / Contato' },
];

const HOME_SECTIONS = [
  { id: 'hero',       label: '1. Topo (Vídeo Principal)' },
  { id: 'para_quem',  label: '2. Perfil dos Viajantes' },
  { id: 'expedicoes', label: '3. Timeline de Expedições' },
  { id: 'sobre',      label: '4. Sobre a JT + Vídeos de Depoimentos' },
  { id: 'comunidade', label: '5. Números da Comunidade' },
  { id: 'contato',    label: '6. Rodapé / Contato' },
];

function formatDuration(ms) {
  if (!ms || ms <= 0) return '0s';
  const totalSec = Math.round(ms / 1000);
  if (totalSec < 60) return `${totalSec}s`;
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function pct(part, total) {
  if (!total) return '0%';
  return `${Math.round((part / total) * 100)}%`;
}

export default function AnalyticsPage({ expeditions = [], navigate }) {
  const [savedPwd, setSavedPwd] = useState(() => {
    try { return sessionStorage.getItem(PWD_STORAGE_KEY) || ''; } catch { return ''; }
  });
  const [pwdInput, setPwdInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [daysFilter, setDaysFilter] = useState('7'); // '1' | '7' | '30' | 'all'
  const [pageFilter, setPageFilter] = useState('all_expeditions'); // 'all_expeditions' | 'home' | 'all' | slug
  const [visitorFilter, setVisitorFilter] = useState(''); // filter table by specific visitor_id

  // UTM Link Builder state
  const [utmTargetSlug, setUtmTargetSlug] = useState('tailandia-2026');
  const [utmSource, setUtmSource] = useState('instagram');
  const [utmMedium, setUtmMedium] = useState('paid_social');
  const [utmCampaign, setUtmCampaign] = useState('tailandia26');
  const [utmContent, setUtmContent] = useState('reels_01');
  const [copiedUtm, setCopiedUtm] = useState(false);

  const fetchAnalytics = async (pwdToUse = savedPwd) => {
    if (!pwdToUse) return;
    setLoading(true);
    setAuthError('');
    const daysParam = daysFilter === 'all' ? null : (parseInt(daysFilter, 10) || 7);

    const { data, error } = await supabase.rpc('get_analytics_sessions', {
      p_password: pwdToUse,
      p_days: daysParam,
    });

    if (error) {
      setAuthenticated(false);
      setSavedPwd('');
      try { sessionStorage.removeItem(PWD_STORAGE_KEY); } catch {}
      setAuthError('Senha incorreta.');
    } else {
      setAuthenticated(true);
      setSavedPwd(pwdToUse);
      try { sessionStorage.setItem(PWD_STORAGE_KEY, pwdToUse); } catch {}
      setSessions(Array.isArray(data) ? data : []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (savedPwd) {
      fetchAnalytics(savedPwd);
    }
  }, [daysFilter]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!pwdInput.trim()) return;
    fetchAnalytics(pwdInput.trim());
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setSavedPwd('');
    setPwdInput('');
    setSessions([]);
    try { sessionStorage.removeItem(PWD_STORAGE_KEY); } catch {}
  };

  const expeditionNameBySlug = useMemo(() => {
    const map = new Map();
    const sorted = [...expeditions].sort((a, b) => String(a.start_date || '').localeCompare(String(b.start_date || '')));
    for (const e of sorted) {
      if (e?.slug) map.set(e.slug, e.monday_name || e.name || e.slug);
    }
    for (const s of sessions) {
      if (s.expedition_slug && !map.has(s.expedition_slug)) {
        map.set(s.expedition_slug, s.expedition_name || s.expedition_slug);
      }
    }
    return map;
  }, [expeditions, sessions]);

  const expeditionOptions = useMemo(() => {
    return Array.from(expeditionNameBySlug.entries()).map(([slug, name]) => ({ slug, name }));
  }, [expeditionNameBySlug]);

  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      if (pageFilter === 'all') return true;
      if (pageFilter === 'home') return s.page_type === 'home' || s.page_path === '/';
      if (pageFilter === 'all_expeditions') return s.page_type === 'expedition';
      return s.expedition_slug === pageFilter;
    });
  }, [sessions, pageFilter]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const uniqueVisitors = new Set(filtered.map((s) => s.visitor_id)).size;
    const mobileCount = filtered.filter((s) => s.device_type === 'mobile').length;

    const sawFormCount = filtered.filter((s) => s.saw_form || s.started_form || s.converted).length;
    const startedFormCount = filtered.filter((s) => s.started_form || s.converted).length;
    const convertedList = filtered.filter((s) => s.converted);
    const convertedCount = convertedList.length;
    const notConvertedList = filtered.filter((s) => !s.converted);
    const notConvertedCount = notConvertedList.length;
    const abandonedFormCount = filtered.filter((s) => s.started_form && !s.converted).length;

    const avgDurationAll = total
      ? filtered.reduce((acc, s) => acc + (s.duration_ms || 0), 0) / total
      : 0;
    const avgDurationConverted = convertedCount
      ? convertedList.reduce((acc, s) => acc + (s.duration_ms || 0), 0) / convertedCount
      : 0;
    const avgDurationNotConverted = notConvertedCount
      ? notConvertedList.reduce((acc, s) => acc + (s.duration_ms || 0), 0) / notConvertedCount
      : 0;

    const withConvertTime = convertedList.filter((s) => (s.time_to_convert_ms || s.duration_ms) > 0);
    const avgTimeToConvert = withConvertTime.length
      ? withConvertTime.reduce((acc, s) => acc + (s.time_to_convert_ms || s.duration_ms || 0), 0) / withConvertTime.length
      : 0;

    const avgScroll = total
      ? Math.round(filtered.reduce((acc, s) => acc + (s.max_scroll_pct || 0), 0) / total)
      : 0;

    const openedItineraryCount = filtered.filter((s) => s.events?.opened_itinerary).length;
    const clickedMobileCtaCount = filtered.filter((s) => s.events?.clicked_mobile_cta).length;
    const clickedRaceLinkCount = filtered.filter((s) => s.events?.clicked_race_link).length;

    return {
      total,
      uniqueVisitors,
      mobileCount,
      sawFormCount,
      startedFormCount,
      convertedCount,
      notConvertedCount,
      abandonedFormCount,
      avgDurationAll,
      avgDurationConverted,
      avgDurationNotConverted,
      avgTimeToConvert,
      avgScroll,
      openedItineraryCount,
      clickedMobileCtaCount,
      clickedRaceLinkCount,
    };
  }, [filtered]);

  const sectionBreakdown = useMemo(() => {
    const schema = pageFilter === 'home' ? HOME_SECTIONS : EXPEDITION_SECTIONS;
    const rows = schema.map((sec) => {
      let viewers = 0;
      let totalMs = 0;
      for (const s of filtered) {
        const ms = Number(s.section_times?.[sec.id] || 0);
        const seenArr = Array.isArray(s.sections_seen) ? s.sections_seen : [];
        const seen = ms > 0 || seenArr.includes(sec.id) || (sec.id === 'formulario' && (s.saw_form || s.started_form || s.converted));
        if (seen) {
          viewers += 1;
          totalMs += ms;
        }
      }
      const avgMs = viewers > 0 ? totalMs / viewers : 0;
      return {
        ...sec,
        viewers,
        reachPct: filtered.length ? Math.round((viewers / filtered.length) * 100) : 0,
        avgMs,
        totalMs,
      };
    });
    const maxAvgMs = Math.max(1, ...rows.map((r) => r.avgMs));
    return rows.map((r) => ({ ...r, timeBarPct: Math.round((r.avgMs / maxAvgMs) * 100) }));
  }, [filtered, pageFilter]);

  const perExpedition = useMemo(() => {
    const expSessions = sessions.filter((s) => s.page_type === 'expedition' && s.expedition_slug);
    const groups = new Map();
    for (const s of expSessions) {
      const slug = s.expedition_slug;
      if (!groups.has(slug)) {
        groups.set(slug, {
          slug,
          name: expeditionNameBySlug.get(slug) || s.expedition_name || slug,
          total: 0,
          durationSum: 0,
          sawForm: 0,
          startedForm: 0,
          abandonedForm: 0,
          converted: 0,
          notConverted: 0,
          convertTimeSum: 0,
          convertTimeCount: 0,
        });
      }
      const g = groups.get(slug);
      g.total += 1;
      g.durationSum += s.duration_ms || 0;
      if (s.saw_form || s.started_form || s.converted) g.sawForm += 1;
      if (s.started_form || s.converted) g.startedForm += 1;
      if (s.started_form && !s.converted) g.abandonedForm += 1;
      if (s.converted) {
        g.converted += 1;
        const t = s.time_to_convert_ms || s.duration_ms || 0;
        if (t > 0) {
          g.convertTimeSum += t;
          g.convertTimeCount += 1;
        }
      } else {
        g.notConverted += 1;
      }
    }
    return Array.from(groups.values()).sort((a, b) => b.total - a.total);
  }, [sessions, expeditionNameBySlug]);

  // Agrupamento por Origem / Campanha (Instagram Ads / UTMs)
  const perSourceCampaign = useMemo(() => {
    const groups = new Map();
    for (const s of filtered) {
      const source = s.utm_source || (s.ad_click_id?.startsWith('fbclid:') ? 'instagram (fbclid)' : s.referrer || 'Acesso Direto');
      const medium = s.utm_medium || (s.ad_click_id ? 'paid_social' : '—');
      const campaign = s.utm_campaign || '—';
      const content = s.utm_content || '—';
      const key = `${source}||${medium}||${campaign}||${content}`;
      if (!groups.has(key)) {
        groups.set(key, {
          key,
          source,
          medium,
          campaign,
          content,
          total: 0,
          visitors: new Set(),
          durationSum: 0,
          startedForm: 0,
          converted: 0,
          notConverted: 0,
        });
      }
      const g = groups.get(key);
      g.total += 1;
      if (s.visitor_id) g.visitors.add(s.visitor_id);
      g.durationSum += s.duration_ms || 0;
      if (s.started_form || s.converted) g.startedForm += 1;
      if (s.converted) g.converted += 1;
      else g.notConverted += 1;
    }
    return Array.from(groups.values()).sort((a, b) => b.total - a.total);
  }, [filtered]);

  // Mapa de visitas e identidade por visitor_id (conecta todas as sessões da mesma pessoa)
  const visitorSummaryMap = useMemo(() => {
    const map = new Map();
    for (const s of sessions) {
      const vid = s.visitor_id;
      if (!vid) continue;
      if (!map.has(vid)) {
        map.set(vid, {
          count: 0,
          lead_name: '',
          lead_instagram: '',
          lead_phone: '',
          lead_email: '',
          everConverted: false,
        });
      }
      const v = map.get(vid);
      v.count += 1;
      if (s.lead_name && !v.lead_name) v.lead_name = s.lead_name;
      if (s.lead_instagram && !v.lead_instagram) v.lead_instagram = s.lead_instagram;
      if (s.lead_phone && !v.lead_phone) v.lead_phone = s.lead_phone;
      if (s.lead_email && !v.lead_email) v.lead_email = s.lead_email;
      if (s.converted) v.everConverted = true;
    }
    return map;
  }, [sessions]);

  const tableSessions = useMemo(() => {
    if (!visitorFilter) return filtered;
    return filtered.filter((s) => s.visitor_id === visitorFilter);
  }, [filtered, visitorFilter]);

  const generatedUtmUrl = useMemo(() => {
    const origin = typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://jtviajarcorrer.pages.dev';
    const path = utmTargetSlug === 'home' ? '/' : utmTargetSlug === 'links' ? '/links' : `/${utmTargetSlug}`;
    const pairs = [];
    if (utmSource.trim()) pairs.push(`utm_source=${encodeURIComponent(utmSource.trim()).replace(/%7B/g, '{').replace(/%7D/g, '}')}`);
    if (utmMedium.trim()) pairs.push(`utm_medium=${encodeURIComponent(utmMedium.trim()).replace(/%7B/g, '{').replace(/%7D/g, '}')}`);
    if (utmCampaign.trim()) pairs.push(`utm_campaign=${encodeURIComponent(utmCampaign.trim()).replace(/%7B/g, '{').replace(/%7D/g, '}')}`);
    if (utmContent.trim()) pairs.push(`utm_content=${encodeURIComponent(utmContent.trim()).replace(/%7B/g, '{').replace(/%7D/g, '}')}`);
    return pairs.length ? `${origin}${path}?${pairs.join('&')}` : `${origin}${path}`;
  }, [utmTargetSlug, utmSource, utmMedium, utmCampaign, utmContent]);

  const handleCopyUtm = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(generatedUtmUrl);
      setCopiedUtm(true);
      setTimeout(() => setCopiedUtm(false), 2200);
    }
  };

  const cardStyle = {
    background: 'rgba(13, 25, 38, 0.85)',
    border: '1px solid rgba(155, 200, 169, 0.14)',
    borderRadius: 18,
    padding: '20px 22px',
  };

  if (!authenticated) {
    return (
      <div style={{ minHeight: '100vh', background: '#06111a', color: '#f1f5f9', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 380, background: 'rgba(13, 25, 38, 0.92)', border: '1px solid rgba(218, 184, 63, 0.25)', borderRadius: 22, padding: '32px 26px', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(218,184,63,0.14)', border: '1px solid rgba(218,184,63,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Lock size={24} color="#dab83f" />
          </div>
          <h1 style={{ fontFamily: "'Alumni Sans', sans-serif", fontStyle: 'italic', fontSize: 32, fontWeight: 900, textTransform: 'uppercase', textAlign: 'center', color: '#f1f5f9', margin: '0 0 6px', lineHeight: 1 }}>
            Acesso de Gestores
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(241,245,249,0.6)', textAlign: 'center', margin: '0 0 22px' }}>
            Digite a senha para visualizar o painel de comportamento das landing pages.
          </p>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="password"
              autoFocus
              placeholder="Senha de acesso"
              value={pwdInput}
              onChange={(e) => { setPwdInput(e.target.value); setAuthError(''); }}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(155,200,169,0.28)',
                borderRadius: 12,
                padding: '13px 16px',
                color: '#f1f5f9',
                fontSize: 15,
                outline: 'none',
              }}
            />
            {authError && (
              <div style={{ fontSize: 12.5, color: '#f87171', textAlign: 'center', fontWeight: 600 }}>
                {authError}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '13px 16px',
                borderRadius: 12,
                border: 'none',
                background: '#dab83f',
                color: '#06111a',
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {loading ? 'Verificando...' : 'Entrar no Painel'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              style={{
                padding: '10px',
                borderRadius: 10,
                border: 'none',
                background: 'transparent',
                color: 'rgba(241,245,249,0.55)',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Voltar para o site
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#06111a', color: '#f1f5f9', fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      {/* Top Bar */}
      <div style={{ borderBottom: '1px solid rgba(155,200,169,0.12)', background: 'rgba(6,17,26,0.95)', position: 'sticky', top: 0, zIndex: 40, backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '16px 24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              onClick={() => navigate('/')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(155,200,169,0.1)', border: '1px solid rgba(155,200,169,0.22)', color: '#9bc8a9', borderRadius: 10, padding: '8px 12px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              <ArrowLeft size={15} /> Voltar ao site
            </button>
            <div>
              <h1 style={{ fontFamily: "'Alumni Sans', sans-serif", fontStyle: 'italic', fontSize: 30, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.03em', margin: 0, color: '#dab83f', lineHeight: 1 }}>
                Painel de Comportamento & Conversão
              </h1>
              <div style={{ fontSize: 12, color: 'rgba(241,245,249,0.55)', marginTop: 2 }}>
                Acessos, tempo em cada seção, funil de formulário e tempo até o cadastro
              </div>
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(155,200,169,0.18)', borderRadius: 10, padding: '6px 10px' }}>
              <Filter size={14} color="#dab83f" />
              <select
                value={pageFilter}
                onChange={(e) => setPageFilter(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: '#f1f5f9', fontSize: 13, fontWeight: 600, outline: 'none', cursor: 'pointer' }}
              >
                <option value="all_expeditions" style={{ background: '#0b1926' }}>Todos os Roteiros (Landing Pages)</option>
                {expeditionOptions.map((e) => (
                  <option key={e.slug} value={e.slug} style={{ background: '#0b1926' }}>
                    {e.name}
                  </option>
                ))}
                <option value="home" style={{ background: '#0b1926' }}>Home Principal (/)</option>
                <option value="all" style={{ background: '#0b1926' }}>Todo o Site (Home + Roteiros)</option>
              </select>
            </div>

            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(155,200,169,0.18)', borderRadius: 10, padding: 3 }}>
              {[
                { id: '1', label: 'Hoje' },
                { id: '7', label: '7 dias' },
                { id: '30', label: '30 dias' },
                { id: 'all', label: 'Tudo' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setDaysFilter(p.id)}
                  style={{
                    border: 'none',
                    background: daysFilter === p.id ? '#dab83f' : 'transparent',
                    color: daysFilter === p.id ? '#06111a' : 'rgba(241,245,249,0.7)',
                    fontWeight: 700,
                    fontSize: 12,
                    padding: '6px 10px',
                    borderRadius: 7,
                    cursor: 'pointer',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => fetchAnalytics(savedPwd)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(218,184,63,0.14)', border: '1px solid rgba(218,184,63,0.35)', color: '#dab83f', borderRadius: 10, padding: '8px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              <RefreshCw size={14} /> Atualizar
            </button>

            <button
              onClick={handleLogout}
              title="Bloquear painel"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.28)', color: '#f87171', borderRadius: 10, padding: '8px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              <LogOut size={14} /> Sair
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1240, margin: '28px auto 0', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 28 }}>
        {/* 4 Main KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
          {/* 1. Acessos */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(155,200,169,0.75)' }}>
                Total de Acessos
              </span>
              <Users size={18} color="#9bc8a9" />
            </div>
            <div style={{ fontFamily: "'Alumni Sans', sans-serif", fontSize: 46, fontWeight: 900, color: '#f1f5f9', lineHeight: 1 }}>
              {stats.total}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(241,245,249,0.6)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span>{stats.uniqueVisitors} visitantes únicos</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#9bc8a9' }}>
                <Smartphone size={13} /> {pct(stats.mobileCount, stats.total)} mobile
              </span>
            </div>
          </div>

          {/* 2. Entraram e NÃO Preencheram */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#f87171' }}>
                Entraram e Não Preencheram
              </span>
              <XCircle size={18} color="#f87171" />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontFamily: "'Alumni Sans', sans-serif", fontSize: 46, fontWeight: 900, color: '#f87171', lineHeight: 1 }}>
                {stats.notConvertedCount}
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'rgba(248,113,113,0.85)' }}>
                ({pct(stats.notConvertedCount, stats.total)} dos acessos)
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(241,245,249,0.6)', marginTop: 8 }}>
              Sendo <strong style={{ color: '#fbbf24' }}>{stats.abandonedFormCount}</strong> que começaram a digitar no formulário e desistiram
            </div>
          </div>

          {/* 3. Cadastros Realizados */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4ade80' }}>
                Cadastros Concluídos
              </span>
              <CheckCircle2 size={18} color="#4ade80" />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontFamily: "'Alumni Sans', sans-serif", fontSize: 46, fontWeight: 900, color: '#4ade80', lineHeight: 1 }}>
                {stats.convertedCount}
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#9bc8a9' }}>
                ({pct(stats.convertedCount, stats.total)} de conversão)
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(241,245,249,0.6)', marginTop: 8 }}>
              {pct(stats.convertedCount, stats.sawFormCount)} de quem rolou até o formulário converteu
            </div>
          </div>

          {/* 4. Tempo até fazer o cadastro / Tempo na página */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#dab83f' }}>
                Tempo até Fazer o Cadastro
              </span>
              <Clock size={18} color="#dab83f" />
            </div>
            <div style={{ fontFamily: "'Alumni Sans', sans-serif", fontSize: 46, fontWeight: 900, color: '#dab83f', lineHeight: 1 }}>
              {stats.convertedCount > 0 ? formatDuration(stats.avgTimeToConvert) : formatDuration(stats.avgDurationAll)}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(241,245,249,0.6)', marginTop: 8 }}>
              Tempo médio geral na página: <strong style={{ color: '#f1f5f9' }}>{formatDuration(stats.avgDurationAll)}</strong> (Scroll médio: {stats.avgScroll}%)
            </div>
          </div>
        </div>

        {/* Funil de Conversão + Tempo por Seção */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20, alignItems: 'start' }}>
          {/* Funil da Landing Page */}
          <div style={cardStyle}>
            <h2 style={{ fontFamily: "'Alumni Sans', sans-serif", fontSize: 26, fontWeight: 900, textTransform: 'uppercase', color: '#f1f5f9', margin: '0 0 6px', letterSpacing: '0.02em' }}>
              Funil até o Cadastro
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(241,245,249,0.55)', margin: '0 0 20px' }}>
              Onde os visitantes avançam ou saem dentro da página
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                {
                  label: '1. Entraram na página',
                  count: stats.total,
                  pctVal: stats.total ? 100 : 0,
                  color: '#9bc8a9',
                  sub: `Tempo médio geral: ${formatDuration(stats.avgDurationAll)}`,
                },
                {
                  label: '2. Rolaram até ver o formulário',
                  count: stats.sawFormCount,
                  pctVal: stats.total ? Math.round((stats.sawFormCount / stats.total) * 100) : 0,
                  color: '#38bdf8',
                  sub: `${stats.total - stats.sawFormCount} saíram antes de chegar no formulário`,
                },
                {
                  label: '3. Começaram a preencher o formulário',
                  count: stats.startedFormCount,
                  pctVal: stats.total ? Math.round((stats.startedFormCount / stats.total) * 100) : 0,
                  color: '#dab83f',
                  sub: `${stats.abandonedFormCount} iniciaram a digitação mas não enviaram`,
                },
                {
                  label: '4. Fizeram o cadastro (Leads)',
                  count: stats.convertedCount,
                  pctVal: stats.total ? Math.round((stats.convertedCount / stats.total) * 100) : 0,
                  color: '#4ade80',
                  sub: stats.convertedCount
                    ? `Levaram em média ${formatDuration(stats.avgTimeToConvert)} até enviar`
                    : 'Nenhum envio registrado neste filtro',
                },
              ].map((step) => (
                <div key={step.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{step.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: step.color }}>
                      {step.count} ({step.pctVal}%)
                    </span>
                  </div>
                  <div style={{ height: 7, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden', marginBottom: 6 }}>
                    <div style={{ width: `${step.pctVal}%`, height: '100%', background: step.color, borderRadius: 99 }} />
                  </div>
                  <div style={{ fontSize: 11.5, color: 'rgba(241,245,249,0.5)' }}>{step.sub}</div>
                </div>
              ))}
            </div>

            {/* Interações extras */}
            <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid rgba(155,200,169,0.12)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <div style={{ background: 'rgba(255,255,255,0.025)', borderRadius: 10, padding: 10, textAlign: 'center' }}>
                <div style={{ fontFamily: "'Alumni Sans', sans-serif", fontSize: 26, fontWeight: 900, color: '#dab83f', lineHeight: 1 }}>
                  {stats.openedItineraryCount}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(241,245,249,0.55)', marginTop: 4 }}>Abriram o Roteiro</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.025)', borderRadius: 10, padding: 10, textAlign: 'center' }}>
                <div style={{ fontFamily: "'Alumni Sans', sans-serif", fontSize: 26, fontWeight: 900, color: '#9bc8a9', lineHeight: 1 }}>
                  {stats.clickedMobileCtaCount}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(241,245,249,0.55)', marginTop: 4 }}>Cliques Barra Mobile</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.025)', borderRadius: 10, padding: 10, textAlign: 'center' }}>
                <div style={{ fontFamily: "'Alumni Sans', sans-serif", fontSize: 26, fontWeight: 900, color: '#38bdf8', lineHeight: 1 }}>
                  {stats.clickedRaceLinkCount}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(241,245,249,0.55)', marginTop: 4 }}>Cliques Site da Prova</div>
              </div>
            </div>
          </div>

          {/* Tempo em cada seção */}
          <div style={cardStyle}>
            <h2 style={{ fontFamily: "'Alumni Sans', sans-serif", fontSize: 26, fontWeight: 900, textTransform: 'uppercase', color: '#f1f5f9', margin: '0 0 6px', letterSpacing: '0.02em' }}>
              Tempo e Retenção em Cada Seção
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(241,245,249,0.55)', margin: '0 0 20px' }}>
              Quanto tempo os visitantes passam lendo cada bloco e quantos chegam até ele
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sectionBreakdown.map((sec) => (
                <div key={sec.id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '10px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{sec.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                      <span style={{ fontSize: 12, color: 'rgba(155,200,169,0.8)' }} title="Visitantes que visualizaram esta seção">
                        <Eye size={12} style={{ verticalAlign: '-2px', marginRight: 4 }} />
                        {sec.viewers} ({sec.reachPct}%)
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#dab83f', minWidth: 54, textAlign: 'right' }}>
                        {formatDuration(sec.avgMs)}
                      </span>
                    </div>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${sec.avgMs > 0 ? Math.max(4, sec.timeBarPct) : 0}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #004140, #9bc8a9, #dab83f)',
                        borderRadius: 99,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabela Comparativa por Expedição */}
        {perExpedition.length > 0 && (
          <div style={cardStyle}>
            <h2 style={{ fontFamily: "'Alumni Sans', sans-serif", fontSize: 26, fontWeight: 900, textTransform: 'uppercase', color: '#f1f5f9', margin: '0 0 6px', letterSpacing: '0.02em' }}>
              Desempenho por Landing Page (Expedição)
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(241,245,249,0.55)', margin: '0 0 16px' }}>
              Comparativo direto entre as expedições no período selecionado
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(155,200,169,0.16)', textAlign: 'left', color: 'rgba(155,200,169,0.75)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    <th style={{ padding: '10px 8px' }}>Expedição</th>
                    <th style={{ padding: '10px 8px' }}>Acessos</th>
                    <th style={{ padding: '10px 8px' }}>Tempo Médio</th>
                    <th style={{ padding: '10px 8px' }}>Viram Form</th>
                    <th style={{ padding: '10px 8px' }}>Iniciaram Form</th>
                    <th style={{ padding: '10px 8px' }}>Não Preencheram</th>
                    <th style={{ padding: '10px 8px' }}>Cadastros</th>
                    <th style={{ padding: '10px 8px' }}>Conversão</th>
                    <th style={{ padding: '10px 8px' }}>Tempo até Cadastro</th>
                  </tr>
                </thead>
                <tbody>
                  {perExpedition.map((row) => (
                    <tr key={row.slug} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px 8px', fontWeight: 700, color: '#f1f5f9' }}>{row.name}</td>
                      <td style={{ padding: '12px 8px' }}>{row.total}</td>
                      <td style={{ padding: '12px 8px', color: '#9bc8a9' }}>{formatDuration(row.total ? row.durationSum / row.total : 0)}</td>
                      <td style={{ padding: '12px 8px' }}>{row.sawForm} ({pct(row.sawForm, row.total)})</td>
                      <td style={{ padding: '12px 8px', color: '#dab83f' }}>{row.startedForm}</td>
                      <td style={{ padding: '12px 8px', color: '#f87171', fontWeight: 600 }}>{row.notConverted} ({pct(row.notConverted, row.total)})</td>
                      <td style={{ padding: '12px 8px', color: '#4ade80', fontWeight: 700 }}>{row.converted}</td>
                      <td style={{ padding: '12px 8px', fontWeight: 700, color: '#4ade80' }}>{pct(row.converted, row.total)}</td>
                      <td style={{ padding: '12px 8px', color: '#dab83f', fontWeight: 600 }}>
                        {row.convertTimeCount ? formatDuration(row.convertTimeSum / row.convertTimeCount) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Origem & Campanhas (Instagram Ads / UTMs) + Gerador de Links UTM */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20, alignItems: 'start' }}>
          {/* Tabela de Origem & Campanhas */}
          <div style={cardStyle}>
            <h2 style={{ fontFamily: "'Alumni Sans', sans-serif", fontSize: 26, fontWeight: 900, textTransform: 'uppercase', color: '#f1f5f9', margin: '0 0 6px', letterSpacing: '0.02em' }}>
              Origem & Campanhas (Instagram Ads / UTMs)
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(241,245,249,0.55)', margin: '0 0 16px' }}>
              Cruzamento de acessos, tempo médio e cadastros por campanha/anúncio
            </p>
            {perSourceCampaign.length === 0 ? (
              <div style={{ padding: '20px 0', color: 'rgba(241,245,249,0.5)', fontSize: 13 }}>
                Nenhum acesso registrado ainda neste filtro.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(155,200,169,0.16)', textAlign: 'left', color: 'rgba(155,200,169,0.75)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <th style={{ padding: '8px 6px' }}>Origem / Mídia</th>
                      <th style={{ padding: '8px 6px' }}>Campanha / Criativo</th>
                      <th style={{ padding: '8px 6px' }}>Acessos</th>
                      <th style={{ padding: '8px 6px' }}>Tempo</th>
                      <th style={{ padding: '8px 6px' }}>Cadastros</th>
                    </tr>
                  </thead>
                  <tbody>
                    {perSourceCampaign.map((row) => (
                      <tr key={row.key} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '10px 6px', fontWeight: 700, color: '#f1f5f9' }}>
                          <div>{row.source}</div>
                          {row.medium !== '—' && (
                            <div style={{ fontSize: 11, color: 'rgba(155,200,169,0.75)', fontWeight: 500 }}>{row.medium}</div>
                          )}
                        </td>
                        <td style={{ padding: '10px 6px', color: 'rgba(241,245,249,0.8)' }}>
                          <div style={{ fontWeight: 600, color: row.campaign !== '—' ? '#dab83f' : 'rgba(241,245,249,0.45)' }}>
                            {row.campaign}
                          </div>
                          {row.content !== '—' && (
                            <div style={{ fontSize: 11, color: 'rgba(241,245,249,0.55)' }}>Criativo: {row.content}</div>
                          )}
                        </td>
                        <td style={{ padding: '10px 6px' }}>
                          <strong>{row.total}</strong>{' '}
                          <span style={{ fontSize: 11, color: 'rgba(241,245,249,0.5)' }}>({row.visitors.size} ún.)</span>
                        </td>
                        <td style={{ padding: '10px 6px', color: '#9bc8a9', fontWeight: 600 }}>
                          {formatDuration(row.total ? row.durationSum / row.total : 0)}
                        </td>
                        <td style={{ padding: '10px 6px' }}>
                          <span style={{ color: '#4ade80', fontWeight: 800 }}>{row.converted}</span>{' '}
                          <span style={{ fontSize: 11, color: 'rgba(241,245,249,0.55)' }}>({pct(row.converted, row.total)})</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Gerador de Links com UTM para Instagram Ads / Bio */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
              <h2 style={{ fontFamily: "'Alumni Sans', sans-serif", fontSize: 26, fontWeight: 900, textTransform: 'uppercase', color: '#dab83f', margin: 0, letterSpacing: '0.02em' }}>
                Gerador de Links com UTM (Instagram Ads & Bio)
              </h2>
              <Link2 size={18} color="#dab83f" />
            </div>
            <p style={{ fontSize: 12.5, color: 'rgba(241,245,249,0.6)', margin: '0 0 14px', lineHeight: 1.45 }}>
              Gere o endereço da Landing Page com UTMs para colar no Gerenciador de Anúncios da Meta, na Bio ou nos Stories. Mesmo se a pessoa entrar na Home e depois clicar no roteiro, as UTMs continuam salvas até o cadastro.
            </p>

            {/* Atalhos rápidos */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
              {[
                {
                  label: 'Meta Ads (Dinâmico)',
                  apply: () => {
                    setUtmSource('instagram');
                    setUtmMedium('paid_social');
                    setUtmCampaign('{{campaign.name}}');
                    setUtmContent('{{ad.name}}');
                  },
                },
                {
                  label: 'Instagram Ads (Manual)',
                  apply: () => {
                    setUtmSource('instagram');
                    setUtmMedium('paid_social');
                    setUtmCampaign(utmTargetSlug.replace(/-/g, '_'));
                    setUtmContent('reels_01');
                  },
                },
                {
                  label: 'Link da Bio',
                  apply: () => {
                    setUtmSource('instagram');
                    setUtmMedium('bio');
                    setUtmCampaign('perfil_jt');
                    setUtmContent('link_bio');
                  },
                },
                {
                  label: 'Stories / Direct',
                  apply: () => {
                    setUtmSource('instagram');
                    setUtmMedium('stories');
                    setUtmCampaign(utmTargetSlug.replace(/-/g, '_'));
                    setUtmContent('figurinha_link');
                  },
                },
                {
                  label: 'WhatsApp',
                  apply: () => {
                    setUtmSource('whatsapp');
                    setUtmMedium('grupos');
                    setUtmCampaign(utmTargetSlug.replace(/-/g, '_'));
                    setUtmContent('disparo');
                  },
                },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={preset.apply}
                  style={{
                    background: 'rgba(218,184,63,0.12)',
                    border: '1px solid rgba(218,184,63,0.3)',
                    color: '#dab83f',
                    borderRadius: 8,
                    padding: '5px 10px',
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: 11, color: 'rgba(155,200,169,0.8)', marginBottom: 4, fontWeight: 700, textTransform: 'uppercase' }}>
                  Página de Destino (Roteiro)
                </label>
                <select
                  value={utmTargetSlug}
                  onChange={(e) => setUtmTargetSlug(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(155,200,169,0.22)', borderRadius: 9, padding: '9px 12px', color: '#f1f5f9', fontSize: 13, fontWeight: 600, outline: 'none' }}
                >
                  {expeditionOptions.map((e) => (
                    <option key={e.slug} value={e.slug} style={{ background: '#0b1926' }}>
                      {e.name} (/{e.slug})
                    </option>
                  ))}
                  <option value="home" style={{ background: '#0b1926' }}>Home Principal (/)</option>
                  <option value="links" style={{ background: '#0b1926' }}>Página de Links da Bio (/links)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'rgba(155,200,169,0.8)', marginBottom: 4, fontWeight: 700 }}>
                  utm_source (Origem)
                </label>
                <input
                  type="text"
                  value={utmSource}
                  onChange={(e) => setUtmSource(e.target.value)}
                  placeholder="instagram"
                  style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(155,200,169,0.22)', borderRadius: 9, padding: '8px 10px', color: '#f1f5f9', fontSize: 12.5, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'rgba(155,200,169,0.8)', marginBottom: 4, fontWeight: 700 }}>
                  utm_medium (Mídia)
                </label>
                <input
                  type="text"
                  value={utmMedium}
                  onChange={(e) => setUtmMedium(e.target.value)}
                  placeholder="paid_social"
                  style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(155,200,169,0.22)', borderRadius: 9, padding: '8px 10px', color: '#f1f5f9', fontSize: 12.5, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'rgba(155,200,169,0.8)', marginBottom: 4, fontWeight: 700 }}>
                  utm_campaign (Campanha)
                </label>
                <input
                  type="text"
                  value={utmCampaign}
                  onChange={(e) => setUtmCampaign(e.target.value)}
                  placeholder="tailandia26"
                  style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(155,200,169,0.22)', borderRadius: 9, padding: '8px 10px', color: '#f1f5f9', fontSize: 12.5, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'rgba(155,200,169,0.8)', marginBottom: 4, fontWeight: 700 }}>
                  utm_content (Anúncio / Criativo)
                </label>
                <input
                  type="text"
                  value={utmContent}
                  onChange={(e) => setUtmContent(e.target.value)}
                  placeholder="reels_01"
                  style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(155,200,169,0.22)', borderRadius: 9, padding: '8px 10px', color: '#f1f5f9', fontSize: 12.5, outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(218,184,63,0.28)', borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <code style={{ fontSize: 11.5, color: '#9bc8a9', wordBreak: 'break-all', lineHeight: 1.4 }}>
                {generatedUtmUrl}
              </code>
              <button
                type="button"
                onClick={handleCopyUtm}
                style={{
                  flexShrink: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: copiedUtm ? '#4ade80' : '#dab83f',
                  color: '#06111a',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {copiedUtm ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar URL</>}
              </button>
            </div>
          </div>
        </div>

        {/* Últimas Sessões Individualizadas */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
            <div>
              <h2 style={{ fontFamily: "'Alumni Sans', sans-serif", fontSize: 26, fontWeight: 900, textTransform: 'uppercase', color: '#f1f5f9', margin: '0 0 4px', letterSpacing: '0.02em' }}>
                Últimos Acessos e Jornada Individual ({tableSessions.length})
              </h2>
              <p style={{ fontSize: 13, color: 'rgba(241,245,249,0.55)', margin: 0 }}>
                Cada pessoa recebe um ID único (<code style={{ color: '#dab83f' }}>#visitor_id</code>) salvo no navegador. Quando ela preenche o formulário, todas as visitas anteriores dela são conectadas automaticamente ao nome e @instagram.
              </p>
            </div>
            {visitorFilter && (
              <button
                type="button"
                onClick={() => setVisitorFilter('')}
                style={{
                  background: 'rgba(218,184,63,0.16)',
                  border: '1px solid rgba(218,184,63,0.4)',
                  color: '#dab83f',
                  borderRadius: 9,
                  padding: '7px 12px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Filtrando Visitante #{visitorFilter.slice(-6)} · Limpar filtro ✕
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ padding: '32px 0', textAlign: 'center', color: 'rgba(241,245,249,0.5)' }}>Carregando dados...</div>
          ) : tableSessions.length === 0 ? (
            <div style={{ padding: '32px 0', textAlign: 'center', color: 'rgba(241,245,249,0.5)' }}>
              Nenhum acesso registrado ainda para este filtro. Abra uma página de expedição para testar em tempo real!
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(155,200,169,0.16)', textAlign: 'left', color: 'rgba(155,200,169,0.75)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    <th style={{ padding: '10px 8px' }}>Data / Hora</th>
                    <th style={{ padding: '10px 8px' }}>Visitante (ID)</th>
                    <th style={{ padding: '10px 8px' }}>Página</th>
                    <th style={{ padding: '10px 8px' }}>Origem / Campanha UTM</th>
                    <th style={{ padding: '10px 8px' }}>Tempo Total</th>
                    <th style={{ padding: '10px 8px' }}>Scroll</th>
                    <th style={{ padding: '10px 8px' }}>Seções com mais tempo</th>
                    <th style={{ padding: '10px 8px' }}>Status / Identificação da Pessoa</th>
                  </tr>
                </thead>
                <tbody>
                  {tableSessions.slice(0, 80).map((s) => {
                    const topSecs = Object.entries(s.section_times || {})
                      .filter(([, ms]) => Number(ms) >= 1000)
                      .sort((a, b) => Number(b[1]) - Number(a[1]))
                      .slice(0, 3)
                      .map(([k, ms]) => `${k}: ${formatDuration(Number(ms))}`)
                      .join(' · ');

                    const vInfo = visitorSummaryMap.get(s.visitor_id) || { count: 1 };
                    const shortVid = s.visitor_id ? s.visitor_id.slice(-6) : '—';
                    const personName = s.lead_name || vInfo.lead_name || '';
                    const personInsta = s.lead_instagram || vInfo.lead_instagram || '';
                    const personPhone = s.lead_phone || vInfo.lead_phone || '';
                    const hasIdentity = Boolean(personName || personInsta || personPhone);

                    return (
                      <tr key={s.session_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '10px 8px', whiteSpace: 'nowrap', color: 'rgba(241,245,249,0.7)' }}>
                          {formatDateTime(s.created_at)}
                        </td>
                        <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>
                          <button
                            type="button"
                            onClick={() => setVisitorFilter(visitorFilter === s.visitor_id ? '' : s.visitor_id)}
                            title="Clique para ver todas as visitas desta mesma pessoa"
                            style={{
                              background: hasIdentity ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.06)',
                              border: `1px solid ${hasIdentity ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.12)'}`,
                              color: hasIdentity ? '#4ade80' : '#9bc8a9',
                              borderRadius: 6,
                              padding: '3px 7px',
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: 'pointer',
                              fontFamily: 'monospace',
                            }}
                          >
                            #{shortVid}
                          </button>
                          {vInfo.count > 1 && (
                            <span style={{ marginLeft: 6, fontSize: 10.5, color: '#dab83f', fontWeight: 700 }}>
                              {vInfo.count} visitas
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '10px 8px', fontWeight: 600, color: '#f1f5f9' }}>
                          {expeditionNameBySlug.get(s.expedition_slug) || s.expedition_name || (s.page_type === 'home' ? 'Home (/)' : s.page_path)}
                        </td>
                        <td style={{ padding: '10px 8px', color: 'rgba(241,245,249,0.75)' }}>
                          <div>
                            <strong>{s.utm_source || (s.ad_click_id?.startsWith('fbclid:') ? 'instagram (ads)' : s.referrer || 'Direto')}</strong>
                            {s.utm_medium ? ` / ${s.utm_medium}` : ''} · {s.device_type}
                          </div>
                          {(s.utm_campaign || s.utm_content || s.ad_click_id) && (
                            <div style={{ fontSize: 11, color: '#dab83f', marginTop: 2 }}>
                              {s.utm_campaign ? `Camp: ${s.utm_campaign}` : ''}
                              {s.utm_content ? ` · Criativo: ${s.utm_content}` : ''}
                              {!s.utm_campaign && s.ad_click_id ? ` · ${s.ad_click_id.slice(0, 18)}…` : ''}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '10px 8px', fontWeight: 700, color: '#dab83f' }}>
                          {formatDuration(s.duration_ms)}
                        </td>
                        <td style={{ padding: '10px 8px', color: 'rgba(241,245,249,0.7)' }}>
                          {s.max_scroll_pct || 0}%
                        </td>
                        <td style={{ padding: '10px 8px', color: 'rgba(155,200,169,0.85)' }}>
                          {topSecs || '—'}
                        </td>
                        <td style={{ padding: '10px 8px' }}>
                          {s.converted ? (
                            <div>
                              <span style={{ display: 'inline-block', background: 'rgba(74,222,128,0.16)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.35)', borderRadius: 99, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
                                Cadastrou em {formatDuration(s.time_to_convert_ms || s.duration_ms)}
                              </span>
                            </div>
                          ) : s.started_form ? (
                            <span style={{ display: 'inline-block', background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.35)', borderRadius: 99, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
                              Iniciou form e abandonou
                            </span>
                          ) : s.saw_form ? (
                            <span style={{ display: 'inline-block', background: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 99, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>
                              Viu form e não preencheu
                            </span>
                          ) : (
                            <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.06)', color: 'rgba(241,245,249,0.6)', borderRadius: 99, padding: '2px 8px', fontSize: 11 }}>
                              Saiu sem preencher
                            </span>
                          )}
                          {hasIdentity && (
                            <div style={{ fontSize: 11.5, color: '#f1f5f9', marginTop: 4, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                              <UserCheck size={12} color="#4ade80" />
                              <span>{personName || 'Visitante identificado'}</span>
                              {personInsta && <span style={{ color: '#dab83f' }}>@{personInsta}</span>}
                              {personPhone && <span style={{ color: 'rgba(155,200,169,0.85)' }}>· {personPhone}</span>}
                              {!s.converted && vInfo.everConverted && (
                                <span style={{ fontSize: 10, color: '#4ade80', background: 'rgba(74,222,128,0.1)', padding: '1px 5px', borderRadius: 4 }}>
                                  converteu em outra visita
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
