import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Pause, Play, Volume2, VolumeX } from 'lucide-react';

const InstagramIcon = ({ size = 13, color = '#dab83f' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

function resolveInstagramVideoStream(url) {
  if (url && url.includes('instagram.com')) {
    return `/api/ig-video?url=${encodeURIComponent(url)}`;
  }
  return url;
}

const TESTIMONIAL_VIDEOS = [
  {
    id: 1,
    name: 'Destaque — JT é real?',
    location: '@jtviajarcorrer',
    quote: '"Consegui passeios incríveis que, se eu tivesse me organizado para fazer tudo isso sozinho, com certeza não ia rolar. Se você não tem tempo de organizar detalhe por detalhe e gosta de corrida: JT, vai na fé!"',
    videoUrl: '/depoimentos/jt-real-1.mp4',
    poster: '/depoimentos/jt-real-1.jpg',
    instagramUrl: 'https://www.instagram.com/s/aGlnaGxpZ2h0OjE4MDE0MjkxNDk3NjkzNDA0',
  },
];

export default function VideoCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef(null);

  const activeVideo = TESTIMONIAL_VIDEOS[activeIndex];
  const total = TESTIMONIAL_VIDEOS.length;

  // Ao trocar de story pelo clique nas setas/barras, carrega a capa parado aguardando o clique (ou continua se a pessoa clicou para avançar)
  useEffect(() => {
    const v = videoRef.current;
    setProgress(0);
    setIsPlaying(false);
    if (!v) return;
    v.pause();
    v.currentTime = 0;
  }, [activeIndex]);

  const prev = (e) => {
    if (e) e.stopPropagation();
    setActiveIndex((current) => (current === 0 ? total - 1 : current - 1));
  };

  const next = (e) => {
    if (e) e.stopPropagation();
    setActiveIndex((current) => (current === total - 1 ? 0 : current + 1));
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
    }
  };

  // Só toca quando a pessoa clica no vídeo / botão Play
  const handleVideoClick = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.muted = isMuted;
      video.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Fallback caso o navegador exija começar mudo
        video.muted = true;
        setIsMuted(true);
        video.play().then(() => setIsPlaying(true)).catch(() => {});
      });
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = (e) => {
    const v = e.currentTarget;
    if (v.duration > 0) {
      setProgress(Math.min(100, (v.currentTime / v.duration) * 100));
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', margin: '0' }}>
      <div style={{ position: 'relative' }}>
        <div key={activeVideo.id} className="video-card-enter" style={{ display: 'flex', alignItems: 'stretch', gap: 28, width: '100%', flexWrap: 'wrap' }}>
          
          {/* Carrossel de Destaque (Story Player) */}
          <div className="video-player-col" style={{ display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0, width: 236 }}>
            {/* Link acima do vídeo indicando os Destaques do Instagram */}
            <a
              href={activeVideo.instagramUrl || 'https://www.instagram.com/s/aGlnaGxpZ2h0OjE4MDE0MjkxNDk3NjkzNDA0?story_media_id=3515182905180088199&cplk=aXhpbTl5MTdnbXN2'}
              target="_blank"
              rel="noopener noreferrer"
              title="Abrir destaque JT é real? no Instagram"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                padding: '6px 12px 6px 8px',
                borderRadius: 999,
                background: 'rgba(18,65,92,0.22)',
                border: '1px solid rgba(218,184,63,0.28)',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(218,184,63,0.14)';
                e.currentTarget.style.borderColor = 'rgba(218,184,63,0.55)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(18,65,92,0.22)';
                e.currentTarget.style.borderColor = 'rgba(218,184,63,0.28)';
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    padding: 2,
                    background: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      background: '#06111a',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <InstagramIcon size={13} color="#dab83f" />
                  </span>
                </span>
                <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, color: '#f1f5f9' }}>
                    Destaque no Instagram
                  </span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: '#dab83f', fontWeight: 500 }}>
                    Abrir "JT é real?" no app
                  </span>
                </span>
              </span>
              <ExternalLink size={13} color="#dab83f" style={{ flexShrink: 0 }} />
            </a>

            <div style={{ position: 'relative', width: '100%' }}>
              <div
                onClick={handleVideoClick}
                style={{ 
                  position: 'relative', 
                  width: '100%', 
                  aspectRatio: '9/16', 
                  borderRadius: 18, 
                  overflow: 'hidden',
                  background: '#0a111a',
                  border: '1px solid rgba(218,184,63,0.28)',
                  boxShadow: '0 12px 34px rgba(0,0,0,0.55)',
                  cursor: 'pointer',
                }}
              >
              {/* Barrinhas de destaque no topo (estilo Instagram Stories) */}
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  right: 10,
                  zIndex: 12,
                  display: 'flex',
                  gap: 4,
                }}
              >
                {TESTIMONIAL_VIDEOS.map((item, idx) => {
                  const barWidth = idx < activeIndex ? 100 : idx === activeIndex ? progress : 0;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveIndex(idx)}
                      aria-label={`Destaque ${idx + 1}`}
                      style={{
                        flex: 1,
                        height: 3,
                         padding: 0,
                        border: 'none',
                        borderRadius: 99,
                        background: 'rgba(255,255,255,0.28)',
                        overflow: 'hidden',
                        cursor: 'pointer',
                      }}
                    >
                      <div
                        style={{
                          width: `${barWidth}%`,
                          height: '100%',
                          background: '#dab83f',
                          transition: idx === activeIndex ? 'width 0.15s linear' : 'none',
                        }}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Selo do Destaque no topo */}
              <div
                style={{
                  position: 'absolute',
                  top: 20,
                  left: 12,
                  right: 12,
                  zIndex: 11,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  pointerEvents: 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      padding: 1.5,
                      background: 'linear-gradient(135deg, #dab83f, #9bc8a9)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <img
                      src="/logo-jt-only.png"
                      alt="JT"
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'contain', background: '#06111a', padding: 2 }}
                    />
                  </div>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, color: '#f1f5f9', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                    JT é real?
                  </span>
                </div>
                {total > 1 && (
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, color: 'rgba(241,245,249,0.8)', background: 'rgba(6,17,26,0.65)', padding: '2px 7px', borderRadius: 99 }}>
                    {activeIndex + 1}/{total}
                  </span>
                )}
              </div>

              <video
                ref={videoRef}
                src={resolveInstagramVideoStream(activeVideo.videoUrl)}
                poster={activeVideo.poster}
                preload="metadata"
                muted={isMuted}
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => {
                  setIsPlaying(false);
                  setProgress(100);
                }}
                onError={(e) => {
                  const fallback = activeVideo.instagramUrl && resolveInstagramVideoStream(activeVideo.instagramUrl);
                  if (fallback && !e.currentTarget.src.includes('/api/ig-video')) {
                    e.currentTarget.src = fallback;
                  }
                }}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />

              {/* Gradientes superior e inferior para leitura */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(6,17,26,0.55) 0%, transparent 25%, transparent 65%, rgba(6,17,26,0.85) 100%)', pointerEvents: 'none' }} />

              {/* Botão Central de Play (aparece quando está pausado para a pessoa clicar) */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                  background: 'rgba(218,184,63,0.92)',
                  borderRadius: '50%',
                  width: 54,
                  height: 54,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: isPlaying ? 0 : 1,
                  transition: 'opacity 0.25s ease, transform 0.25s ease',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                }}
                className="video-play-icon"
              >
                {isPlaying ? (
                  <Pause fill="#06111a" color="#06111a" size={22} />
                ) : (
                  <Play fill="#06111a" color="#06111a" size={24} style={{ marginLeft: 3 }} />
                )}
              </div>

              {!isPlaying && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 14,
                    left: 12,
                    zIndex: 10,
                    pointerEvents: 'none',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'rgba(241,245,249,0.9)',
                  }}
                >
                  Toque para assistir
                </div>
              )}

              {/* Controle de som */}
              <button
                type="button"
                onClick={toggleMute}
                title={isMuted ? 'Ativar áudio' : 'Silenciar áudio'}
                style={{
                  position: 'absolute',
                  bottom: 10,
                  right: 10,
                  zIndex: 10,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 9px',
                  borderRadius: 999,
                  border: '1px solid rgba(218,184,63,0.45)',
                  background: isMuted ? 'rgba(6,17,26,0.82)' : 'rgba(218,184,63,0.92)',
                  color: isMuted ? '#f1f5f9' : '#06111a',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                  transition: 'all 0.2s',
                }}
              >
                {isMuted ? <VolumeX size={13} color="#dab83f" /> : <Volume2 size={13} color="#06111a" />}
                <span>{isMuted ? 'Mudo' : 'Som'}</span>
              </button>
            </div>

            {/* Seta Esquerda (apenas se não for o primeiro vídeo) */}
            {activeIndex > 0 && (
              <button
                type="button"
                onClick={prev}
                aria-label="Vídeo anterior"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: -18,
                  transform: 'translateY(-50%)',
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  border: '1px solid rgba(218,184,63,0.35)',
                  background: 'rgba(6,17,26,0.92)',
                  color: '#f1f5f9',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 15,
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                  transition: 'background 0.2s, color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#dab83f'; e.currentTarget.style.color = '#06111a'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(6,17,26,0.92)'; e.currentTarget.style.color = '#f1f5f9'; }}
              >
                <ChevronLeft size={20} />
              </button>
            )}

            {/* Seta Direita (apenas se houver próximo vídeo) */}
            {activeIndex < total - 1 && (
              <button
                type="button"
                onClick={next}
                aria-label="Próximo vídeo"
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: -18,
                  transform: 'translateY(-50%)',
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  border: '1px solid rgba(218,184,63,0.35)',
                  background: 'rgba(6,17,26,0.92)',
                  color: '#f1f5f9',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 15,
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                  transition: 'background 0.2s, color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#dab83f'; e.currentTarget.style.color = '#06111a'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(6,17,26,0.92)'; e.currentTarget.style.color = '#f1f5f9'; }}
              >
                <ChevronRight size={20} />
              </button>
            )}
            </div>
          </div>

          {/* Traveler Info */}
          <div className="video-info-col" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', flex: '1 1 240px', paddingTop: 38 }}>
            <div>
              <div style={{ fontFamily: "'Alumni Sans', sans-serif", fontSize: 32, fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.02em', lineHeight: 1 }}>
                {activeVideo.name}
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: 'rgba(155,200,169,0.8)', fontWeight: 600, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {activeVideo.location}
              </div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: 'rgba(241,245,249,0.8)', fontStyle: 'italic', lineHeight: 1.6, margin: '12px 0 0' }}>
                {activeVideo.quote}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        div:hover > .video-play-icon {
          opacity: 1 !important;
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .video-card-enter {
          animation: fadeInScale 0.4s ease-out forwards;
        }
        @media (max-width: 640px) {
          .video-card-enter {
            gap: 16px !important;
          }
          .video-player-col {
            margin: 0 auto !important;
          }
          .video-info-col {
            padding-top: 4px !important;
          }
        }
      `}</style>
    </div>
  );
}
