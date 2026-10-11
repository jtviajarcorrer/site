import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Star } from 'lucide-react';

const TESTIMONIAL_VIDEOS = [
  {
    id: 1,
    name: 'Viajante JT',
    location: 'Instagram Reel',
    quote: '"Vamos testar como fica a incorporação direta de um vídeo do Instagram no carrossel."',
    videoUrl: 'https://www.instagram.com/p/DYfJJbDuC_r/', 
  },
  {
    id: 2,
    name: 'Ricardo Moura',
    location: 'Instagram Reel',
    quote: '"Mais um teste de incorporação direta com o player do Instagram."',
    videoUrl: 'https://www.instagram.com/p/DXB_vLmgvi_/',
  },
  {
    id: 3,
    name: 'Camila Torres',
    location: 'Rio de Janeiro, RJ',
    quote: '"A energia do grupo nas maratonas internacionais é algo simplesmente indescritível."',
    videoUrl: 'https://cdn.coverr.co/videos/coverr-running-by-the-beach-at-sunset-9092/1080p.mp4',
  },
  {
    id: 4,
    name: 'Thiago Silva',
    location: 'Curitiba, PR',
    quote: '"Toda a logística foi impecável, me preocupei apenas em correr e aproveitar cada segundo."',
    videoUrl: 'https://cdn.coverr.co/videos/coverr-tying-running-shoes-1111/1080p.mp4',
  }
];

export default function VideoCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  const prev = () => {
    setActiveIndex((current) => (current === 0 ? TESTIMONIAL_VIDEOS.length - 1 : current - 1));
  };
  
  const next = () => {
    setActiveIndex((current) => (current === TESTIMONIAL_VIDEOS.length - 1 ? 0 : current + 1));
  };

  // Video interaction (play/pause on hover or click)
  const handleVideoInteraction = (e) => {
    const video = e.currentTarget;
    if (video.paused) {
      video.play().catch(() => {}); // Catch play errors (e.g. if user hasn't interacted with document)
    } else {
      video.pause();
    }
  };

  const activeVideo = TESTIMONIAL_VIDEOS[activeIndex];

  return (
    <div style={{ position: 'relative', width: '100%', margin: '0' }}>
      <div style={{ position: 'relative' }}>
        <div key={activeVideo.id} className="video-card-enter" style={{ display: 'flex', alignItems: 'center', gap: 24, width: '100%' }}>
          
          {/* Video Container */}
          <div style={{ position: 'relative', flexShrink: 0, width: 220 }}>
            <div style={{ 
              position: 'relative', 
              width: '100%', 
              aspectRatio: '9/16', 
              borderRadius: 16, 
              overflow: 'hidden',
              background: '#0a111a',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
              cursor: 'pointer'
            }}>
              {activeVideo.videoUrl.includes('instagram.com') ? (
                <iframe
                  src={activeVideo.videoUrl.endsWith('/embed') ? activeVideo.videoUrl : `${activeVideo.videoUrl.replace(/\/$/, '')}/embed`}
                  style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}
                  scrolling="no"
                  allowTransparency="true"
                  allow="encrypted-media"
                />
              ) : (
                <video
                  src={activeVideo.videoUrl}
                  muted
                  loop
                  autoPlay
                  playsInline
                  onClick={handleVideoInteraction}
                  onMouseEnter={e => e.currentTarget.play().catch(() => {})}
                  onMouseLeave={e => e.currentTarget.pause()}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,13,24,0.8) 0%, transparent 40%)', pointerEvents: 'none' }} />
              
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', background: 'rgba(218,184,63,0.8)', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.3s', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }} className="video-play-icon">
                <Play fill="#06111a" color="#06111a" size={20} style={{ marginLeft: 2 }} />
              </div>
            </div>

            {/* Left Arrow */}
            <button 
              onClick={prev}
              style={{ 
                position: 'absolute', top: '50%', left: -20, transform: 'translateY(-50%)',
                width: 44, height: 44, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(8,13,24,0.9)', color: '#f1f5f9', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10,
                backdropFilter: 'blur(8px)', boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                transition: 'background 0.2s, color 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#dab83f'; e.currentTarget.style.color = '#06111a'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(8,13,24,0.9)'; e.currentTarget.style.color = '#f1f5f9'; }}
            >
              <ChevronLeft size={24} />
            </button>

            {/* Right Arrow */}
            <button 
              onClick={next}
              style={{ 
                position: 'absolute', top: '50%', right: -20, transform: 'translateY(-50%)',
                width: 44, height: 44, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(8,13,24,0.9)', color: '#f1f5f9', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10,
                backdropFilter: 'blur(8px)', boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                transition: 'background 0.2s, color 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#dab83f'; e.currentTarget.style.color = '#06111a'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(8,13,24,0.9)'; e.currentTarget.style.color = '#f1f5f9'; }}
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Traveler Info */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontFamily: "'Alumni Sans', sans-serif", fontSize: 32, fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.02em', lineHeight: 1 }}>
              {activeVideo.name}
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: 'rgba(155,200,169,0.8)', fontWeight: 600, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {activeVideo.location}
            </div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: 'rgba(241,245,249,0.8)', fontStyle: 'italic', lineHeight: 1.6, margin: '12px 0 0' }}>
              {activeVideo.quote}
            </p>
            <div
              style={{ 
                marginTop: 32, 
                background: 'rgba(18,65,92,0.15)', 
                border: '1px solid rgba(155,200,169,0.1)', 
                borderRadius: 20, 
                padding: '24px', 
                maxWidth: 320,
                transition: 'border-color 0.3s, background 0.3s' 
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,65,64,0.25)'; e.currentTarget.style.borderColor = 'rgba(218,184,63,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(18,65,92,0.15)'; e.currentTarget.style.borderColor = 'rgba(155,200,169,0.1)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(218,184,63,0.08)', border: '1px solid rgba(218,184,63,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Star size={20} color="#dab83f" />
                </div>
                <span style={{ fontFamily: "'Alumni Sans', sans-serif", fontStyle: 'italic', fontSize: 42, fontWeight: 900, color: 'rgba(218,184,63,0.1)', lineHeight: 1 }}>
                  9.8
                </span>
              </div>
              <h3 style={{ fontFamily: "'Alumni Sans', sans-serif", fontStyle: 'italic', fontSize: 24, fontWeight: 700, textTransform: 'uppercase', color: '#f1f5f9', margin: '0 0 8px' }}>
                NPS 9.8 (EXCELENTE)
              </h3>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: 'rgba(155,200,169,0.55)', lineHeight: 1.6, margin: 0 }}>
                Avaliação média dos nossos viajantes sobre a experiência de ponta a ponta com a JT.
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
      `}</style>
    </div>
  );
}
