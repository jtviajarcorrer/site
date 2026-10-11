import Navbar from '../components/Navbar.jsx';
import Hero from '../components/Hero.jsx';
import ExpeditionsGrid from '../components/ExpeditionsGrid.jsx';
import HowItWorks from '../components/HowItWorks.jsx';
import Stats from '../components/Stats.jsx';
import Testimonials from '../components/Testimonials.jsx';
import Footer from '../components/Footer.jsx';
import VideoCarousel from '../components/VideoCarousel.jsx';

export default function HomePage({ expeditions, navigate }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--jt-bg)' }}>
      <Navbar navigate={navigate} />
      <Hero navigate={navigate} />
      <ExpeditionsGrid expeditions={expeditions} navigate={navigate} />

      {/* Sobre a JT */}
      <section id="sobre" style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 60, alignItems: 'flex-start' }}>
          <div className="reveal">

            <h2 className="section-title">
              Correr é nossa{' '}
              <span style={{ color: '#9bc8a9' }}>
                paixão
              </span>
              , viajar é nossa{' '}
              <span style={{ color: '#dab83f' }}>
                missão
              </span>
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: 'rgba(241,245,249,0.6)', lineHeight: 1.75, margin: '0 0 16px' }}>
              A Just Travel nasceu da união de duas paixões: correr e explorar o mundo. Há mais de 8 anos organizamos expedições que transformam corredores em viajantes e destinos incríveis em memórias eternas.
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: 'rgba(241,245,249,0.6)', lineHeight: 1.75, margin: '0 0 36px' }}>
              Nossa galera de 46K seguidores sabe que cada quilômetro percorrido em um destino novo vale muito mais do que simplesmente cruzar a linha de chegada — é uma história que você carrega para sempre.
            </p>
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginTop: 8 }}>
              <div>
                <div style={{ fontFamily: "'Alumni Sans', sans-serif", fontSize: 48, fontWeight: 900, color: '#dab83f', lineHeight: 1 }}>
                  +5.000
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: 'rgba(241,245,249,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>
                  Corredores
                </div>
              </div>
              <div style={{ width: 1, background: 'rgba(155,200,169,0.15)' }} />
              <div>
                <div style={{ fontFamily: "'Alumni Sans', sans-serif", fontSize: 48, fontWeight: 900, color: '#dab83f', lineHeight: 1 }}>
                  +120
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: 'rgba(241,245,249,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>
                  Destinos Realizados
                </div>
              </div>
            </div>
          </div>

          {/* Visual side: Videos */}
          <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <h3 className="section-title" style={{ marginBottom: 8 }}>
                Quem viaja, <span style={{ color: '#dab83f' }}>recomenda</span>
              </h3>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: 'rgba(241,245,249,0.6)', maxWidth: 500, margin: '0 0 24px' }}>
                Confira a energia de quem já cruzou a linha de chegada conosco pelos 4 cantos do mundo.
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
