import { useEffect, useMemo, useRef, useState } from 'react';
import { EXPEDITIONS, STATS } from '../data/expeditions.js';
import { useT } from '../content/SiteTexts.jsx';
import { imgUrl } from '../utils/img.js';

function AnimatedNumber({ target, suffix, started }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!started) return;
    const duration = 1800, steps = 60, increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setDisplay(target); clearInterval(timer); }
      else setDisplay(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, target]);
  return <span>{target >= 1000 ? display.toLocaleString('pt-BR') : display}{suffix}</span>;
}

const GOLD_TEXT = {
  background: 'linear-gradient(135deg,#dab83f,#e8ca6a)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

// "46K+" -> { value: 46, suffix: 'K+' } ; "1.200+" -> { value: 1200, suffix: '+' }
function parseStat(raw) {
  const m = String(raw).match(/^\s*([\d.,]+)\s*(.*)$/);
  if (!m) return { value: 0, suffix: String(raw) };
  return { value: parseInt(m[1].replace(/[.,]/g, ''), 10) || 0, suffix: m[2] };
}

// Ícones vetoriais exclusivos em dois tons (dourado #dab83f + menta #9bc8a9)
function StatIcon({ index }) {
  const commonProps = {
    width: 28,
    height: 28,
    viewBox: '0 0 24 24',
    fill: 'none',
     strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  switch (index) {
    // 0: Seguidores / Comunidade (Instagram + pulso de comunidade)
    case 0:
      return (
        <svg {...commonProps}>
          <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="#dab83f" strokeWidth="1.75" />
          <circle cx="12" cy="12" r="4.2" stroke="#9bc8a9" strokeWidth="1.75" />
          <circle cx="17.4" cy="6.6" r="1.2" fill="#dab83f" />
        </svg>
      );
    // 1: Destinos pelo Mundo (Globo com rota de voo)
    case 1:
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" stroke="#dab83f" strokeWidth="1.75" />
          <path d="M3.6 9h16.8M3.6 15h16.8" stroke="#9bc8a9" strokeWidth="1.4" strokeOpacity="0.85" />
          <path d="M12 3c2.5 2.6 3.9 5.6 3.9 9s-1.4 6.4-3.9 9c-2.5-2.6-3.9-5.6-3.9-9S9.5 5.6 12 3Z" stroke="#dab83f" strokeWidth="1.6" />
        </svg>
      );
    // 2: Anos de Expedições (Troféu / Conquista)
    case 2:
      return (
        <svg {...commonProps}>
          <path d="M8 21h8M12 17v4" stroke="#9bc8a9" strokeWidth="1.75" />
          <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" stroke="#dab83f" strokeWidth="1.75" />
          <path d="M7 6H4.5a2 2 0 0 0-2 2v.5A3.5 3.5 0 0 0 6 12h1.2M17 6h2.5a2 2 0 0 1 2 2v.5A3.5 3.5 0 0 1 18 12h-1.2" stroke="#9bc8a9" strokeWidth="1.5" />
        </svg>
      );
    // 3: Corredores-Viajantes (Tênis de corrida com linhas de velocidade)
    default:
      return (
        <svg {...commonProps}>
          <path
            d="M3.5 16.5h16.8c.9 0 1.5-.7 1.3-1.6l-.5-2.2a2.6 2.6 0 0 0-2-2l-3.9-.9a2.5 2.5 0 0 1-1.6-1.2L12.1 6c-.4-.7-1.3-.9-1.9-.4L8.6 7c-.5.4-.6 1.1-.3 1.7l.7 1.3c.2.4 0 .9-.4 1.1l-4.2 1.6a2.3 2.3 0 0 0-1.5 2.2v.3c0 .7.6 1.3 1.3 1.3Z"
            stroke="#dab83f"
            strokeWidth="1.75"
          />
          <path d="M3 19.5h18" stroke="#9bc8a9" strokeWidth="1.75" />
          <path d="M2 11h3.5M1.5 8h2.5" stroke="#9bc8a9" strokeWidth="1.4" strokeOpacity="0.85" />
        </svg>
      );
  }
}

export default function Stats({ expeditions = [] }) {
  const { t, rich } = useT();
  const stats = STATS.map((s, i) => ({
    ...s,
    id: i + 1,
    ...parseStat(t(`estat_${i + 1}_numero`)),
    label: t(`estat_${i + 1}_rotulo`),
  }));

  // Imagens de fundo vindas de todas as expedições (com fallback para EXPEDITIONS)
  const bgSlides = useMemo(() => {
    const source = expeditions && expeditions.length > 0 ? expeditions : EXPEDITIONS;
    const seen = new Set();
    return source
      .filter((e) => e && e.cover_image && !seen.has(e.cover_image) && seen.add(e.cover_image))
      .map((e) => ({
        id: e.id || e.slug,
        name: e.name,
        url: imgUrl(e.cover_image, 1400, 75),
      }));
  }, [expeditions]);

  const [bgIndex, setBgIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (bgSlides.length <= 1) return;
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % bgSlides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [bgSlides.length]);

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        padding: '120px 24px',
        overflow: 'hidden',
      }}
    >
      {/* Carrossel automático de fundo com máscara orgânica (sem efeito "quadradão") */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: '-40px 0',
          pointerEvents: 'none',
          zIndex: 0,
          WebkitMaskImage:
            'radial-gradient(ellipse 84% 72% at 50% 52%, rgba(0,0,0,1) 18%, rgba(0,0,0,0.65) 58%, rgba(0,0,0,0) 96%)',
          maskImage:
            'radial-gradient(ellipse 84% 72% at 50% 52%, rgba(0,0,0,1) 18%, rgba(0,0,0,0.65) 58%, rgba(0,0,0,0) 96%)',
        }}
      >
        {bgSlides.map((slide, idx) => {
          const isActive = idx === bgIndex;
          return (
            <div
              key={slide.id || idx}
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${slide.url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: isActive ? 0.34 : 0,
                transform: isActive ? 'scale(1.08)' : 'scale(1.0)',
                transition: 'opacity 2s ease-in-out, transform 6.5s ease-out',
                filter: 'saturate(1.1) contrast(1.05)',
              }}
            />
          );
        })}

        {/* Degradês suaves nas 4 bordas + matiz da marca para fundir com o fundo do site */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, var(--jt-bg, #06111a) 0%, rgba(6,17,26,0.25) 28%, rgba(6,17,26,0.3) 72%, var(--jt-bg, #06111a) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 50% 50%, rgba(0,65,64,0.18) 0%, rgba(6,17,26,0.72) 78%, var(--jt-bg, #06111a) 100%)',
          }}
        />
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 className="section-title" style={{ marginBottom: 12 }}>
            {rich('comunidade_titulo', [GOLD_TEXT])}
          </h2>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 16,
              color: 'rgba(241,245,249,0.72)',
              maxWidth: 460,
              margin: '0 auto',
              textShadow: '0 2px 12px rgba(0,0,0,0.5)',
            }}
          >
            {t('comunidade_subtitulo')}
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
          }}
        >
          {stats.map((stat, i) => (
            <div
              key={stat.id}
              className="reveal"
              style={{
                transitionDelay: `${i * 100}ms`,
                textAlign: 'center',
                padding: '40px 24px 36px',
                background:
                  'linear-gradient(165deg, rgba(10, 26, 38, 0.68) 0%, rgba(6, 17, 26, 0.52) 100%)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                border: '1px solid rgba(218, 184, 63, 0.16)',
                borderRadius: 22,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
                transition: 'transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'rgba(218, 184, 63, 0.42)';
                e.currentTarget.style.boxShadow =
                  '0 20px 44px rgba(0, 0, 0, 0.48), 0 0 28px rgba(218, 184, 63, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(218, 184, 63, 0.16)';
                e.currentTarget.style.boxShadow =
                  '0 16px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.06)';
              }}
            >
              {/* Halo luminoso sutil atrás do ícone */}
              <div
                style={{
                  position: 'absolute',
                  top: -20,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 140,
                  height: 140,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(218,184,63,0.12) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }}
              />

              {/* Medalhão do ícone */}
              <div
                style={{
                  width: 60,
                  height: 60,
                  margin: '0 auto 18px',
                  borderRadius: 18,
                  background:
                    'linear-gradient(135deg, rgba(218,184,63,0.14) 0%, rgba(0,65,64,0.28) 100%)',
                  border: '1px solid rgba(218,184,63,0.32)',
                  boxShadow:
                    '0 8px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <StatIcon index={i} />
              </div>

              <div
                style={{
                  fontFamily: "'Alumni Sans', sans-serif",
                  fontStyle: 'italic',
                  fontSize: 'clamp(44px, 6vw, 64px)',
                  fontWeight: 900,
                  background: 'linear-gradient(135deg,#dab83f,#e8ca6a)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1,
                  marginBottom: 6,
                }}
              >
                <AnimatedNumber target={stat.value} suffix={stat.suffix} started={started} />
              </div>

              <div
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'rgba(241,245,249,0.75)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
