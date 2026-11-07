import { Users, Heart, Medal, MapPin } from 'lucide-react';
import { useT } from '../content/SiteTexts.jsx';

const GOLD_TEXT = {
  background: 'linear-gradient(135deg,#dab83f,#e8ca6a)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

const PROFILES = [
  {
    icon: Users,
    titleKey: 'para_quem_1_titulo',
    descKey: 'para_quem_1_texto',
    color: '#dab83f',
  },
  {
    icon: Heart,
    titleKey: 'para_quem_2_titulo',
    descKey: 'para_quem_2_texto',
    color: '#9bc8a9',
  },
  {
    icon: Medal,
    titleKey: 'para_quem_3_titulo',
    descKey: 'para_quem_3_texto',
    color: '#9bc8a9',
  },
  {
    icon: MapPin,
    titleKey: 'para_quem_4_titulo',
    descKey: 'para_quem_4_texto',
    color: '#dab83f',
  },
];

export default function ForWho() {
  const { t, rich } = useT();

  return (
    <section
      id="para-quem"
      style={{
        padding: '96px 24px 80px',
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      {/* Header no mesmo padrão visual de Próximas Expedições */}
      <div
        className="reveal for-who-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 32,
          marginBottom: 44,
        }}
      >
        <div>
          <h2 className="section-title" style={{ margin: 0 }}>
            {rich('para_quem_titulo', [GOLD_TEXT])}
          </h2>
        </div>
        <div
          className="for-who-divider"
          style={{ width: 1, height: 80, background: 'rgba(241,245,249,0.2)', flexShrink: 0 }}
        />
        <p
          style={{
            fontFamily: "'Alumni Sans', sans-serif",
            fontStyle: 'italic',
            fontSize: 24,
            fontWeight: 400,
            color: 'rgba(241,245,249,0.75)',
            maxWidth: 560,
            margin: 0,
            lineHeight: 1.2,
            letterSpacing: '0.04em',
          }}
        >
          {t('para_quem_subtitulo')}
        </p>
      </div>

      {/* Cards de perfil */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 24,
        }}
      >
        {PROFILES.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={item.titleKey}
              className="reveal"
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              <div
                style={{
                  background: 'rgba(18,65,92,0.14)',
                  border: '1px solid rgba(155,200,169,0.1)',
                  borderRadius: 20,
                  padding: '30px 26px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease, border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.background = 'rgba(0,65,64,0.22)';
                  e.currentTarget.style.borderColor = `${item.color}55`;
                  e.currentTarget.style.boxShadow = '0 18px 44px rgba(0,0,0,0.28)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = 'rgba(18,65,92,0.14)';
                  e.currentTarget.style.borderColor = 'rgba(155,200,169,0.1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: `${item.color}18`,
                    border: `1px solid ${item.color}44`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 22,
                  }}
                >
                  <Icon size={22} color={item.color} />
                </div>

                <h3
                  style={{
                    fontFamily: "'Alumni Sans', sans-serif",
                    fontStyle: 'italic',
                    fontSize: 25,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: '#f1f5f9',
                    margin: '0 0 10px',
                    lineHeight: 1.08,
                    letterSpacing: '0.02em',
                  }}
                >
                  {t(item.titleKey)}
                </h3>

                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 14,
                    color: 'rgba(241,245,249,0.65)',
                    lineHeight: 1.68,
                    margin: 0,
                  }}
                >
                  {t(item.descKey)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .for-who-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
          .for-who-divider {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}
