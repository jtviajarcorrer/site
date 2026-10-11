import { useEffect, useRef, useState } from 'react';
import { MapPin, Calendar, ArrowRight, ArrowLeft, Zap, ChevronDown, ChevronUp } from 'lucide-react';

function ExpeditionCard({ exp, navigate }) {
  const [expanded, setExpanded] = useState(false);

  const handleCardClick = () => setExpanded(!expanded);
  
  const handleNavigate = (e) => {
    e.stopPropagation();
    navigate(`/${exp.slug}`);
  };

  return (
    <div
      onClick={handleCardClick}
      style={{
        position: 'relative', borderRadius: 20, overflow: 'hidden', cursor: 'pointer',
        background: 'rgba(18,65,92,0.12)',
        border: '1px solid rgba(155,200,169,0.1)',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex', flexDirection: 'column',
        width: expanded ? 340 : 260,
        height: expanded ? 480 : 270,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = '0 24px 60px rgba(0,65,64,0.4), 0 0 0 1px rgba(218,184,63,0.25)';
        e.currentTarget.style.borderColor = 'rgba(218,184,63,0.35)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'rgba(155,200,169,0.1)';
      }}
    >
      {/* Cover image */}
      <div style={{ position: 'relative', height: expanded ? 200 : 150, overflow: 'hidden', flexShrink: 0, transition: 'height 0.4s ease' }}>
        <img
          src={exp.cover_image}
          alt={exp.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
          onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(6,14,24,0.92) 0%, transparent 60%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,65,64,0.1) 0%, transparent 40%)' }} />

        {/* No flag/country block as requested */}

        {/* Highlight badge */}
        {exp.highlight && expanded && (
          <div style={{ position: 'absolute', top: 12, right: 12, background: 'linear-gradient(135deg, #dab83f, #e8ca6a)', borderRadius: 99, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Zap size={10} fill="#06111a" color="#06111a" />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, fontWeight: 700, color: '#06111a', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Destaque</span>
          </div>
        )}

        {/* Spots urgency */}
        {exp.spots_left && exp.spots_left <= 6 && (
          <div style={{ position: 'absolute', bottom: 14, left: 14, background: 'rgba(218,184,63,0.9)', borderRadius: 99, padding: '4px 10px' }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, color: '#06111a' }}>🔥 Últimas {exp.spots_left} vagas!</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: expanded ? '20px 22px 22px' : '16px', display: 'flex', flexDirection: 'column', flexGrow: 1, transition: 'padding 0.4s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h3 style={{ fontFamily: "'Alumni Sans', sans-serif", fontStyle: 'italic', fontSize: expanded ? 28 : 24, fontWeight: 900, letterSpacing: '0.02em', textTransform: 'uppercase', color: '#f1f5f9', margin: '0 0 8px', lineHeight: 1, transition: 'font-size 0.4s ease' }}>
            {exp.name}
          </h3>
          <div style={{ color: 'rgba(155,200,169,0.5)', marginTop: 4 }}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>

        {/* Date and Modalities (Distances) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto', marginBottom: expanded ? 14 : 0 }}>
          {/* Date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(155,200,169,0.6)', fontFamily: "'Inter', sans-serif", fontSize: 13 }}>
            <Calendar size={13} />
            <span>
              {exp.date_label || (exp.start_date && exp.end_date ? `${new Date(exp.start_date + 'T12:00:00Z').getDate()} a ${new Date(exp.end_date + 'T12:00:00Z').getDate()} de ${new Date(exp.end_date + 'T12:00:00Z').toLocaleString('pt-BR', { month: 'short', timeZone: 'UTC' })}/${new Date(exp.end_date + 'T12:00:00Z').getFullYear().toString().slice(-2)}` : '')}
            </span>
          </div>
          
          {/* Modalities */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {exp.modalities?.map(m => (
              <span key={m} style={{
                fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700,
                color: '#9bc8a9',
                background: 'rgba(0,65,64,0.35)',
                border: '1px solid rgba(155,200,169,0.25)',
                borderRadius: 99, padding: '3px 9px', letterSpacing: '0.05em'
              }}>
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Description & Footer (Only when expanded) */}
        <div style={{ 
          display: 'flex', flexDirection: 'column', flexGrow: 1,
          opacity: expanded ? 1 : 0,
          pointerEvents: expanded ? 'auto' : 'none',
          transition: 'opacity 0.4s ease'
        }}>
          {expanded && (
            <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: 'rgba(241,245,249,0.48)', lineHeight: 1.6, margin: '8px 0 20px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {exp.description}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(155,200,169,0.1)', paddingTop: 16, marginTop: 'auto' }}>
                <div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: 'rgba(155,200,169,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>a partir de</div>
                  <div style={{ fontFamily: "'Alumni Sans', sans-serif", fontStyle: 'italic', fontSize: 26, fontWeight: 900, background: 'linear-gradient(135deg,#dab83f,#e8ca6a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>
                    {exp.price ? `R$ ${Number(exp.price).toLocaleString('pt-BR')}` : 'Sob Consulta'}
                  </div>
                </div>
                <button
                  onClick={handleNavigate}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,65,64,0.3)', border: '1px solid rgba(155,200,169,0.2)', borderRadius: 99, padding: '8px 16px', color: '#9bc8a9', fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s, border-color 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(218,184,63,0.15)'; e.currentTarget.style.borderColor = 'rgba(218,184,63,0.4)'; e.currentTarget.style.color = '#dab83f'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,65,64,0.3)'; e.currentTarget.style.borderColor = 'rgba(155,200,169,0.2)'; e.currentTarget.style.color = '#9bc8a9'; }}
                >
                  Ver <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function YearTimeline({ year, monthsData, navigate }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    // Use a small buffer to account for rounding errors
    setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 5);
  };

  // Check scroll state on mount and resize
  useEffect(() => {
    handleScroll();
    window.addEventListener('resize', handleScroll);
    return () => window.removeEventListener('resize', handleScroll);
  }, [monthsData]);

  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -388, behavior: 'smooth' });
  };
  
  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 388, behavior: 'smooth' });
  };

  return (
    <div className="reveal year-block">
      {/* Year Header */}
      <div style={{ 
        display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24,
        position: 'sticky', top: 72, zIndex: 10, background: 'rgba(8,13,24,0.95)', 
        padding: '16px 0', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(218,184,63,0.1)'
      }}>
        <h3 style={{ fontFamily: "'Alumni Sans', sans-serif", fontStyle: 'italic', fontSize: 64, fontWeight: 900, color: '#dab83f', margin: 0, lineHeight: 0.8, letterSpacing: '0.02em' }}>
          {year}
        </h3>
      </div>

      {/* Months Timeline (Horizontal) */}
      <div style={{ position: 'relative', marginTop: 16 }}>
        {/* Horizontal line for the entire year */}
        <div style={{ position: 'absolute', top: 12, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, rgba(155,200,169,0.3) 50%, transparent 50%)', backgroundSize: '16px 2px' }} />

        {/* Scrollable Container */}
        <div ref={scrollRef} onScroll={handleScroll} className="timeline-horizontal-scroll" style={{ 
          display: 'flex', gap: 24, overflowX: 'auto', paddingBottom: 24, paddingRight: 80,
          scrollbarWidth: 'none', msOverflowStyle: 'none'
        }}>
          {Object.entries(monthsData).map(([month, exps], index) => (
            <div key={month} style={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
              
              {/* Month Node */}
              <div style={{ position: 'relative', height: 56 }}>
                {/* Timeline Dot */}
                <div style={{ 
                  position: 'absolute', top: 4, left: 0, width: 18, height: 18, 
                  borderRadius: '50%', background: '#080d18', border: '4px solid #9bc8a9',
                  boxShadow: '0 0 16px rgba(155,200,169,0.5)', zIndex: 2
                }} />
                
                {/* Month Label */}
                <h4 style={{ 
                  fontFamily: "'Inter', sans-serif", fontSize: 20, fontWeight: 500, 
                  color: '#f1f5f9', margin: '36px 0 0 0', letterSpacing: '0.05em', whiteSpace: 'nowrap'
                }}>
                  {month}
                </h4>
              </div>

              {/* Cards for this month horizontally */}
              <div style={{ display: 'flex', gap: 16, marginTop: 16, alignItems: 'flex-start' }}>
                {exps.map((exp, i) => (
                  <div key={exp.id} className="reveal" style={{ flexShrink: 0, transitionDelay: `${i * 80}ms` }}>
                    <ExpeditionCard exp={exp} navigate={navigate} />
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>
        
        {/* Left Arrow Overlay */}
        {canScrollLeft && (
          <div style={{ 
            position: 'absolute', top: 50, left: -24, bottom: 24, width: 120, 
            background: 'linear-gradient(to left, transparent, rgba(6,14,24,1) 80%)', 
            pointerEvents: 'none', zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: 24 
          }}>
            <button 
              className="pulse-arrow-left" 
              onClick={scrollLeft}
              aria-label="Rolar para a esquerda"
              style={{ 
                pointerEvents: 'auto', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                width: 44, height: 44, borderRadius: '50%', 
                background: 'rgba(218,184,63,0.1)', color: '#dab83f', backdropFilter: 'blur(4px)' 
              }}
            >
              <ArrowLeft size={20} />
            </button>
          </div>
        )}

        {/* Right Arrow Overlay */}
        {canScrollRight && (
          <div style={{ 
            position: 'absolute', top: 50, right: 0, bottom: 24, width: 160, 
            background: 'linear-gradient(to right, transparent, rgba(6,14,24,0.95))', 
            pointerEvents: 'none', zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 16 
          }}>
            <button 
              className="pulse-arrow" 
              onClick={scrollRight}
              aria-label="Rolar para a direita"
              style={{ 
                pointerEvents: 'auto', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                width: 44, height: 44, borderRadius: '50%', 
                background: 'rgba(218,184,63,0.1)', color: '#dab83f', backdropFilter: 'blur(4px)' 
              }}
            >
              <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

export default function ExpeditionsGrid({ expeditions, navigate }) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); observer.unobserve(e.target); } }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const upcoming = expeditions
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

  // Group by year and month
  const grouped = upcoming.reduce((acc, exp) => {
    // Note: We create the date based on UTC to avoid timezone shifts affecting the month
    const d = new Date(exp.start_date + 'T12:00:00Z');
    const year = d.getUTCFullYear();
    const month = d.toLocaleString('pt-BR', { month: 'long', timeZone: 'UTC' });
    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
    
    if (!acc[year]) acc[year] = {};
    if (!acc[year][capitalizedMonth]) acc[year][capitalizedMonth] = [];
    acc[year][capitalizedMonth].push(exp);
    return acc;
  }, {});

  return (
    <section id="expedicoes" style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <div className="reveal expedition-header" style={{ display: 'flex', alignItems: 'center', gap: 32, marginBottom: 32 }}>
        <div>

          <h2 className="section-title" style={{ margin: 0 }}>
            Próximas{' '}
            <span style={{ color: '#dab83f' }}>Expedições</span>
          </h2>
        </div>
        <div className="header-divider" style={{ width: 1, height: 80, background: 'rgba(241,245,249,0.2)' }} />
        <p style={{ fontFamily: "'Alumni Sans', sans-serif", fontStyle: 'italic', fontSize: 24, fontWeight: 400, color: 'rgba(241,245,249,0.75)', maxWidth: 420, margin: 0, lineHeight: 1.2, letterSpacing: '0.05em' }}>
          Explore nossos destinos incríveis programados e reserve sua próxima experiência com a JT.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        {Object.keys(grouped).sort().map(year => (
          <YearTimeline key={year} year={year} monthsData={grouped[year]} navigate={navigate} />
        ))}
      </div>

      <style>{`
        /* Hide native scrollbar */
        .timeline-horizontal-scroll::-webkit-scrollbar {
          display: none;
        }
        
        /* Pulse Animation for Right Arrow */
        @keyframes pulseRight {
          0% { transform: translateX(0); opacity: 0.4; }
          50% { transform: translateX(6px); opacity: 1; }
          100% { transform: translateX(0); opacity: 0.4; }
        }
        .pulse-arrow {
          animation: pulseRight 2s infinite ease-in-out;
        }

        /* Pulse Animation for Left Arrow */
        @keyframes pulseLeft {
          0% { transform: translateX(0); opacity: 0.4; }
          50% { transform: translateX(-6px); opacity: 1; }
          100% { transform: translateX(0); opacity: 0.4; }
        }
        .pulse-arrow-left {
          animation: pulseLeft 2s infinite ease-in-out;
        }

        /* Responsive Header */
        @media (max-width: 768px) {
          .expedition-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
          .header-divider {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}
