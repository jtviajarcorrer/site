import { useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function Hero({ navigate }) {

  useEffect(() => {
    const els = document.querySelectorAll('.hero-animate');
    els.forEach((el, i) => {
      el.style.opacity = '0';
      setTimeout(() => {
        el.style.transition = `opacity 1.2s ease ${i * 0.3}s`;
        el.style.opacity = '1';
      }, 100);
    });
  }, []);

  const scrollToExpeditions = () => {
    document.querySelector('#expedicoes')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section style={{ position: 'relative', height: '100vh', minHeight: 600, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>

      {/* BG */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <video
          src="/hero.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="kenburns"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%', filter: 'blur(6px) brightness(1.1)' }}
        />
        {/* Overlay da grade escurecida (mesh/grid) */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.5) 1px, transparent 1px)',
          backgroundSize: '3px 3px',
          zIndex: 1,
        }} />
        
        {/* Overlay escuro nas bordas, fundindo com a página */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to top, rgba(6,14,24,1) 0%, rgba(6,14,24,0.6) 40%, rgba(6,14,24,0.2) 70%, rgba(8,13,24,0.5) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to right, rgba(6,14,24,0.8) 0%, transparent 50%, rgba(6,14,24,0.4) 100%)' }} />
      </div>

      {/* Conteúdo — ancorado na parte de baixo, lado esquerdo */}
      <div className="hero-content" style={{
        position: 'relative', zIndex: 2,
        width: '100%', maxWidth: 1200, margin: '0 auto',
        padding: '0 56px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 48,
      }}>

        {/* Logo */}
        <div className="hero-animate hero-logo-container">
          <img
            src="/logo-jt-crop.png"
            alt="JT Viajar Correr"
            style={{
              width: 176,
              height: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 20px rgba(0,0,0,0.6))',
            }}
          />
        </div>

        {/* Frase + CTA — direita */}
        <div className="hero-animate hero-text-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 28, maxWidth: 580 }}>
          <p className="hero-main-text" style={{
            fontFamily: "'Alumni Sans', sans-serif",
            fontStyle: 'italic',
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 700,
            lineHeight: 1.1,
            color: '#f1f5f9',
            margin: 0,
            textAlign: 'right',
          }}>
            Viva a experiência de correr em{' '}
            <span style={{ background: 'linear-gradient(135deg,#dab83f,#e8ca6a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              destinos incríveis
            </span>{' '}
            pelo mundo com pessoas de energia única.
          </p>

          <button
            onClick={scrollToExpeditions}
            style={{
              fontFamily: "'Alumni Sans', sans-serif",
              fontStyle: 'italic',
              fontSize: 18,
              fontWeight: 400,
              letterSpacing: '0.08em',
              background: 'none',
              color: 'rgba(241,245,249,0.5)',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#dab83f'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(241,245,249,0.5)'}
          >
            Ver Expedições
            <ChevronDown size={18} style={{ animation: 'pulse-down 1.6s ease-in-out infinite' }} />
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollToExpeditions}
        className="scroll-indicator"
        style={{
          position: 'absolute', bottom: 28, right: 56,
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'rgba(218,184,63,0.4)', display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 4, transition: 'color 0.2s', zIndex: 3,
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'rgba(218,184,63,0.85)'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(218,184,63,0.4)'}
      >
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase' }}>scroll</span>
        <ChevronDown size={15} style={{ animation: 'bounce 2s infinite' }} />
      </button>

      <style>{`
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(6px)} }
        @keyframes pulse-down {
          0%, 100% { transform: translateY(0); opacity: 0.75; }
          50%       { transform: translateY(5px); opacity: 1; }
        }
        @media (max-width: 768px) {
          section > div:last-of-type { padding: 0 24px 56px !important; }
          .hero-content {
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 0 24px !important;
            gap: 32px !important;
          }
          .hero-logo-container img {
            width: 112px !important;
          }
          .hero-text-container {
            align-items: center !important;
          }
          .hero-main-text {
            text-align: center !important;
          }
          .scroll-indicator {
            right: 50% !important;
            transform: translateX(50%) !important;
          }
        }
      `}</style>
    </section>
  );
}
