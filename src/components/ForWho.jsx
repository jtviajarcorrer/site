import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useT } from '../content/SiteTexts.jsx';
import { imgUrl } from '../utils/img.js';

export default function ForWho() {
  const { t, rich } = useT();
  const rawPhotos = t('para_quem_foto') || '/hero.jpg';

  const photos = useMemo(() => {
    const list = String(rawPhotos)
      .split(/[\r\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    return list.length ? list : ['/hero.jpg'];
  }, [rawPhotos]);

  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(null);

  useEffect(() => {
    if (idx >= photos.length) setIdx(0);
  }, [photos.length, idx]);

  useEffect(() => {
    if (photos.length <= 1 || paused) return;
    const timer = setInterval(() => {
      setIdx((prev) => (prev + 1) % photos.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [photos.length, paused]);

  const prev = () => setIdx((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setIdx((i) => (i + 1) % photos.length);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches?.[0]?.clientX ?? null;
    setPaused(true);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current !== null) {
      const endX = e.changedTouches?.[0]?.clientX ?? touchStartX.current;
      const diff = touchStartX.current - endX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) next();
        else prev();
      }
    }
    touchStartX.current = null;
    setTimeout(() => setPaused(false), 1500);
  };

  return (
    <section
      id="para-quem"
      data-analytics-section="para_quem"
      style={{
        padding: '24px 24px 48px',
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      <div
        className="for-who-showcase"
        style={{
          position: 'relative',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: 20,
          overflow: 'hidden',
        }}
      >
        {/* Coluna de Texto à Esquerda (sobrepõe apenas a bordinha inicial da foto) */}
        <div
          className="reveal reveal-left for-who-text-box"
          style={{
            position: 'relative',
            zIndex: 3,
            width: '45%',
            flexShrink: 0,
            padding: '32px 16px 32px 8px',
          }}
        >
          <h2
            className="section-title"
            style={{
              marginBottom: 20,
              textShadow: '0 4px 24px rgba(0,0,0,0.6)',
            }}
          >
            {rich('para_quem_titulo', ['#dab83f', '#9bc8a9'])}
          </h2>

          <p
            style={{
              fontFamily: "'Alumni Sans', sans-serif",
              fontStyle: 'italic',
              fontSize: 22,
              fontWeight: 400,
              letterSpacing: '0.04em',
              color: 'rgba(241,245,249,0.88)',
              lineHeight: 1.3,
              margin: '0 0 14px',
              textShadow: '0 2px 14px rgba(0,0,0,0.75)',
            }}
          >
            {t('para_quem_paragrafo_1')}
          </p>

          <p
            style={{
              fontFamily: "'Alumni Sans', sans-serif",
              fontStyle: 'italic',
              fontSize: 22,
              fontWeight: 400,
              letterSpacing: '0.04em',
              color: 'rgba(241,245,249,0.82)',
              lineHeight: 1.3,
              margin: '0 0 14px',
              textShadow: '0 2px 14px rgba(0,0,0,0.75)',
            }}
          >
            {t('para_quem_paragrafo_2')}
          </p>

          <p
            style={{
              fontFamily: "'Alumni Sans', sans-serif",
              fontStyle: 'italic',
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: '0.04em',
              color: '#9bc8a9',
              lineHeight: 1.3,
              margin: 0,
              textShadow: '0 2px 14px rgba(0,0,0,0.75)',
            }}
          >
            {t('para_quem_paragrafo_3')}
          </p>
        </div>

        {/* Camada de Fotos à Direita mantendo proporção 16:9 inteira e degradê curto apenas na borda esquerda */}
        {photos.length > 0 && (
          <div
            className="reveal reveal-right for-who-photo-stage"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{
              position: 'relative',
              width: '60%',
              marginLeft: '-5%',
              aspectRatio: '1640 / 924',
              borderRadius: 18,
              overflow: 'hidden',
              userSelect: 'none',
              zIndex: 1,
              flexShrink: 0,
            }}
          >
            {photos.map((src, i) => {
              const active = i === idx;
              return (
                <img
                  key={src + i}
                  src={imgUrl(src, 1400)}
                  alt={`Perfil dos viajantes JT ${i + 1}`}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center center',
                    display: 'block',
                    filter: 'brightness(0.75) contrast(1.04)',
                    opacity: active ? 1 : 0,
                    transform: active ? 'scale(1)' : 'scale(1.04)',
                    transition: 'opacity 0.9s ease-in-out, transform 3.8s ease-out',
                    pointerEvents: active ? 'auto' : 'none',
                  }}
                />
              );
            })}

            {/* Degradê curto apenas na bordinha esquerda (0% -> 18%) + película escura suave no resto */}
            <div
              className="for-who-fade-left"
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(90deg, var(--jt-bg) 0%, rgba(6,17,26,0.82) 7%, rgba(6,17,26,0.32) 18%, rgba(6,17,26,0.28) 100%)',
                pointerEvents: 'none',
              }}
            />

            {/* Controles discretos do carrossel no canto inferior direito da imagem */}
            {photos.length > 1 && (
              <div
                className="for-who-controls"
                style={{
                  position: 'absolute',
                  bottom: 22,
                  right: 28,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  zIndex: 4,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(6,17,26,0.65)',
                    backdropFilter: 'blur(8px)',
                    padding: '6px 12px',
                    borderRadius: 99,
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {photos.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Ir para foto ${i + 1}`}
                      onClick={() => setIdx(i)}
                      style={{
                        width: i === idx ? 20 : 6,
                        height: 6,
                        borderRadius: 99,
                        border: 'none',
                        padding: 0,
                        background: i === idx ? '#dab83f' : 'rgba(241,245,249,0.4)',
                        transition: 'all 0.25s ease',
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  aria-label="Foto anterior"
                  onClick={prev}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    border: '1px solid rgba(218,184,63,0.4)',
                    background: 'rgba(6,17,26,0.7)',
                    backdropFilter: 'blur(6px)',
                    color: '#dab83f',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <ChevronLeft size={16} />
                </button>

                <button
                  type="button"
                  aria-label="Próxima foto"
                  onClick={next}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    border: '1px solid rgba(218,184,63,0.4)',
                    background: 'rgba(6,17,26,0.7)',
                    backdropFilter: 'blur(6px)',
                    color: '#dab83f',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 860px) {
          .for-who-showcase {
            flex-direction: column !important;
          }
          .for-who-photo-stage {
            width: 100% !important;
            margin-left: 0 !important;
            aspect-ratio: 1640 / 924 !important;
            order: 1 !important;
          }
          .for-who-fade-left {
            background: linear-gradient(
              to top,
              var(--jt-bg) 0%,
              rgba(6,17,26,0.75) 16%,
              rgba(6,17,26,0.22) 45%,
              rgba(6,17,26,0.22) 100%
            ) !important;
          }
          .for-who-controls {
            bottom: 14px !important;
            right: 16px !important;
          }
          .for-who-text-box {
            order: 2 !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 4px 16px !important;
            margin-top: -18px !important;
          }
        }
      `}</style>
    </section>
  );
}
