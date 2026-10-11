import Navbar from '../components/Navbar.jsx';
import Hero from '../components/Hero.jsx';
import ExpeditionsGrid from '../components/ExpeditionsGrid.jsx';
import HowItWorks from '../components/HowItWorks.jsx';
import Stats from '../components/Stats.jsx';
import Testimonials from '../components/Testimonials.jsx';
import Footer from '../components/Footer.jsx';
import VideoCarousel from '../components/VideoCarousel.jsx';
import { useT } from '../content/SiteTexts.jsx';

export default function HomePage({ expeditions, loading, navigate }) {
  const { t, rich } = useT();
  return (
    <div style={{ minHeight: '100vh', background: 'var(--jt-bg)' }}>
      <Navbar navigate={navigate} />
      <Hero navigate={navigate} />
      <ExpeditionsGrid expeditions={expeditions} loading={loading} navigate={navigate} />

      {/* Sobre a JT */}
      <section id="sobre" style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 60, alignItems: 'flex-start' }}>
          <div className="reveal">

            <h2 className="section-title">
              {rich('sobre_titulo', ['#9bc8a9', '#dab83f'])}
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: 'rgba(241,245,249,0.6)', lineHeight: 1.75, margin: '0 0 16px' }}>
              {t('sobre_paragrafo_1')}
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: 'rgba(241,245,249,0.6)', lineHeight: 1.75, margin: '0 0 36px' }}>
              {t('sobre_paragrafo_2')}
            </p>
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginTop: 8 }}>
              <div>
                <div style={{ fontFamily: "'Alumni Sans', sans-serif", fontSize: 48, fontWeight: 900, color: '#dab83f', lineHeight: 1 }}>
                  {t('sobre_numero_1')}
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: 'rgba(241,245,249,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>
                  {t('sobre_rotulo_1')}
                </div>
              </div>
              <div style={{ width: 1, background: 'rgba(155,200,169,0.15)' }} />
              <div>
                <div style={{ fontFamily: "'Alumni Sans', sans-serif", fontSize: 48, fontWeight: 900, color: '#dab83f', lineHeight: 1 }}>
                  {t('sobre_numero_2')}
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: 'rgba(241,245,249,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>
                  {t('sobre_rotulo_2')}
                </div>
              </div>
            </div>
          </div>

          {/* Visual side: Videos */}
          <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <h3 className="section-title" style={{ marginBottom: 8 }}>
                {rich('recomenda_titulo', ['#dab83f'])}
              </h3>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: 'rgba(241,245,249,0.6)', maxWidth: 500, margin: '0 0 24px' }}>
                {t('recomenda_subtitulo')}
              </p>
            </div>
            <div style={{ width: '100%', maxWidth: '100%' }}>
              <VideoCarousel />
            </div>
          </div>
        </div>
      </section>

      <HowItWorks />
      <Stats />
      <Testimonials />

      <Footer navigate={navigate} />
    </div>
  );
}
