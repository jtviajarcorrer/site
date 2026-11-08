import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import {
  Calendar, MapPin, CheckCircle, Loader2, ChevronRight,
  Check, X, Clock, Users, DollarSign, Route, ChevronDown, ChevronUp,
  Star, Shield, Zap, Phone, Mail, MessageCircle
} from 'lucide-react';
import { supabase } from '../supabaseClient.js';
import { brl, getInstallments, getCashPrice } from '../utils/pricing.js';
import { useT } from '../content/SiteTexts.jsx';
import { imgUrl } from '../utils/img.js';

/* ─── Design tokens — JT light theme ─── */
const T = {
  bg:        '#F4F6F5',          // fundo levemente esverdeado, JT
  bgCard:    '#FFFFFF',
  bgMuted:   '#EDF1EF',          // tint mint suave
  border:    'rgba(0,65,64,0.12)',
  text:      '#06111a',          // fundo escuro da marca vira texto
  textMid:   '#334d47',          // teal escurecido
  textMuted: '#7a9990',          // mint apagado
  accent:    '#004140',          // teal primário JT
  accentBg:  'rgba(0,65,64,0.07)',
  gold:      '#dab83f',          // dourado JT
  goldBg:    'rgba(218,184,63,0.10)',
  goldDark:  '#b8952e',
  mint:      '#9bc8a9',          // verde menta JT
  mintBg:    'rgba(155,200,169,0.12)',
  shadow:    '0 1px 3px rgba(0,65,64,0.06), 0 4px 16px rgba(0,65,64,0.05)',
  shadowLg:  '0 4px 24px rgba(0,65,64,0.12)',
};

/* ─── Lead Form ─── */
function LeadForm({ expedition }) {
  const { t } = useT();
  const [form, setForm] = useState({ firstName: '', email: '', phone: '', instagram: '' });
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const webhookUrl = import.meta.env.VITE_MAKE_WEBHOOK_URL || '';
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, fullName: form.firstName.trim(), expedition: expedition.name, expeditionSlug: expedition.slug }),
        });
      }
      await new Promise(r => setTimeout(r, 800));
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div style={{ textAlign: 'center', padding: '40px 16px' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: T.mintBg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <CheckCircle size={32} color={T.accent} />
        </div>
        <h3 style={{ fontFamily: "'Alumni Sans', sans-serif", fontSize: 26, fontWeight: 900, color: T.text, textTransform: 'uppercase', margin: '0 0 8px' }}>
          {t('form_sucesso_titulo')}
        </h3>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: T.textMid, lineHeight: 1.6 }}>
          {t('form_sucesso_texto')}
        </p>
      </div>
    );
  }

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(155,200,169,0.13)',
    border: `1.5px solid rgba(155,200,169,0.35)`,
    borderRadius: 10,
    padding: '13px 16px',
    color: T.text,
    fontFamily: "'Inter', sans-serif",
    fontSize: 16,
    outline: 'none',
    transition: 'border-color 0.2s, background 0.2s',
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <input required type="text" style={inputStyle} placeholder={t('form_nome')} value={form.firstName}
        onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
        onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.background = '#fff'; }}
        onBlur={e => { e.target.style.borderColor = 'rgba(155,200,169,0.35)'; e.target.style.background = 'rgba(155,200,169,0.13)'; }}
      />
      <input required type="email" style={inputStyle} placeholder={t('form_email')} value={form.email}
        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
        onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.background = '#fff'; }}
        onBlur={e => { e.target.style.borderColor = T.border; e.target.style.background = T.bgMuted; }}
      />
      <input required type="tel" style={inputStyle} placeholder={t('form_whatsapp')} value={form.phone}
        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
        onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.background = '#fff'; }}
        onBlur={e => { e.target.style.borderColor = T.border; e.target.style.background = T.bgMuted; }}
      />
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontFamily: "'Inter', sans-serif", fontSize: 14, color: T.textMuted, pointerEvents: 'none' }}>@</span>
        <input required type="text" style={{ ...inputStyle, paddingLeft: 28 }} placeholder={t('form_instagram')} value={form.instagram}
          onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))}
          onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.background = '#fff'; }}
          onBlur={e => { e.target.style.borderColor = 'rgba(155,200,169,0.35)'; e.target.style.background = 'rgba(155,200,169,0.13)'; }}
        />
      </div>
      {status === 'error' && (
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: T.accent, margin: 0 }}>
          {t('form_erro')}
        </p>
      )}
      <button type="submit" disabled={status === 'loading'} style={{
        padding: '15px', fontSize: 15, fontWeight: 700, fontFamily: "'Inter', sans-serif",
        borderRadius: 10, border: 'none', cursor: 'pointer',
        background: T.accent,
        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        transition: 'opacity 0.15s',
      }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        {status === 'loading'
          ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> {t('form_enviando')}</>
          : <>{t('form_botao')} <ChevronRight size={16} /></>}
      </button>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </form>
  );
}

/* ─── Itinerary Day (accordion) ─── */
function DayItem({ g, defaultOpen = false, isLast = false }) {
  const { t } = useT();
  const [open, setOpen] = useState(defaultOpen);
  const dateObj = g.date ? new Date(g.date + 'T12:00:00Z') : null;
  const weekday = dateObj ? dateObj.toLocaleDateString('pt-BR', { weekday: 'long', timeZone: 'UTC' }) : '';
  const dateText = dateObj ? dateObj.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', timeZone: 'UTC' }) : '';
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const hasNumber = g.number >= 1;
  const title = hasNumber ? t('exp_roteiro_dia', { n: g.number }) : t('exp_roteiro_antes');
  const subtitle = dateObj ? `${cap(weekday)}, ${dateText}` : '';
  return (
    <div style={{ borderBottom: isLast ? 'none' : `1px solid ${T.border}` }}>
      <button className="exp-day-btn" onClick={() => setOpen(o => !o)} style={{
        width: '100%', background: 'none', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 14, padding: '18px 0', textAlign: 'left',
      }}>
        <div style={{
          minWidth: 40, height: 40, borderRadius: 8, flexShrink: 0,
          background: open ? T.accentBg : T.bgMuted,
          border: `1.5px solid ${open ? T.accent : T.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Alumni Sans', sans-serif", fontSize: 18, fontWeight: 800,
          color: open ? T.accent : T.textMid,
          transition: 'all 0.2s',
        }}>
          {hasNumber ? g.number : '•'}
        </div>
        <span className="exp-day-title-wrap" style={{ flex: 1, fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 600, color: T.text }}>
          <span>{title}</span>
          {subtitle && <span className="exp-day-subtitle" style={{ fontWeight: 400, color: T.textMuted, marginLeft: 10, fontSize: 13 }}>{subtitle}</span>}
        </span>
        {open ? <ChevronUp size={16} color={T.textMuted} style={{ flexShrink: 0 }} /> : <ChevronDown size={16} color={T.textMuted} style={{ flexShrink: 0 }} />}
      </button>
      {open && (
        <ul className="exp-day-list" style={{ listStyle: 'none', margin: '0 0 20px 54px', padding: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {g.items.map(it => (
            <li key={it.id} className="exp-day-item" style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              {it.start_time ? (
                <span className="exp-day-time" style={{ minWidth: 78, fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: T.accent, paddingTop: 2 }}>
                  {it.end_time ? `${it.start_time}–${it.end_time}` : it.start_time}
                </span>
              ) : (
                <span className="exp-day-time exp-day-time-empty" style={{ minWidth: 78 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600, color: T.text, lineHeight: 1.5 }}>{it.title}</div>
                {it.description && (
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: T.textMid, lineHeight: 1.6, margin: '4px 0 0' }}>{it.description}</p>
                )}
                {it.photos?.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                    {it.photos.map((src, i) => (
                      <img key={i} src={imgUrl(src, 320)} alt={it.title} loading="lazy" decoding="async"
                        onError={e => { e.currentTarget.style.display = 'none'; }}
                        style={{ width: 96, height: 72, objectFit: 'cover', borderRadius: 8, display: 'block' }} />
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ─── Main Page ─── */
export default function ExpeditionPage({ expedition, navigate }) {
  const { t } = useT();
  const [days, setDays] = useState([]);
  const [loadingDays, setLoadingDays] = useState(true);
  const [itineraryOpen, setItineraryOpen] = useState(false);
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    const el = document.getElementById('reservar');
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setFormVisible(entry.isIntersecting),
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    async function fetchDays() {
      if (!expedition.id) { setLoadingDays(false); return; }
      const { data } = await supabase
        .from('expedition_days').select('*')
        .eq('expedition_id', expedition.id)
        .order('day_date', { ascending: true })
        .order('start_time', { ascending: true, nullsFirst: true });
      if (data) setDays(data);
      setLoadingDays(false);
    }
    fetchDays();
  }, [expedition.id]);

  // Agrupa as atividades por dia (day_date), mantendo a ordem por horário
  const dayGroups = [];
  for (const d of days) {
    const key = d.day_date || `n${d.day_number}`;
    let g = dayGroups[dayGroups.length - 1];
    if (!g || g.key !== key) { g = { key, date: d.day_date, number: d.day_number, items: [] }; dayGroups.push(g); }
    g.items.push(d);
  }

  const exp = expedition;

  const formatDateRange = () => {
    if (!exp.start_date || !exp.end_date) return exp.date_label || '';
    const sd = new Date(exp.start_date + 'T12:00:00Z');
    const ed = new Date(exp.end_date + 'T12:00:00Z');
    const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
    const m1 = cap(sd.toLocaleString('pt-BR', { month: 'long', timeZone: 'UTC' }));
    const m2 = cap(ed.toLocaleString('pt-BR', { month: 'long', timeZone: 'UTC' }));
    if (sd.getUTCMonth() !== ed.getUTCMonth()) {
      return `${sd.getUTCDate()}/${m1} a ${ed.getUTCDate()}/${m2} de ${ed.getUTCFullYear()}`;
    }
    return `${sd.getUTCDate()} a ${ed.getUTCDate()} de ${m1} de ${ed.getUTCFullYear()}`;
  };
  const dateLabel = formatDateRange();
  const heroYear = (exp.start_date || exp.end_date || '').slice(0, 4);

  const installments = getInstallments(exp);
  const cashPrice = getCashPrice(exp);

  const BrlIcon = ({ color = '#004140' }) => (
    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 800, color, letterSpacing: '-0.03em', lineHeight: 1 }}>
      R$
    </span>
  );

  const highlights = [
    { id: 'datas', Icon: Calendar, label: t('exp_info_datas'), value: dateLabel },
    { id: 'modalidades', Icon: Route, label: t('exp_info_modalidades'), value: exp.modalities?.join(' · ') || '—' },
    installments
      ? {
          id: 'preco',
          Icon: BrlIcon,
          label: installments.entry ? 'Parcelamento' : t('exp_info_parcelas', { parcelas: installments.max }),
          value: installments.entry
            ? `Entrada ${brl(installments.entry)} + ${installments.max}x de ${brl(installments.value)}`
            : brl(installments.value),
        }
      : { id: 'preco', Icon: BrlIcon, label: t('exp_info_a_vista'), value: cashPrice ? brl(cashPrice) : t('preco_sob_consulta') },
    { id: 'vagas', Icon: Users, label: t('exp_info_vagas'), value: exp.spots_left != null ? (exp.spots_left <= 6 ? t('exp_info_ultimas_vagas', { vagas: exp.spots_left }) : t('exp_info_vagas_valor', { vagas: exp.spots_left })) : '—' },
  ];

  const scrollToForm = () => {
    document.getElementById('reservar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div style={{ background: T.bg, minHeight: '100vh', overflowX: 'hidden' }}>
      <Navbar navigate={navigate} logoAlwaysVisible />

      {/* ── Hero (mesmo estilo da home: foto desfocada + grade + degradês) ── */}
      <div className="exp-hero" style={{ position: 'relative', height: '60vh', minHeight: 440, overflow: 'hidden', background: '#060e18' }}>
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          <img src={imgUrl(exp.cover_image, 1600)} alt="" aria-hidden="true" fetchpriority="high" className="kenburns" style={{
            width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%',
            filter: 'brightness(1.1)',
          }} />
          {/* degradês nas bordas */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to top, rgba(6,14,24,1) 0%, rgba(6,14,24,0.6) 40%, rgba(6,14,24,0.2) 70%, rgba(8,13,24,0.5) 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to right, rgba(6,14,24,0.8) 0%, transparent 50%, rgba(6,14,24,0.4) 100%)' }} />
        </div>

        {/* Conteúdo — nome à esquerda (ano como apoio dourado) e frase à direita, alinhados pela mesma linha de base */}
        <div className="exp-hero-content" style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 2,
          maxWidth: 1200, margin: '0 auto', padding: '0 56px 56px',
          display: 'flex', flexDirection: 'row', alignItems: 'last baseline', justifyContent: 'space-between', gap: 48,
        }}>
          <div>
            {heroYear && (
              <div style={{
                fontFamily: "'Alumni Sans', sans-serif", fontStyle: 'italic', fontWeight: 700,
                fontSize: 'clamp(22px, 3vw, 34px)', letterSpacing: '0.18em', lineHeight: 1, marginBottom: 8,
                background: 'linear-gradient(135deg,#dab83f,#e8ca6a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                width: 'fit-content',
              }}>
                {heroYear}
              </div>
            )}
            <h1 className="exp-hero-title" style={{
              fontFamily: "'Alumni Sans', sans-serif", fontStyle: 'italic',
              fontSize: 'clamp(44px, 8vw, 96px)', fontWeight: 900, textTransform: 'uppercase',
              letterSpacing: '0.02em', color: '#f1f5f9', margin: 0, lineHeight: 0.92,
            }}>
              {exp.name}
            </h1>
          </div>
          {exp.slogan && (
            <p className="exp-hero-slogan" style={{
              fontFamily: "'Alumni Sans', sans-serif", fontStyle: 'italic',
              fontSize: 'clamp(24px, 4vw, 44px)', fontWeight: 700, lineHeight: 1.1,
              color: '#f1f5f9', margin: 0, textAlign: 'right', maxWidth: 520,
            }}>
              {exp.slogan}
            </p>
          )}
        </div>
      </div>

      {/* ── Highlight bar ── */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${T.border}`, boxShadow: '0 2px 12px rgba(0,65,64,0.07)' }}>
        <div className="exp-highlights-grid" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px', display: 'flex', flexWrap: 'wrap' }}>
          {highlights.map(({ id, Icon, label, value }, i) => (
            <div key={id} className="exp-highlight-item" style={{
              flex: '1 1 200px',
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '22px 20px',
              borderRight: i < highlights.length - 1 ? `1px solid ${T.border}` : 'none',
            }}>
              {/* icon badge */}
              <div className="exp-highlight-icon" style={{
                width: 42, height: 42, borderRadius: 12,
                background: 'rgba(155,200,169,0.12)',
                border: '1.5px solid rgba(155,200,169,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon size={19} color='#004140' strokeWidth={1.8} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.textMuted, marginBottom: 4 }}>{label}</div>
                <div className="exp-highlight-val" style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 600, color: T.text, lineHeight: 1.25 }}>
                  {id === 'vagas' && exp.spots_left != null && exp.spots_left <= 6
                    ? <span style={{ color: T.gold }}>{value}</span>
                    : value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="exp-main-grid" style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 32px 40px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: 48, alignItems: 'start' }}>

        {/* ── LEFT ── */}
        <div style={{ minWidth: 0 }}>

          {/* About */}
          <section className="exp-section" style={{ marginBottom: 56 }}>
            <SectionTitle>{t('exp_sobre_titulo')}</SectionTitle>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: T.textMid, lineHeight: 1.85, margin: 0, whiteSpace: 'pre-wrap' }}>
              {exp.description}
            </p>
          </section>

          {/* Perfil do grupo (texto fixo) */}
          <section className="exp-section" style={{ marginBottom: 56 }}>
            <SectionTitle>{t('exp_perfil_titulo')}</SectionTitle>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: T.textMid, lineHeight: 1.85, margin: 0, whiteSpace: 'pre-wrap' }}>
              {t('exp_perfil_texto')}
            </p>
          </section>

          {/* Includes / Not Includes */}
          {(exp.included || exp.not_included) && (
            <section className="exp-section" style={{ marginBottom: 56 }}>
              <SectionTitle>{t('exp_incluso_titulo')}</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
                {exp.included && (
                  <div className="exp-card-pad" style={{ background: T.mintBg, border: `1px solid rgba(155,200,169,0.25)`, borderRadius: 16, padding: 24 }}>
                    <h4 style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.accent, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {t('exp_incluso_rotulo')}
                    </h4>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {exp.included.split(/\\n|\r?\n/).map(s => s.replace(/^[\s\p{Pd}\p{So}\p{Sm}•·∙⋅*▪▫▸▹►▻✓✔✅✗✘❌✖➖➕\uFE0E\uFE0F\u200B]+/u, '').trim()).filter(Boolean).map((item, i) => (
                        <li key={i} style={{ display: 'flex', gap: 10, fontFamily: "'Inter', sans-serif", fontSize: 14, color: T.textMid, lineHeight: 1.4 }}>
                          <Check size={14} color={T.accent} style={{ flexShrink: 0, marginTop: 2 }} /> <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {exp.not_included && (
                  <div className="exp-card-pad" style={{ background: 'rgba(232,25,60,0.04)', border: `1px solid rgba(232,25,60,0.14)`, borderRadius: 16, padding: 24 }}>
                    <h4 style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.accent, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {t('exp_nao_incluso_rotulo')}
                    </h4>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {exp.not_included.split(/\\n|\r?\n/).map(s => s.replace(/^[\s\p{Pd}\p{So}\p{Sm}•·∙⋅*▪▫▸▹►▻✓✔✅✗✘❌✖➖➕\uFE0E\uFE0F\u200B]+/u, '').trim()).filter(Boolean).map((item, i) => (
                        <li key={i} style={{ display: 'flex', gap: 10, fontFamily: "'Inter', sans-serif", fontSize: 14, color: T.textMid, lineHeight: 1.4 }}>
                          <X size={14} color={T.accent} style={{ flexShrink: 0, marginTop: 2 }} /> <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Hospedagem */}
          {Array.isArray(exp.stays) && exp.stays.length > 0 && (
            <section className="exp-section" style={{ marginBottom: 56 }}>
              <SectionTitle>{t('exp_hospedagem_titulo')}</SectionTitle>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
                {exp.stays.map((s, i) => (
                  <div key={i} style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: T.shadow }}>
                    {s.photos?.[0] && (
                      <img src={imgUrl(s.photos[0], 640)} alt={s.name} loading="lazy" decoding="async" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
                    )}
                    <div style={{ padding: '16px 18px 18px' }}>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 600, color: T.text, lineHeight: 1.35 }}>{s.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Prova de Corrida */}
          {Array.isArray(exp.races) && exp.races.length > 0 && (
            <section className="exp-section" style={{ marginBottom: 56 }}>
              <SectionTitle>{t('exp_prova_titulo')}</SectionTitle>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {exp.races.map((r, i) => (
                  <div
                    key={r.id || i}
                    className="exp-card-pad"
                    style={{
                      background: T.bgCard,
                      border: `1px solid ${T.border}`,
                      borderRadius: 16,
                      padding: 24,
                      boxShadow: T.shadow,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                      <h3 style={{ fontFamily: "'Alumni Sans', sans-serif", fontSize: 28, fontWeight: 900, textTransform: 'uppercase', color: T.text, margin: 0, letterSpacing: '0.02em', lineHeight: 1.05 }}>
                        {r.name}
                      </h3>
                      {r.website && (
                        <a
                          href={r.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 13,
                            fontWeight: 600,
                            color: T.accent,
                            background: T.mintBg,
                            border: '1px solid rgba(155,200,169,0.4)',
                            borderRadius: 99,
                            padding: '6px 14px',
                            textDecoration: 'none',
                          }}
                        >
                          {t('exp_prova_link')}
                        </a>
                      )}
                    </div>
                    {r.description && (
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: T.textMid, lineHeight: 1.75, margin: '12px 0 0', whiteSpace: 'pre-wrap' }}>
                        {r.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Itinerary */}
          <section className="exp-section" style={{ marginBottom: 56 }}>
            <div
              onClick={() => dayGroups.length > 0 && setItineraryOpen(o => !o)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20,
                cursor: dayGroups.length > 0 ? 'pointer' : 'default',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 4, height: 28, borderRadius: 99, background: '#9bc8a9', flexShrink: 0 }} />
                <h2 style={{ fontFamily: "'Alumni Sans', sans-serif", fontSize: 28, fontWeight: 900, textTransform: 'uppercase', color: T.text, margin: 0, letterSpacing: '0.02em', lineHeight: 1.05 }}>
                  {t('exp_roteiro_titulo')}
                </h2>
              </div>
              {dayGroups.length > 0 && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: T.accent }}>
                  {itineraryOpen ? 'Recolher' : 'Ver roteiro'}
                  {itineraryOpen ? <ChevronUp size={16} color={T.accent} /> : <ChevronDown size={16} color={T.accent} />}
                </span>
              )}
            </div>
            <div className="exp-itinerary-card" style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: '0 28px', boxShadow: T.shadow }}>
              {loadingDays ? (
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: T.textMuted, padding: '24px 0' }}>{t('exp_roteiro_carregando')}</p>
              ) : dayGroups.length > 0 ? (
                <>
                  <button
                    type="button"
                    onClick={() => setItineraryOpen(o => !o)}
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      borderBottom: itineraryOpen ? `1px solid ${T.border}` : 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '18px 0',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{
                      minWidth: 40,
                      height: 40,
                      borderRadius: 10,
                      flexShrink: 0,
                      background: 'rgba(155,200,169,0.14)',
                      border: '1.5px solid rgba(155,200,169,0.38)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Calendar size={18} color={T.accent} strokeWidth={1.8} />
                    </div>
                    <span className="exp-day-title-wrap" style={{ flex: 1, fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 600, color: T.text }}>
                      <span>{itineraryOpen ? 'Ocultar programação dia a dia' : 'Ver programação dia a dia'}</span>
                      <span className="exp-day-subtitle" style={{ fontWeight: 400, color: T.textMuted, marginLeft: 10, fontSize: 13 }}>
                        {`${dayGroups.filter(g => g.number >= 1).length || dayGroups.length} dias de roteiro`}
                      </span>
                    </span>
                    {itineraryOpen ? (
                      <ChevronUp size={18} color={T.accent} style={{ flexShrink: 0 }} />
                    ) : (
                      <ChevronDown size={18} color={T.accent} style={{ flexShrink: 0 }} />
                    )}
                  </button>
                  {itineraryOpen && dayGroups.map((g, i) => (
                    <DayItem key={g.key} g={g} defaultOpen={false} isLast={i === dayGroups.length - 1} />
                  ))}
                </>
              ) : (
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: T.textMuted, padding: '24px 0' }}>
                  {t('exp_roteiro_vazio')}
                </p>
              )}
            </div>
          </section>

          {/* Gallery */}
          {exp.gallery_images && exp.gallery_images.length > 0 && (
            <section className="exp-section">
              <SectionTitle>{t('exp_destino_titulo')}</SectionTitle>
              <div className="exp-gallery-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {exp.gallery_images.map((img, i) => (
                  <div key={i} style={{ borderRadius: 12, overflow: 'hidden', aspectRatio: '4/3', boxShadow: T.shadow }}>
                    <img src={imgUrl(img, 800)} alt="Galeria" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease', display: 'block' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── RIGHT: sticky sidebar ── */}
        <div id="reservar" className="exp-sidebar" style={{ position: 'sticky', top: 88, scrollMarginTop: 84 }}>
          {/* price card */}
          <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 20, padding: '28px 24px', boxShadow: T.shadowLg }}>
            {(installments || cashPrice) && (
              <div style={{ marginBottom: 20, textAlign: 'center' }}>
                {installments && (
                  <>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: T.textMid, lineHeight: 1.5 }}>
                      {installments.entry ? t('preco_entrada_parcelas', { entrada: brl(installments.entry), parcelas: installments.max }) : t('preco_so_parcelas', { parcelas: installments.max })}
                    </div>
                    <div style={{ fontFamily: "'Alumni Sans', sans-serif", fontSize: 44, fontWeight: 900, color: '#004140', lineHeight: 1.05, letterSpacing: '-0.01em' }}>
                      {brl(installments.value)}
                    </div>
                  </>
                )}
                {installments && cashPrice && (
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.textMuted, margin: '8px 0', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{t('preco_ou')}</div>
                )}
                {cashPrice && (
                  <>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: T.textMid, lineHeight: 1.5 }}>
                      {t('preco_a_vista')}
                    </div>
                    <div style={{ fontFamily: "'Alumni Sans', sans-serif", fontSize: installments ? 30 : 44, fontWeight: 900, color: installments ? T.goldDark : '#004140', lineHeight: 1.1, letterSpacing: '-0.01em' }}>
                      {brl(cashPrice)}
                    </div>
                  </>
                )}
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: T.textMuted, marginTop: 6 }}>{t('preco_por_pessoa')}</div>
              </div>
            )}

            <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 20 }}>
              <h3 style={{ fontFamily: "'Alumni Sans', sans-serif", fontSize: 22, fontWeight: 900, textTransform: 'uppercase', color: '#dab83f', margin: '0 0 4px' }}>
                {t('form_titulo')}
              </h3>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: T.textMuted, margin: '0 0 20px' }}>
                {t('form_subtitulo')}
              </p>
              <LeadForm expedition={exp} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Barra fixa mobile (atalho rápido para o formulário, oculta quando o formulário já está na tela) ── */}
      {!formVisible && (
        <div className="exp-mobile-cta">
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {installments
                ? (installments.entry ? t('card_entrada_parcelas', { entrada: brl(installments.entry), parcelas: installments.max }) : t('exp_info_parcelas', { parcelas: installments.max }))
                : t('exp_info_a_vista')}
            </div>
            <div style={{ fontFamily: "'Alumni Sans', sans-serif", fontSize: 26, fontWeight: 900, color: T.accent, lineHeight: 1 }}>
              {installments ? brl(installments.value) : (cashPrice ? brl(cashPrice) : t('preco_sob_consulta'))}
            </div>
          </div>
          <button
            type="button"
            onClick={scrollToForm}
            style={{
              padding: '12px 20px',
              borderRadius: 10,
              border: 'none',
              background: T.accent,
              color: '#fff',
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {t('form_botao')} <ChevronRight size={15} />
          </button>
        </div>
      )}

      {/* ── Responsive overrides ── */}
      <style>{`
        .exp-mobile-cta {
          display: none;
        }
        @media (max-width: 900px) {
          .exp-main-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
            padding: 36px 20px 16px !important;
          }
          .exp-sidebar {
            position: static !important;
          }
          .exp-gallery-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
          }
          .exp-mobile-cta {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 90;
            background: rgba(255, 255, 255, 0.96);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border-top: 1px solid rgba(0, 65, 64, 0.14);
            box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
            padding: 10px 18px calc(10px + env(safe-area-inset-bottom, 0px));
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
          }
        }
        @media (max-width: 768px) {
          .exp-hero {
            height: auto !important;
            min-height: 360px !important;
            display: flex !important;
            align-items: flex-end !important;
            padding-top: 96px !important;
          }
          .exp-hero-content {
            position: relative !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 10px !important;
            padding: 20px 20px 28px !important;
            width: 100% !important;
          }
          .exp-hero-title {
            font-size: clamp(38px, 11vw, 56px) !important;
          }
          .exp-hero-slogan {
            text-align: left !important;
            font-size: clamp(20px, 5.2vw, 28px) !important;
            max-width: 100% !important;
          }
          .exp-highlights-grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            padding: 0 !important;
          }
          .exp-highlight-item {
            padding: 14px 14px !important;
            gap: 10px !important;
            border-right: none !important;
            border-bottom: 1px solid rgba(0, 65, 64, 0.12) !important;
          }
          .exp-highlight-item:nth-child(odd) {
            border-right: 1px solid rgba(0, 65, 64, 0.12) !important;
          }
          .exp-highlight-item:nth-last-child(-n+2) {
            border-bottom: none !important;
          }
          .exp-highlight-icon {
            width: 36px !important;
            height: 36px !important;
            border-radius: 10px !important;
          }
          .exp-highlight-val {
            font-size: 13px !important;
          }
          .exp-section {
            margin-bottom: 40px !important;
          }
          .exp-card-pad {
            padding: 18px !important;
          }
          .exp-itinerary-card {
            padding: 0 16px !important;
          }
          .exp-day-title-wrap {
            display: flex !important;
            flex-direction: column !important;
            gap: 2px !important;
          }
          .exp-day-subtitle {
            margin-left: 0 !important;
            font-size: 12px !important;
          }
          .exp-day-list {
            margin: 0 0 18px 8px !important;
            padding-left: 14px !important;
            border-left: 2px solid rgba(0, 65, 64, 0.14) !important;
          }
          .exp-day-item {
            flex-direction: column !important;
            gap: 4px !important;
          }
          .exp-day-time {
            min-width: 0 !important;
            font-size: 12px !important;
            padding-top: 0 !important;
          }
          .exp-day-time-empty {
            display: none !important;
          }
        }
        @media (max-width: 380px) {
          .exp-highlights-grid {
            grid-template-columns: 1fr !important;
          }
          .exp-highlight-item {
            border-right: none !important;
            border-bottom: 1px solid rgba(0, 65, 64, 0.12) !important;
          }
          .exp-highlight-item:last-child {
            border-bottom: none !important;
          }
        }
      `}</style>

      <Footer navigate={navigate} />
    </div>
  );
}

/* ─── helpers ─── */
function SectionTitle({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
      <div style={{ width: 4, height: 28, borderRadius: 99, background: '#9bc8a9', flexShrink: 0 }} />
      <h2 style={{ fontFamily: "'Alumni Sans', sans-serif", fontSize: 28, fontWeight: 900, textTransform: 'uppercase', color: T.text, margin: 0, letterSpacing: '0.02em', lineHeight: 1.05 }}>
        {children}
      </h2>
    </div>
  );
}
