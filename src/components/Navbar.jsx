import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const NAV_LINKS = [
  { label: 'Quem Somos',    href: '#sobre' },
  { label: 'Expedições',    href: '#expedicoes' },
  { label: 'Como Funciona', href: '#como-funciona' },
  { label: 'Contato',       href: '#contato' },
];

export default function Navbar({ navigate }) {
  const [scrolled, setScrolled]       = useState(false);
  const [logoVisible, setLogoVisible] = useState(false);
  const [menuOpen, setMenuOpen]       = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setLogoVisible(y > window.innerHeight * 0.7);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleAnchor = (e, href) => {
    e.preventDefault();
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const linkStyle = {
    color: 'rgba(241,245,249,0.85)',
    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
    fontFamily: "'Alumni Sans', sans-serif",
    fontSize: 18,
    fontWeight: 500,
    fontStyle: 'italic',
    letterSpacing: '0.06em',
    textDecoration: 'none',
    padding: '6px 8px',
    borderRadius: 8,
    transition: 'color 0.2s, background 0.2s, text-shadow 0.2s',
    whiteSpace: 'nowrap',
  };

  return (
    <header
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        transition: 'background 0.3s, backdrop-filter 0.3s, border-color 0.3s',
        background: scrolled ? 'rgba(6,14,24,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(155,200,169,0.05)' : '1px solid transparent',
      }}
    >
      {/* Container centralizado, itens à direita */}
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        width: '100%',
        padding: '0 48px',
        height: 68,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
      }}>

        {/* Logo — surge ao passar do hero */}
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex', alignItems: 'center',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            opacity: logoVisible ? 1 : 0,
            transform: logoVisible ? 'translateY(0)' : 'translateY(-8px)',
            transition: 'opacity 0.35s ease, transform 0.35s ease',
            pointerEvents: logoVisible ? 'auto' : 'none',
            flexShrink: 0,
            marginRight: 6,
          }}
        >
          <img
            src="/logo-jt-only.png"
            alt="JT"
            style={{ height: 42, width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.5))' }}
          />
        </button>

        {/* Grupo direita: Nav + Instagram + Hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

          {/* Desktop Nav */}
          <nav
            className="desktop-nav"
            style={{
              display: 'flex', alignItems: 'center',
              background: 'none',
              border: 'none',
              padding: '3px 0',
              gap: 0,
            }}
          >
            {NAV_LINKS.map((link, i) => (
              <span key={link.href} style={{ display: 'flex', alignItems: 'center' }}>
                {i > 0 && (
                  <span style={{ width: 1, height: 14, background: 'rgba(241,245,249,0.2)', flexShrink: 0, margin: '0 4px' }} />
                )}
                <a
                  href={link.href}
                  onClick={e => handleAnchor(e, link.href)}
                  style={linkStyle}
                  onMouseEnter={e => { e.currentTarget.style.color = '#9bc8a9'; e.currentTarget.style.background = 'rgba(155,200,169,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(241,245,249,0.85)'; e.currentTarget.style.background = 'transparent'; }}
                >
                  {link.label}
                </a>
              </span>
            ))}
            
            {/* Área do Viajante */}
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ width: 1, height: 14, background: 'rgba(241,245,249,0.2)', flexShrink: 0, margin: '0 4px' }} />
              <a
                href="https://adv.jtviajarcorrer.com.br"
                target="_blank"
                rel="noopener noreferrer"
                style={linkStyle}
                onMouseEnter={e => { e.currentTarget.style.color = '#9bc8a9'; e.currentTarget.style.background = 'rgba(155,200,169,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(241,245,249,0.85)'; e.currentTarget.style.background = 'transparent'; }}
              >
                Área do Viajante
              </a>
            </span>
          </nav>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/jtviajarcorrer/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram JT Viajar Correr"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '5px 8px',
              color: 'rgba(241,245,249,0.85)',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
              transition: 'color 0.2s, filter 0.2s',
              textDecoration: 'none', flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#dab83f'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(241,245,249,0.85)'; }}
          >
            <InstagramIcon />
          </a>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f1f5f9', display: 'none', padding: 8 }}
            className="mobile-menu-btn"
            aria-label="Menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{ background: 'rgba(8,13,24,0.97)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '16px 24px 24px' }}>
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={e => handleAnchor(e, link.href)}
              style={{ display: 'block', color: 'rgba(241,245,249,0.8)', fontFamily: "'Alumni Sans', sans-serif", fontSize: 20, fontWeight: 400, fontStyle: 'italic', letterSpacing: '0.06em', textDecoration: 'none', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              {link.label}
            </a>
          ))}
          <a
            href="https://adv.jtviajarcorrer.com.br"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'block', color: '#9bc8a9', fontFamily: "'Alumni Sans', sans-serif", fontSize: 20, fontWeight: 500, fontStyle: 'italic', letterSpacing: '0.06em', textDecoration: 'none', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            Área do Viajante
          </a>
          <a
            href="https://www.instagram.com/jtviajarcorrer/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(218,184,63,0.8)', fontFamily: "'Alumni Sans', sans-serif", fontSize: 18, fontWeight: 400, fontStyle: 'italic', letterSpacing: '0.06em', textDecoration: 'none', padding: '14px 0', marginTop: 4 }}
          >
            <InstagramIcon /> @jtviajarcorrer
          </a>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
