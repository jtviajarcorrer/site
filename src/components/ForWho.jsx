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
    }, 3500);
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
        padding: '48px 24px 72px',
        maxWidth: 1100,
        margin: '0 auto',
      }}
    >
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
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

      {photos.length > 0 && (
        <div
          className="reveal for-who-photo-wrap"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 820,
            margin: '0 auto',
            borderRadius: 20,
            overflow: 'hidden',
            border: '1px solid rgba(155,200,169,0.14)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
            aspectRatio: '1640 / 924',
            background: '#080d18',
            userSelect: 'none',
          }}
        >
          {photos.map((src, i) => {
            const active = i === idx;
            return (
              <img
                key={src + i}
                src={imgUrl(src, 1280)}
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
                  opacity: active ? 1 : 0,
                  transform: active ? 'scale(1)' : 'scale(1.02)',
                  transition: 'opacity 0.65s ease-in-out, transform 0.65s ease-in-out',
                  pointerEvents: active ? 'auto' : 'none',
                }}
              />
            );
          })}

          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(6,17,26,0.5) 0%, transparent 35%)',
              pointerEvents: 'none',
            }}
          />

          {photos.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Foto anterior"
                onClick={prev}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  border: '1px solid rgba(218,184,63,0.45)',
                  background: 'rgba(6,17,26,0.65)',
                  backdropFilter: 'blur(6px)',
                  color: '#dab83f',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 3,
                }}
              >
                <ChevronLeft size={18} />
              </button>

              <button
                type="button"
                aria-label="Próxima foto"
                onClick={next}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  border: '1px solid rgba(218,184,63,0.45)',
                  background: 'rgba(6,17,26,0.65)',
                  backdropFilter: 'blur(6px)',
                  color: '#dab83f',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 3,
                }}
              >
                <ChevronRight size={18} />
              </button>

              <div
                style={{
                  position: 'absolute',
                  bottom: 12,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  zIndex: 3,
                  background: 'rgba(6,17,26,0.55)',
                  backdropFilter: 'blur(6px)',
                  padding: '5px 10px',
                  borderRadius: 99,
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {photos.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Ir para foto ${i + 1}`}
                    onClick={() => setIdx(i)}
                    style={{
                      width: i === idx ? 18 : 6,
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
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          #para-quem {
            padding: 24px 20px 44px !important;
          }
          .for-who-photo-wrap {
            border-radius: 16px !important;
          }
        }
      `}</style>
    </section>
  );
}
