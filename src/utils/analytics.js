import { supabase } from '../supabaseClient.js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://uirisymiorgkqjhygmmp.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const VISITOR_STORAGE_KEY = 'jt_visitor_id_v1';

function randomId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'jt_' + Math.random().toString(36).slice(2) + '_' + Date.now().toString(36);
}

export function getVisitorId() {
  try {
    let id = localStorage.getItem(VISITOR_STORAGE_KEY);
    if (!id) {
      id = randomId();
      localStorage.setItem(VISITOR_STORAGE_KEY, id);
    }
    return id;
  } catch {
    return randomId();
  }
}

function detectDeviceType() {
  const w = typeof window !== 'undefined' ? window.innerWidth : 1024;
  if (w <= 768) return 'mobile';
  if (w <= 1024) return 'tablet';
  return 'desktop';
}

function parseUtmParams() {
  try {
    const sp = new URLSearchParams(window.location.search);
    return {
      utm_source: sp.get('utm_source') || null,
      utm_medium: sp.get('utm_medium') || null,
      utm_campaign: sp.get('utm_campaign') || null,
    };
  } catch {
    return { utm_source: null, utm_medium: null, utm_campaign: null };
  }
}

function cleanReferrer() {
  try {
    const ref = document.referrer;
    if (!ref) return 'Direto / Link';
    const url = new URL(ref);
    if (url.hostname === window.location.hostname) return 'Navegação interna';
    if (url.hostname.includes('instagram.com')) return 'Instagram';
    if (url.hostname.includes('google.')) return 'Google';
    if (url.hostname.includes('facebook.com') || url.hostname.includes('fb.')) return 'Facebook';
    if (url.hostname.includes('whatsapp.com') || url.hostname.includes('wa.me')) return 'WhatsApp';
    return url.hostname.replace(/^www\./, '');
  } catch {
    return 'Direto / Link';
  }
}

let currentSession = null;

function buildPayload() {
  if (!currentSession) return null;
  return {
    session_id: currentSession.sessionId,
    visitor_id: currentSession.visitorId,
    page_path: currentSession.pagePath,
    page_type: currentSession.pageType,
    expedition_slug: currentSession.expeditionSlug,
    expedition_name: currentSession.expeditionName,
    device_type: currentSession.deviceType,
    referrer: currentSession.referrer,
    utm_source: currentSession.utm.utm_source,
    utm_medium: currentSession.utm.utm_medium,
    utm_campaign: currentSession.utm.utm_campaign,
    duration_ms: Math.round(currentSession.durationMs),
    max_scroll_pct: Math.round(currentSession.maxScrollPct),
    section_times: currentSession.sectionTimes,
    sections_seen: Array.from(currentSession.sectionsSeen),
    events: currentSession.events,
    saw_form: currentSession.sawForm,
    started_form: currentSession.startedForm,
    converted: currentSession.converted,
    time_to_convert_ms: currentSession.timeToConvertMs != null ? Math.round(currentSession.timeToConvertMs) : null,
    lead_name: currentSession.leadName,
    lead_email: currentSession.leadEmail,
    lead_phone: currentSession.leadPhone,
    lead_instagram: currentSession.leadInstagram,
  };
}

export function flushAnalytics(useKeepalive = false) {
  const payload = buildPayload();
  if (!payload) return;

  if (useKeepalive && SUPABASE_ANON_KEY) {
    try {
      fetch(`${SUPABASE_URL}/rest/v1/rpc/track_analytics_session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ payload }),
        keepalive: true,
      }).catch(() => {});
      return;
    } catch {
      // fallback para supabase.rpc
    }
  }

  supabase.rpc('track_analytics_session', { payload }).then(() => {}).catch(() => {});
}

export function trackFormStart() {
  if (!currentSession || currentSession.startedForm) return;
  currentSession.startedForm = true;
  currentSession.sawForm = true;
  flushAnalytics(false);
}

export function trackFormConversion({ firstName, email, phone, instagram } = {}) {
  if (!currentSession) return;
  currentSession.sawForm = true;
  currentSession.startedForm = true;
  currentSession.converted = true;
  if (currentSession.timeToConvertMs == null) {
    currentSession.timeToConvertMs = Math.max(1000, currentSession.durationMs);
  }
  if (firstName) currentSession.leadName = String(firstName).trim();
  if (email) currentSession.leadEmail = String(email).trim();
  if (phone) currentSession.leadPhone = String(phone).trim();
  if (instagram) currentSession.leadInstagram = String(instagram).trim().replace(/^@/, '');
  flushAnalytics(true);
}

export function trackAnalyticsEvent(eventName, value = true) {
  if (!currentSession || !eventName) return;
  currentSession.events[eventName] = value;
  flushAnalytics(false);
}

export function startPageAnalytics({ pagePath, pageType, expeditionSlug = null, expeditionName = null }) {
  // Finaliza sessão anterior se houver
  if (currentSession) {
    flushAnalytics(true);
    if (currentSession.cleanup) currentSession.cleanup();
  }

  const utm = parseUtmParams();
  const session = {
    sessionId: randomId(),
    visitorId: getVisitorId(),
    pagePath: pagePath || '/',
    pageType: pageType || 'expedition',
    expeditionSlug: expeditionSlug || null,
    expeditionName: expeditionName || null,
    deviceType: detectDeviceType(),
    referrer: cleanReferrer(),
    utm,
    durationMs: 0,
    maxScrollPct: 0,
    sectionTimes: {},
    sectionsSeen: new Set(),
    events: {},
    sawForm: false,
    startedForm: false,
    converted: false,
    timeToConvertMs: null,
    leadName: null,
    leadEmail: null,
    leadPhone: null,
    leadInstagram: null,
    cleanup: null,
  };

  currentSession = session;

  const updateScroll = () => {
    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop || 0;
    const winH = window.innerHeight || doc.clientHeight || 1;
    const fullH = Math.max(doc.scrollHeight, doc.offsetHeight, winH);
    const pct = fullH <= winH ? 100 : Math.min(100, Math.round(((scrollTop + winH) / fullH) * 100));
    if (pct > session.maxScrollPct) session.maxScrollPct = pct;
  };

  // Mede a cada 500ms qual seção está ativa na tela (apenas quando a aba está visível)
  const TICK_MS = 500;
  const sampleSections = () => {
    if (document.visibilityState === 'hidden') return;
    session.durationMs += TICK_MS;
    updateScroll();

    const winH = window.innerHeight || 800;
    const nodes = document.querySelectorAll('[data-analytics-section]');
    if (!nodes.length) return;

    let primarySection = null;
    let maxVisibleScore = 0;

    nodes.forEach((el) => {
      const secId = el.getAttribute('data-analytics-section');
      if (!secId) return;
      const rect = el.getBoundingClientRect();
      if (rect.height <= 0) return;

      // Calcula interseção vertical com a viewport
      const visibleTop = Math.max(0, rect.top);
      const visibleBottom = Math.min(winH, rect.bottom);
      const visiblePx = Math.max(0, visibleBottom - visibleTop);
      const ratioOfViewport = visiblePx / winH;
      const ratioOfElement = visiblePx / rect.height;

      // Se pelo menos 25% da seção ou 25% da tela está ocupada por ela, marca como vista
      if (ratioOfElement >= 0.25 || ratioOfViewport >= 0.25) {
        session.sectionsSeen.add(secId);
        if (secId === 'formulario') session.sawForm = true;
      }

      // Pontuação para definir em qual seção o olhar do usuário está focado agora (centro da tela pesa mais)
      if (visiblePx > 40) {
        const centerY = winH * 0.45;
        const containsCenter = rect.top <= centerY && rect.bottom >= centerY ? 1.5 : 1.0;
        const score = visiblePx * containsCenter;
        if (score > maxVisibleScore) {
          maxVisibleScore = score;
          primarySection = secId;
        }
      }
    });

    if (primarySection) {
      session.sectionsSeen.add(primarySection);
      if (primarySection === 'formulario') session.sawForm = true;
      session.sectionTimes[primarySection] = (session.sectionTimes[primarySection] || 0) + TICK_MS;
    }
  };

  updateScroll();
  sampleSections();

  const tickInterval = setInterval(sampleSections, TICK_MS);
  const initialFlushTimer = setTimeout(() => flushAnalytics(false), 1500);
  const periodicFlushInterval = setInterval(() => {
    if (document.visibilityState !== 'hidden') flushAnalytics(false);
  }, 6000);

  const onScroll = () => updateScroll();
  const onVisibilityChange = () => {
    if (document.visibilityState === 'hidden') flushAnalytics(true);
  };
  const onPageHide = () => flushAnalytics(true);

  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('pagehide', onPageHide);

  session.cleanup = () => {
    clearInterval(tickInterval);
    clearTimeout(initialFlushTimer);
    clearInterval(periodicFlushInterval);
    window.removeEventListener('scroll', onScroll);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('pagehide', onPageHide);
  };

  return () => {
    flushAnalytics(true);
    if (session.cleanup) session.cleanup();
    if (currentSession === session) currentSession = null;
  };
}
