export default function Footer({ navigate }) {
  const InstagramIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
  const WhatsAppIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );

  return (
    <footer id="contato" style={{ borderTop: '1px solid rgba(155,200,169,0.08)', padding: '60px 24px 32px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Final CTA */}
        <div style={{ textAlign: 'center', padding: '64px 24px', background: '#004140', border: '1px solid rgba(155,200,169,0.2)', borderRadius: 28, marginBottom: 60 }}>
          <h2 style={{ fontFamily: "'Alumni Sans', sans-serif", fontStyle: 'italic', fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, textTransform: 'uppercase', color: '#f1f5f9', lineHeight: 0.95, letterSpacing: '0.02em', margin: '0 0 16px' }}>
            Pronto para sua{' '}
            <span style={{ color: '#dab83f' }}>
              próxima expedição?
            </span>
          </h2>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 17, color: 'rgba(155,200,169,0.85)', maxWidth: 460, margin: '0 auto 36px' }}>
            Fale com nossa equipe e garanta sua vaga antes que esgote.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="https://wa.me/5531996158950" target="_blank" rel="noopener noreferrer"
              style={{ padding: '16px 32px', fontSize: 16, borderRadius: 99, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10, background: '#dab83f', color: '#06111a', fontFamily: "'Inter', sans-serif", fontWeight: 700, transition: 'opacity 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <WhatsAppIcon /> Falar no WhatsApp
            </a>
            <a href="https://www.instagram.com/jtviajarcorrer/" target="_blank" rel="noopener noreferrer"
              style={{ padding: '16px 32px', fontSize: 16, borderRadius: 99, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10, background: 'transparent', border: '1.5px solid rgba(155,200,169,0.5)', color: '#9bc8a9', fontFamily: "'Inter', sans-serif", fontWeight: 600, transition: 'border-color 0.2s, color 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#9bc8a9'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(155,200,169,0.5)'; e.currentTarget.style.color = '#9bc8a9'; }}
            >
              <InstagramIcon /> @jtviajarcorrer
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <img src="/logo-jt.png" alt="JT Viajar Correr" style={{ height: 44, width: 'auto', objectFit: 'contain', filter: 'contrast(1.05) brightness(1.1)', opacity: 0.8 }} />
          </button>

          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: 'rgba(15,23,42,0.4)', margin: 0 }}>
            © {new Date().getFullYear()} Just Travel — Expedições de Corrida. Todos os direitos reservados.
          </p>

          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { href: 'https://www.instagram.com/jtviajarcorrer/', Icon: InstagramIcon, hoverColor: '#9bc8a9' },
              { href: 'https://wa.me/5531996158950', Icon: WhatsAppIcon, hoverColor: '#4ade80' },
            ].map(({ href, Icon, hoverColor }) => (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,65,64,0.25)', border: '1px solid rgba(155,200,169,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(155,200,169,0.5)', textDecoration: 'none', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,65,64,0.5)'; e.currentTarget.style.color = hoverColor; e.currentTarget.style.borderColor = `${hoverColor}44`; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,65,64,0.25)'; e.currentTarget.style.color = 'rgba(155,200,169,0.5)'; e.currentTarget.style.borderColor = 'rgba(155,200,169,0.12)'; }}
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
