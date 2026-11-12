import { useEffect } from 'react';
import { Calendar, ArrowRight, Compass, ShieldCheck } from 'lucide-react';
import { useT } from '../content/SiteTexts.jsx';
import { imgUrl } from '../utils/img.js';
import { brl, getInstallments, getCashPrice } from '../utils/pricing.js';
import { startPageAnalytics } from '../utils/analytics.js';

function ensureBioUtmInUrl() {
  try {
    const sp = new URLSearchParams(window.location.search);
    const isAutoIgBio =
      sp.get('utm_content') === 'link_in_bio' ||
      (sp.get('utm_source') === 'ig' && sp.get('utm_medium') === 'social');
    const isBioPath = /^\/(links|bio|linktree)\/?$/i.test(window.location.pathname || '');
    if (!sp.get('utm_source') || isAutoIgBio || isBioPath) {
      sp.set('utm_source', 'Instagram');
      sp.set('utm_medium', 'Organic');
      sp.set('utm_campaign', 'Insta Bio');
      sp.set('utm_content', 'Instagram_Bio');
      sp.set('utm_term', 'Instagram_Bio');
      const nextUrl = `${window.location.pathname}?${sp.toString()}${window.location.hash || ''}`;
      window.history.replaceState({}, '', nextUrl);
    }
  } catch {
    // ignore
  }
}

const GOLD_TEXT = {
  background: 'linear-gradient(135deg,#dab83f,#e8ca6a)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

const InstagramIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const WhatsAppIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

function formatShortDate(exp) {
  if (exp.date_label) return exp.date_label;
  if (!exp.start_date || !exp.end_date) return '';
  const sd = new Date(exp.start_date + 'T12:00:00Z');
  const ed = new Date(exp.end_date + 'T12:00:00Z');
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const m1 = cap(sd.toLocaleString('pt-BR', { month: 'short', timeZone: 'UTC' }).replace('.', ''));
  const m2 = cap(ed.toLocaleString('pt-BR', { month: 'short', timeZone: 'UTC' }).replace('.', ''));
  const year = String(ed.getUTCFullYear()).slice(-2);
  if (sd.getUTCMonth() !== ed.getUTCMonth()) {
    return `${sd.getUTCDate()}/${m1} a ${ed.getUTCDate()}/${m2} de ${year}`;
  }
  return `${sd.getUTCDate()} a ${ed.getUTCDate()} ${m2}/${year}`;
}

/* ─── Ícone rápido (1ª seção: só o ícone e texto pequeno abaixo) ─── */
function QuickChannelIcon({ href, onClick, icon, label, accent = 'teal', external = true }) {
  const palettes = {
    whatsapp: {
      bg: 'rgba(37, 211, 102, 0.14)',
      border: 'rgba(74, 222, 128, 0.45)',
      color: '#4ade80',
      hoverBg: '#25D366',
      hoverColor: '#06111a',
    },
    gold: {
      bg: 'rgba(218, 184, 63, 0.14)',
      border: 'rgba(218, 184, 63, 0.45)',
      color: '#dab83f',
      hoverBg: '#dab83f',
      hoverColor: '#06111a',
    },
    teal: {
      bg: 'rgba(0, 65, 64, 0.45)',
      border: 'rgba(155, 200, 169, 0.3)',
      color: '#9bc8a9',
      hoverBg: '#9bc8a9',
      hoverColor: '#06111a',
    },
  };
  const p = palettes[accent] || palettes.teal;

  return (
    <a
      href={href}
      onClick={onClick}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="jt-quick-icon-link"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 7,
        textDecoration: 'none',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <div
        className="jt-quick-icon-circle"
        style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: p.bg,
          border: `1.5px solid ${p.border}`,
          color: p.color,
          boxShadow: '0 6px 18px rgba(0, 0, 0, 0.35)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          transition: 'transform 0.25s ease, background 0.25s ease, color 0.25s ease, border-color 0.25s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = p.hoverBg;
          e.currentTarget.style.color = p.hoverColor;
          e.currentTarget.style.borderColor = p.hoverBg;
          e.currentTarget.style.transform = 'translateY(-3px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = p.bg;
          e.currentTarget.style.color = p.color;
          e.currentTarget.style.borderColor = p.border;
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        {icon}
      </div>
      <span
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 11,
          fontWeight: 500,
          color: 'rgba(241, 245, 249, 0.78)',
          letterSpacing: '0.01em',
          textAlign: 'center',
          lineHeight: 1.2,
        }}
      >
        {label}
      </span>
    </a>
  );
}

/* ─── Item de Expedição: Bola com foto do destino + Retângulo menor junto da bola ─── */
function ExpeditionBubbleLink({ exp, navigate }) {
  const { t } = useT();
  const dateText = formatShortDate(exp);
  const inst = getInstallments(exp);
  const cash = getCashPrice(exp);
  const priceText = inst
    ? `${inst.max}x ${brl(inst.value)}`
    : cash
      ? brl(cash)
      : null;

  const handleClick = (e) => {
    e.preventDefault();
    ensureBioUtmInUrl();
    navigate(`/${exp.slug}`);
  };

  return (
    <a
      href={`/${exp.slug}?utm_source=Instagram&utm_medium=Organic&utm_campaign=Insta+Bio&utm_content=Instagram_Bio&utm_term=Instagram_Bio`}
      onClick={handleClick}
      className="jt-exp-bubble-row"
      style={{
        display: 'flex',
        alignItems: 'center',
        textDecoration: 'none',
        position: 'relative',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* Bola com fundo de destino */}
      <div
        className="jt-exp-bubble-circle"
        style={{
          width: 88,
          height: 88,
          borderRadius: '50%',
          flexShrink: 0,
          position: 'relative',
          zIndex: 2,
          overflow: 'hidden',
          border: '2px solid rgba(218, 184, 63, 0.75)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.65), 0 0 0 4px #06111a',
          background: 'linear-gradient(135deg, #004140 0%, #12415c 100%)',
          transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease, box-shadow 0.3s ease',
        }}
      >
        {exp.cover_image && (
          <img
            src={imgUrl(exp.cover_image, 320)}
            alt={exp.name}
            loading="lazy"
            decoding="async"
            className="jt-exp-bubble-img"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              transition: 'transform 0.5s ease',
            }}
          />
        )}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 30% 30%, transparent 55%, rgba(6, 17, 26, 0.38) 100%)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Retângulo menor junto da bola com as informações */}
      <div
        className="jt-exp-bubble-rect"
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: 66,
          marginLeft: -24,
          padding: '10px 14px 10px 34px',
          borderRadius: '0 16px 16px 0',
          background: 'linear-gradient(135deg, rgba(0, 65, 64, 0.42) 0%, rgba(18, 65, 92, 0.26) 55%, rgba(8, 13, 24, 0.9) 100%)',
          border: '1px solid rgba(155, 200, 169, 0.22)',
          borderLeft: 'none',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          zIndex: 1,
          boxShadow: '0 10px 28px rgba(0, 0, 0, 0.35)',
          transition: 'transform 0.3s ease, border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease',
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          {/* Linha 1: Nome do destino (fonte mais equilibrada) + eventual selo de últimas vagas */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                fontSize: 14.5,
                lineHeight: 1.2,
                letterSpacing: '0.01em',
                color: '#f1f5f9',
              }}
            >
              {exp.name}
            </span>

            {exp.spots_left != null && exp.spots_left > 0 && exp.spots_left <= 6 && (
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 9.5,
                  fontWeight: 700,
                  color: '#06111a',
                  background: 'linear-gradient(135deg, #dab83f, #e8ca6a)',
                  borderRadius: 99,
                  padding: '1.5px 6px',
                  lineHeight: 1.3,
                  whiteSpace: 'nowrap',
                }}
              >
                {t('exp_info_ultimas_vagas', { vagas: exp.spots_left })}
              </span>
            )}
          </div>

          {/* Linha 2: Data + Modalidades / Valor */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              flexWrap: 'wrap',
              marginTop: 4,
            }}
          >
            {dateText && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 11,
                  fontWeight: 500,
                  color: 'rgba(155, 200, 169, 0.85)',
                }}
              >
                <Calendar size={10.5} />
                {dateText}
              </span>
            )}

            {exp.modalities?.length > 0 && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                <span style={{ color: 'rgba(241,245,249,0.22)', fontSize: 10 }}>•</span>
                {exp.modalities.slice(0, 4).map((m) => (
                  <span
                    key={m}
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 9.5,
                      fontWeight: 600,
                      color: '#dab83f',
                      background: 'rgba(218, 184, 63, 0.12)',
                      border: '1px solid rgba(218, 184, 63, 0.25)',
                      borderRadius: 99,
                      padding: '1px 5.5px',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {m}
                  </span>
                ))}
              </div>
            )}

            {!exp.modalities?.length && priceText && (
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#dab83f',
                }}
              >
                • {priceText}
              </span>
            )}
          </div>
        </div>

        {/* Seta à direita */}
        <div
          className="jt-exp-bubble-arrow"
          style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            flexShrink: 0,
            background: 'rgba(218, 184, 63, 0.12)',
            border: '1px solid rgba(218, 184, 63, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#dab83f',
            transition: 'all 0.25s ease',
          }}
        >
          <ArrowRight size={14} />
        </div>
      </div>
    </a>
  );
}

export default function LinksPage({ expeditions = [], loading = false, navigate }) {
  const { t, rich } = useT();

  useEffect(() => {
    ensureBioUtmInUrl();
    const cleanup = startPageAnalytics({ pagePath: '/links', pageType: 'links' });
    return cleanup;
  }, []);

  // Apenas expedições futuras/atuais com Destaque no Site, ordenadas por data
  const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
  const endOf = (e) => e.end_date || e.start_date || '';
  const upcoming = (expeditions || [])
    .filter((e) => e.highlight && e.start_date && endOf(e) >= todayStr)
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

  const goHome = (e) => {
    e.preventDefault();
    ensureBioUtmInUrl();
    navigate('/');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#06111a',
        color: '#f1f5f9',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Luzes de fundo da marca */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: '-15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 620,
          height: 420,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,65,64,0.45) 0%, rgba(18,65,92,0.18) 45%, transparent 72%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          bottom: '-15%',
          right: '-10%',
          width: 460,
          height: 460,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(218,184,63,0.10) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <main
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 460,
          margin: '0 auto',
          padding: '36px 18px 56px',
        }}
      >
        {/* ── Cabeçalho da Marca ── */}
        <header style={{ textAlign: 'center', marginBottom: 20 }}>
          <a
            href="/"
            onClick={goHome}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
            }}
          >
            <img
              src="/logo-jt-crop.png"
              alt="JT Viajar Correr"
              style={{
                height: 60,
                width: 'auto',
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 18px rgba(0,0,0,0.6))',
              }}
            />
          </a>
        </header>

        {/* ── 1ª Seção: Ícones Rápidos com escrito pequeno abaixo ── */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 10,
            maxWidth: 340,
            margin: '0 auto 30px',
            padding: '14px 12px',
            borderRadius: 20,
            background: 'rgba(8, 13, 24, 0.45)',
            border: '1px solid rgba(155, 200, 169, 0.12)',
          }}
        >
          <QuickChannelIcon
            href="https://wa.me/5531996158950?text=Ol%C3%A1!%20Vim%20pelo%20link%20da%20bio%20e%20quero%20saber%20mais%20sobre%20as%20expedi%C3%A7%C3%B5es%20da%20JT."
            icon={<WhatsAppIcon size={22} />}
            label="WhatsApp"
            accent="whatsapp"
          />

          <QuickChannelIcon
            href="/"
            onClick={goHome}
            external={false}
            icon={<Compass size={22} strokeWidth={2} />}
            label="Site Oficial"
            accent="gold"
          />

          <QuickChannelIcon
            href="https://adv.jtviajarcorrer.com.br"
            icon={<ShieldCheck size={22} strokeWidth={2} />}
            label="ADV"
            accent="teal"
          />

          <QuickChannelIcon
            href="https://www.instagram.com/jtviajarcorrer/"
            icon={<InstagramIcon size={21} />}
            label="Instagram"
            accent="teal"
          />
        </section>

        {/* ── Próximas Expedições ── */}
        <section>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              marginBottom: 14,
              padding: '0 4px',
            }}
          >
            <h2
              style={{
                fontFamily: "'Alumni Sans', sans-serif",
                fontStyle: 'italic',
                fontWeight: 800,
                fontSize: 22,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: '#f1f5f9',
                margin: 0,
                lineHeight: 1,
              }}
            >
              {rich('links_expedicoes_titulo', [GOLD_TEXT])}
            </h2>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    className="shimmer-bg"
                    style={{
                      width: 88,
                      height: 88,
                      borderRadius: '50%',
                      flexShrink: 0,
                      border: '2px solid rgba(155,200,169,0.15)',
                    }}
                  />
                  <div
                    className="shimmer-bg"
                    style={{
                      flex: 1,
                      height: 66,
                      marginLeft: -24,
                      borderRadius: '0 16px 16px 0',
                      border: '1px solid rgba(155,200,169,0.1)',
                    }}
                  />
                </div>
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                color: 'rgba(241,245,249,0.5)',
                textAlign: 'center',
                padding: '24px 0',
              }}
            >
              {t('expedicoes_vazio')}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {upcoming.map((exp) => (
                <ExpeditionBubbleLink key={exp.id || exp.slug} exp={exp} navigate={navigate} />
              ))}
            </div>
          )}
        </section>

        {/* ── Rodapé compacto ── */}
        <footer style={{ textAlign: 'center', marginTop: 38 }}>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 11,
              color: 'rgba(241, 245, 249, 0.35)',
              margin: 0,
            }}
          >
            {t('rodape_copyright', { ano: new Date().getFullYear() })}
          </p>
        </footer>
      </main>

      <style>{`
        .jt-exp-bubble-row:hover .jt-exp-bubble-circle {
          transform: scale(1.05);
          border-color: #dab83f !important;
        }
        .jt-exp-bubble-row:hover .jt-exp-bubble-img {
          transform: scale(1.1);
        }
        .jt-exp-bubble-row:hover .jt-exp-bubble-rect {
          transform: translateX(3px);
          border-color: rgba(218, 184, 63, 0.45) !important;
          background: linear-gradient(135deg, rgba(0, 65, 64, 0.58) 0%, rgba(18, 65, 92, 0.38) 55%, rgba(8, 13, 24, 0.94) 100%) !important;
        }
        .jt-exp-bubble-row:hover .jt-exp-bubble-arrow {
          background: #dab83f !important;
          color: #06111a !important;
          transform: translateX(2px);
        }
        @media (max-width: 400px) {
          .jt-exp-bubble-circle {
            width: 80px !important;
            height: 80px !important;
          }
        }
      `}</style>
    </div>
  );
}
