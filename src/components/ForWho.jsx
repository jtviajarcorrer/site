import { useT } from '../content/SiteTexts.jsx';
import { imgUrl } from '../utils/img.js';

export default function ForWho() {
  const { t, rich } = useT();
  const photoSrc = t('para_quem_foto') || '/hero.jpg';

  return (
    <section
      id="para-quem"
      style={{
        padding: '48px 24px 72px',
        maxWidth: 1100,
        margin: '0 auto',
      }}
    >
      <div style={{ maxWidth: 780 }}>
        <h2 className="section-title" style={{ marginBottom: 24 }}>
          {rich('para_quem_titulo', ['#dab83f', '#9bc8a9'])}
        </h2>

        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 16,
            color: 'rgba(241,245,249,0.6)',
            lineHeight: 1.75,
            margin: '0 0 16px',
          }}
        >
          {t('para_quem_paragrafo_1')}
        </p>

        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 16,
            color: 'rgba(241,245,249,0.6)',
            lineHeight: 1.75,
            margin: '0 0 16px',
          }}
        >
          {t('para_quem_paragrafo_2')}
        </p>

        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 16,
            color: 'rgba(241,245,249,0.6)',
            lineHeight: 1.75,
            margin: '0 0 36px',
          }}
        >
          {t('para_quem_paragrafo_3')}
        </p>
      </div>

      {photoSrc && (
        <div
          className="reveal for-who-photo-wrap"
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 780,
            borderRadius: 20,
            overflow: 'hidden',
            border: '1px solid rgba(155,200,169,0.14)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
            aspectRatio: '16 / 9',
            background: '#080d18',
          }}
        >
          <img
            src={imgUrl(photoSrc, 1280)}
            alt="Perfil dos viajantes JT"
            loading="lazy"
            decoding="async"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 35%',
              display: 'block',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(6,17,26,0.45) 0%, transparent 45%)',
              pointerEvents: 'none',
            }}
          />
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          #para-quem {
            padding: 24px 20px 44px !important;
          }
          .for-who-photo-wrap {
            aspect-ratio: 4 / 3 !important;
            border-radius: 16px !important;
          }
        }
      `}</style>
    </section>
  );
}
