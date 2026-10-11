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
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: T.greenBg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <CheckCircle size={32} color={T.green} />
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
    fontSize: 14,
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
      <input required type="text" style={inputStyle} placeholder={t('form_whatsapp')} value={form.phone}
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
function DayItem({ g, defaultOpen = false }) {
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
    <div style={{ borderBottom: `1px solid ${T.border}` }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', background: 'none', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 16, padding: '20px 0', textAlign: 'left',
      }}>
        <div style={{
          minWidth: 40, height: 40, borderRadius: 8,
          background: open ? T.accentBg : T.bgMuted,
          border: `1.5px solid ${open ? T.accent : T.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Alumni Sans', sans-serif", fontSize: 18, fontWeight: 800,
          color: open ? T.accent : T.textMid,
          transition: 'all 0.2s',
        }}>
          {hasNumber ? g.number : '•'}
        </div>
        <span style={{ flex: 1, fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 600, color: T.text }}>
          {title}
          {subtitle && <span style={{ fontWeight: 400, color: T.textMuted, marginLeft: 10, fontSize: 13 }}>{subtitle}</span>}
        </span>
        {open ? <ChevronUp size={16} color={T.textMuted} /> : <ChevronDown size={16} color={T.textMuted} />}
      </button>
      {open && (
        <ul style={{ listStyle: 'none', margin: '0 0 20px 56px', padding: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {g.items.map(it => (
            <li key={it.id} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span style={{ minWidth: 78, fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: T.accent, paddingTop: 2 }}>
                {it.start_time ? (it.end_time ? `${it.start_time}–${it.end_time}` : it.start_time) : ''}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: T.text, lineHeight: 1.5 }}>{it.title}</div>
                {it.description && (
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: T.textMid, lineHeight: 1.6, margin: '4px 0 0' }}>{it.description}</p>
                )}
                {it.photos?.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                    {it.photos.map((src, i) => (
                      <img key={i} src={src} alt={it.title} loading="lazy"
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
    const m = sd.toLocaleString('pt-BR', { month: 'long', timeZone: 'UTC' });
    return `${sd.getUTCDate()} a ${ed.getUTCDate()} de ${m.charAt(0).toUpperCase() + m.slice(1)} de ${ed.getUTCFullYear()}`;
  };
  const dateLabel = formatDateRange();

  const installments = getInstallments(exp);
  const cashPrice = getCashPrice(exp);

  const highlights = [
    { id: 'datas', Icon: Calendar, label: t('exp_info_datas'), value: dateLabel },
    { id: 'modalidades', Icon: Route, label: t('exp_info_modalidades'), value: exp.modalities?.join(' · ') || '—' },
    installments
      ? { id: 'preco', Icon: DollarSign, label: t('exp_info_parcelas', { parcelas: installments.max }), value: brl(installments.value) }
      : { id: 'preco', Icon: DollarSign, label: t('exp_info_a_vista'), value: cashPrice ? brl(cashPrice) : t('preco_sob_consulta') },
    { id: 'vagas', Icon: Users, label: t('exp_info_vagas'), value: exp.spots_left != null ? (exp.spots_left <= 6 ? t('exp_info_ultimas_vagas', { vagas: exp.spots_left }) : t('exp_info_vagas_valor', { vagas: exp.spots_left })) : '—' },
  ];

  return (
    <div style={{ background: T.bg, minHeight: '100vh' }}>
      <Navbar navigate={navigate} logoAlwaysVisible />

      {/* ── Hero (full-bleed image, text overlay) ── */}
      <div style={{ position: 'relative', height: '55vh', minHeight: 420, overflow: 'hidden' }}>
        <img src={exp.cover_image} alt={exp.name} style={{
          width: '100%', height: '100%', objectFit: 'cover',
          transform: 'scale(1.04)', transition: 'transform 8s ease',
        }} />
        {/* gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.60) 100%)' }} />

        {/* hero text */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 40px 44px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            {/* tags */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
              {exp.country && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.25)', borderRadius: 99,
                  padding: '5px 12px', fontFamily: "'Inter', sans-serif", fontSize: 12,
                  fontWeight: 500, color: '#fff', letterSpacing: '0.03em',
                }}>
                  <MapPin size={11} /> {exp.country}
                </span>
              )}
              {exp.modalities?.map(m => (
                <span key={m} style={{
                  background: T.accent, borderRadius: 99, padding: '5px 12px',
                  fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700,
                  color: '#fff', letterSpacing: '0.04em',
                }}>{m}</span>
              ))}
            </div>

            <h1 style={{
              fontFamily: "'Alumni Sans', sans-serif",
              fontSize: 'clamp(42px, 7vw, 80px)',
              fontWeight: 900, textTransform: 'uppercase',
              letterSpacing: '0.02em', color: '#fff', margin: '0 0 6px', lineHeight: 0.95,
            }}>
              {exp.name}
            </h1>
            {exp.slogan && (
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 18, fontWeight: 300, color: 'rgba(255,255,255,0.82)', margin: 0 }}>
                {exp.slogan}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Highlight bar ── */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${T.border}`, boxShadow: '0 2px 12px rgba(0,65,64,0.07)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px', display: 'flex', flexWrap: 'wrap' }}>
          {highlights.map(({ id, Icon, label, value }, i) => (
            <div key={id} style={{
              flex: '1 1 200px',
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '24px',
              borderRight: i < highlights.length - 1 ? `1px solid ${T.border}` : 'none',
            }}>
              {/* icon badge */}
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(155,200,169,0.12)',
                border: '1.5px solid rgba(155,200,169,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon size={20} color='#004140' strokeWidth={1.8} />
              </div>
              <div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.textMuted, marginBottom: 5 }}>{label}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 600, color: T.text, lineHeight: 1.2 }}>
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
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 32px 100px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: 48, alignItems: 'start' }}>

        {/* ── LEFT ── */}
        <div>

          {/* About */}
          <section style={{ marginBottom: 56 }}>
            <SectionTitle>{t('exp_sobre_titulo')}</SectionTitle>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: T.textMid, lineHeight: 1.85, margin: 0, whiteSpace: 'pre-wrap' }}>
              {exp.description}
            </p>
          </section>

          {/* Perfil do grupo (texto fixo) */}
          <section style={{ marginBottom: 56 }}>
            <SectionTitle>{t('exp_perfil_titulo')}</SectionTitle>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: T.textMid, lineHeight: 1.85, margin: 0, whiteSpace: 'pre-wrap' }}>
              {t('exp_perfil_texto')}
            </p>
          </section>

          {/* Includes / Not Includes */}
          {(exp.included || exp.not_included) && (
            <section style={{ marginBottom: 56 }}>
              <SectionTitle>{t('exp_incluso_titulo')}</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
                {exp.included && (
                  <div style={{ background: T.mintBg, border: `1px solid rgba(155,200,169,0.25)`, borderRadius: 16, padding: 24 }}>
                    <h4 style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.accent, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Check size={14} /> {t('exp_incluso_rotulo')}
                    </h4>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {exp.included.split(/\\n|\r?\n/).map(s => s.replace(/^\s*[-•]\s*/, '').trim()).filter(Boolean).map((item, i) => (
                        <li key={i} style={{ display: 'flex', gap: 10, fontFamily: "'Inter', sans-serif", fontSize: 14, color: T.textMid, lineHeight: 1.4 }}>
                          <Check size={14} color={T.accent} style={{ flexShrink: 0, marginTop: 2 }} /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {exp.not_included && (
                  <div style={{ background: 'rgba(232,25,60,0.04)', border: `1px solid rgba(232,25,60,0.14)`, borderRadius: 16, padding: 24 }}>
                    <h4 style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.accent, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <X size={14} /> {t('exp_nao_incluso_rotulo')}
                    </h4>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {exp.not_included.split(/\\n|\r?\n/).map(s => s.replace(/^\s*[-•]\s*/, '').trim()).filter(Boolean).map((item, i) => (
                        <li key={i} style={{ display: 'flex', gap: 10, fontFamily: "'Inter', sans-serif", fontSize: 14, color: T.textMid, lineHeight: 1.4 }}>
                          <X size={14} color={T.accent} style={{ flexShrink: 0, marginTop: 2 }} /> {item}
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
            <section style={{ marginBottom: 56 }}>
              <SectionTitle>{t('exp_hospedagem_titulo')}</SectionTitle>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
                {exp.stays.map((s, i) => (
                  <div key={i} style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: T.shadow }}>
                    {s.photos?.[0] && (
                      <img src={s.photos[0]} alt={s.name} loading="lazy" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
                    )}
                    <div style={{ padding: '16px 18px 18px' }}>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 600, color: T.text, lineHeight: 1.35 }}>{s.name}</div>
                      {s.stars > 0 && (
                        <div style={{ display: 'flex', gap: 2, marginTop: 8 }} aria-label={`${s.stars} estrelas`}>
                          {Array.from({ length: Math.min(s.stars, 5) }).map((_, k) => (
                            <Star key={k} size={14} color={T.gold} fill={T.gold} />
                          ))}
                        </div>
                      )}
                      {s.website && (
                        <a href={s.website} target="_blank" rel="noopener noreferrer"
                          style={{ display: 'inline-block', marginTop: 10, fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: T.accent, textDecoration: 'none' }}>
                          {t('exp_hospedagem_link')}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Itinerary */}
          <section style={{ marginBottom: 56 }}>
            <SectionTitle>{t('exp_roteiro_titulo')}</SectionTitle>
            <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: '0 28px', boxShadow: T.shadow }}>
              {loadingDays ? (
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: T.textMuted, padding: '24px 0' }}>{t('exp_roteiro_carregando')}</p>
              ) : dayGroups.length > 0 ? (
                dayGroups.map((g, i) => <DayItem key={g.key} g={g} defaultOpen={i === 0} />)
              ) : (
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: T.textMuted, padding: '24px 0' }}>
                  {t('exp_roteiro_vazio')}
                </p>
              )}
            </div>
          </section>

          {/* Gallery */}
          {exp.gallery_images && exp.gallery_images.length > 0 && (
            <section>
              <SectionTitle>{t('exp_destino_titulo')}</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {exp.gallery_images.map((img, i) => (
                  <div key={i} style={{ borderRadius: 12, overflow: 'hidden', aspectRatio: '4/3', boxShadow: T.shadow }}>
                    <img src={img} alt="Galeria" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease', display: 'block' }}
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
        <div style={{ position: 'sticky', top: 88 }}>
          {/* price card */}
          <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 20, padding: '28px 24px', boxShadow: T.shadowLg, marginBottom: 16 }}>
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

            <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 20, marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Alumni Sans', sans-serif", fontSize: 22, fontWeight: 900, textTransform: 'uppercase', color: '#dab83f', margin: '0 0 4px' }}>
                {t('form_titulo')}
              </h3>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: T.textMuted, margin: '0 0 20px' }}>
                {t('form_subtitulo')}
              </p>
              <LeadForm expedition={exp} />
            </div>
          </div>

          {/* WhatsApp */}
          <a
            href={`https://wa.me/5531996158950?text=${encodeURIComponent(t('exp_whatsapp_mensagem', { nome: exp.name, datas: dateLabel }))}`}
            target="_blank" rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: '14px', borderRadius: 12, background: '#25D366',
              color: '#fff', fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600,
              textDecoration: 'none', transition: 'filter 0.2s', boxShadow: '0 4px 14px rgba(37,211,102,0.3)',
            }}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.08)'}
            onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            {t('exp_whatsapp_botao')}
          </a>

          {/* trust signals */}
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { Icon: Shield, k: 'confianca_1' },
              { Icon: Star,   k: 'confianca_2' },
              { Icon: Zap,    k: 'confianca_3' },
            ].map(({ Icon, k }) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon size={14} color='#9bc8a9' />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.textMid }}>{t(k)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Responsive overrides ── */}
      <style>{`
        @media (max-width: 900px) {
          div[style*="grid-template-columns: minmax(0,1fr) 340px"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="position: sticky; top: 88px"] {
            position: static !important;
          }
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="grid-template-columns: repeat(3, 1fr)"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 600px) {
          div[style*="padding: 0 40px 44px"] {
            padding: 0 20px 32px !important;
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
      <div style={{ width: 4, height: 28, borderRadius: 99, background: '#9bc8a9', flexShrink: 0 }} />
      <h2 style={{ fontFamily: "'Alumni Sans', sans-serif", fontSize: 28, fontWeight: 900, textTransform: 'uppercase', color: T.text, margin: 0, letterSpacing: '0.02em' }}>
        {children}
      </h2>
    </div>
  );
}
