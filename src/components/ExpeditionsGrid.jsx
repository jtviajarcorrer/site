import { useEffect, useRef, useState } from 'react';
import { Calendar, ArrowRight, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { brl, getInstallments, getCashPrice } from '../utils/pricing.js';
import { useT } from '../content/SiteTexts.jsx';
import { imgUrl } from '../utils/img.js';

const MAX_CARDS_PER_ROW = 4;

function ExpeditionCard({ exp, navigate, isMobile = false }) {
  const { t } = useT();
  const isPast = !!exp._past;
  const [expanded, setExpanded] = useState(false);

  const handleCardClick = () => { if (!isPast) setExpanded(!expanded); };
  
  const handleNavigate = (e) => {
    e.stopPropagation();
    navigate(`/${exp.slug}`);
  };

  const cardWidth = isMobile
    ? (expanded ? 'min(268px, calc(100vw - 48px))' : 172)
    : (expanded ? 'min(340px, calc(100vw - 48px))' : 268);
  const cardMinHeight = isMobile ? 192 : 270;
  const imgHeight = isMobile
    ? (expanded ? 120 : 92)
    : (expanded ? 200 : 150);

  return (
    <div
      onClick={handleCardClick}
      aria-disabled={isPast || undefined}
      style={{
        position: 'relative', borderRadius: isMobile ? 14 : 20, overflow: 'hidden', cursor: isPast ? 'default' : 'pointer',
        background: isPast ? 'rgba(255,255,255,0.03)' : 'rgba(18,65,92,0.12)',
        border: isPast ? '1px dashed rgba(241,245,249,0.14)' : '1px solid rgba(155,200,169,0.1)',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex', flexDirection: 'column',
        width: cardWidth,
        minHeight: cardMinHeight,
        height: 'auto',
        ...(isPast ? { filter: 'grayscale(1)', opacity: 0.4, userSelect: 'none' } : {}),
      }}
      onMouseEnter={isPast ? undefined : e => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = '0 24px 60px rgba(0,65,64,0.4), 0 0 0 1px rgba(218,184,63,0.25)';
        e.currentTarget.style.borderColor = 'rgba(218,184,63,0.35)';
      }}
      onMouseLeave={isPast ? undefined : e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'rgba(155,200,169,0.1)';
      }}
    >
      {/* Cover image */}
      <div style={{ position: 'relative', height: imgHeight, overflow: 'hidden', flexShrink: 0, transition: 'height 0.4s ease' }}>
        {exp.cover_image ? (
          <img
            src={imgUrl(exp.cover_image, 640)}
            loading="lazy"
            decoding="async"
            alt={exp.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
            onMouseEnter={e => { if (!isPast) e.target.style.transform = 'scale(1.05)'; }}
            onMouseLeave={e => { if (!isPast) e.target.style.transform = 'scale(1)'; }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #004140 0%, #12415c 60%, #080d18 100%)' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(6,14,24,0.92) 0%, transparent 60%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,65,64,0.1) 0%, transparent 40%)' }} />

        {/* Past expedition badge */}
        {isPast && (
          <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(241,245,249,0.9)', borderRadius: 99, padding: '4px 10px' }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, color: '#06111a', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{t('card_encerrada')}</span>
          </div>
        )}

        {/* Spots urgency */}
        {!isPast && exp.spots_left && exp.spots_left <= 6 && (
          <div style={{ position: 'absolute', bottom: 14, left: 14, background: 'rgba(218,184,63,0.9)', borderRadius: 99, padding: '4px 10px' }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, color: '#06111a' }}>{t('card_ultimas_vagas', { vagas: exp.spots_left })}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: isMobile ? (expanded ? '12px 14px 16px' : '10px 12px 12px') : (expanded ? '20px 22px 30px' : '16px'), display: 'flex', flexDirection: 'column', flexGrow: 1, transition: 'padding 0.4s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 4 }}>
          <h3 style={{ fontFamily: "'Alumni Sans', sans-serif", fontStyle: 'italic', fontSize: isMobile ? (expanded ? 22 : 18) : (expanded ? 28 : 24), fontWeight: 900, letterSpacing: '0.02em', textTransform: 'uppercase', color: '#f1f5f9', margin: isMobile ? '0 0 4px' : '0 0 8px', lineHeight: 1, transition: 'font-size 0.4s ease' }}>
            {exp.name}
          </h3>
          {!isPast && (
            <div style={{ color: 'rgba(155,200,169,0.5)', marginTop: isMobile ? 2 : 4, flexShrink: 0 }}>
              {expanded ? <ChevronUp size={isMobile ? 14 : 16} /> : <ChevronDown size={isMobile ? 14 : 16} />}
            </div>
          )}
        </div>

        {/* Date and Modalities (Distances) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 6 : 8, marginTop: 'auto', marginBottom: expanded ? (isMobile ? 10 : 14) : 0 }}>
          {/* Date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(155,200,169,0.6)', fontFamily: "'Inter', sans-serif", fontSize: isMobile ? 11 : 13 }}>
            <Calendar size={isMobile ? 11 : 13} style={{ flexShrink: 0 }} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {exp.date_label || (() => {
                if (!exp.start_date || !exp.end_date) return '';
                const sd = new Date(exp.start_date + 'T12:00:00Z');
                const ed = new Date(exp.end_date + 'T12:00:00Z');
                const m1 = sd.toLocaleString('pt-BR', { month: 'short', timeZone: 'UTC' }).replace('.', '');
                const m2 = ed.toLocaleString('pt-BR', { month: 'short', timeZone: 'UTC' }).replace('.', '');
                const yr = ed.getUTCFullYear().toString().slice(-2);
                if (sd.getUTCMonth() !== ed.getUTCMonth()) {
                  return `${sd.getUTCDate()}/${m1} a ${ed.getUTCDate()}/${m2} de ${yr}`;
                }
                return `${sd.getUTCDate()} a ${ed.getUTCDate()} de ${m2}./${yr}`;
              })()}
            </span>
          </div>
          
          {/* Modalities */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? 4 : 6 }}>
            {exp.modalities?.map(m => (
              <span key={m} style={{
                fontFamily: "'Inter', sans-serif", fontSize: isMobile ? 9.5 : 11, fontWeight: 700,
                color: '#9bc8a9',
                background: 'rgba(0,65,64,0.35)',
                border: '1px solid rgba(155,200,169,0.25)',
                borderRadius: 99, padding: isMobile ? '2px 7px' : '3px 9px', letterSpacing: '0.05em'
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
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: isMobile ? 12.5 : 13, color: 'rgba(241,245,249,0.55)', lineHeight: 1.55, margin: isMobile ? '6px 0 14px' : '8px 0 20px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {exp.description}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, borderTop: '1px solid rgba(155,200,169,0.1)', paddingTop: isMobile ? 12 : 16, marginTop: 'auto' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  {(() => {
                    const inst = getInstallments(exp);
                    const cash = getCashPrice(exp);
                    const label = { fontFamily: "'Inter', sans-serif", fontSize: isMobile ? 10 : 11, color: 'rgba(155,200,169,0.55)', textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1.3 };
                    const big = { fontFamily: "'Alumni Sans', sans-serif", fontStyle: 'italic', fontSize: isMobile ? 24 : 26, fontWeight: 900, background: 'linear-gradient(135deg,#dab83f,#e8ca6a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.05 };
                    if (!inst && !cash) return <div style={big}>{t('card_sob_consulta')}</div>;
                    return (
                      <>
                        <div style={label}>
                          {inst ? (inst.entry ? t('card_entrada_parcelas', { entrada: brl(inst.entry), parcelas: inst.max }) : t('card_so_parcelas', { parcelas: inst.max })) : t('card_a_vista')}
                        </div>
                        <div style={big}>{inst ? brl(inst.value) : brl(cash)}</div>
                        {inst && cash && (
                          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: isMobile ? 10.5 : 11, color: 'rgba(241,245,249,0.5)', marginTop: 3 }}>
                            {t('card_ou_a_vista', { valor: brl(cash) })}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
                <button
                  onClick={handleNavigate}
                  style={{ flexShrink: 0, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,65,64,0.35)', border: '1px solid rgba(155,200,169,0.28)', borderRadius: 99, padding: isMobile ? '8px 14px' : '8px 16px', color: '#9bc8a9', fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s, border-color 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(218,184,63,0.15)'; e.currentTarget.style.borderColor = 'rgba(218,184,63,0.4)'; e.currentTarget.style.color = '#dab83f'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,65,64,0.35)'; e.currentTarget.style.borderColor = 'rgba(155,200,169,0.28)'; e.currentTarget.style.color = '#9bc8a9'; }}
                >
                  {t('card_ver')} <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// No desktop: agrupa as expedições em linhas de até MAX_CARDS_PER_ROW (4) cards.
// Quando um ano termina com menos de 4 cards na linha (ex.: 2026 com 2 expedições),
// o próximo ano (2027) começa na mesma linha ocupando os espaços restantes até completar 4.
// No mobile (isMobile): mantém 1 linha horizontal deslizável por ano (2026, 2027).
function buildTimelineRows(upcoming, isMobile = false) {
  const rows = [];
  const seenYears = new Set();

  for (const exp of upcoming) {
    const d = new Date(exp.start_date + 'T12:00:00Z');
    const year = String(d.getUTCFullYear());
    const rawMonth = d.toLocaleString('pt-BR', { month: 'long', timeZone: 'UTC' });
    const month = rawMonth.charAt(0).toUpperCase() + rawMonth.slice(1);

    let currentRow = rows[rows.length - 1];
    const lastSeg = currentRow?.segments[currentRow.segments.length - 1];
    const shouldStartNewRow = isMobile
      ? (!currentRow || (lastSeg && lastSeg.year !== year))
      : (!currentRow || currentRow.totalCards >= MAX_CARDS_PER_ROW);

    if (shouldStartNewRow) {
      currentRow = { segments: [], totalCards: 0 };
      rows.push(currentRow);
    }

    let seg = currentRow.segments[currentRow.segments.length - 1];
    if (!seg || seg.year !== year) {
      const showYearHeader = !seenYears.has(year);
      seenYears.add(year);
      seg = { year, showYearHeader, months: [] };
      currentRow.segments.push(seg);
    }

    let monthGroup = seg.months[seg.months.length - 1];
    if (!monthGroup || monthGroup.month !== month) {
      monthGroup = { month, exps: [] };
      seg.months.push(monthGroup);
    }

    monthGroup.exps.push(exp);
    currentRow.totalCards += 1;
  }

  return rows;
}

function TimelineRow({ row, navigate, isMobile = false }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const rowHasAnyYearHeader = row.segments.some(s => s.showYearHeader);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 5);
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener('resize', handleScroll);
    return () => window.removeEventListener('resize', handleScroll);
  }, [row]);

  const scrollStep = isMobile ? 184 : 292;
  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -scrollStep, behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: scrollStep, behavior: 'smooth' });
  };

  const rowGap = isMobile ? 12 : 24;

  return (
    <div className="reveal year-block" style={{ position: 'relative' }}>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="timeline-horizontal-scroll"
        style={{
          display: 'flex',
          gap: rowGap,
          overflowX: 'auto',
          paddingBottom: isMobile ? 8 : 16,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {row.segments.map((seg) => (
          <div
            key={seg.year}
            style={{
              display: 'flex',
              flexDirection: 'column',
              flexShrink: 0,
            }}
          >
            {/* Year Header (ou espaçador equivalente se outro segmento na mesma linha tiver título de ano) */}
            {rowHasAnyYearHeader && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: isMobile ? 42 : 76,
                  marginBottom: isMobile ? 8 : 16,
                  padding: isMobile ? '4px 0' : '12px 0',
                  borderBottom: seg.showYearHeader ? '1px solid rgba(218,184,63,0.12)' : '1px solid transparent',
                }}
              >
                {seg.showYearHeader && (
                  <h3
                    style={{
                      fontFamily: "'Alumni Sans', sans-serif",
                      fontStyle: 'italic',
                      fontSize: isMobile ? 38 : 64,
                      fontWeight: 900,
                      color: '#dab83f',
                      margin: 0,
                      lineHeight: 0.8,
                      letterSpacing: '0.02em',
                    }}
                  >
                    {seg.year}
                  </h3>
                )}
              </div>
            )}

            {/* Months Timeline inside this year segment */}
            <div style={{ position: 'relative' }}>
              {/* Linha pontilhada horizontal cobrindo apenas a largura dos cards deste segmento */}
              <div
                style={{
                  position: 'absolute',
                  top: isMobile ? 9 : 12,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: 'linear-gradient(90deg, rgba(155,200,169,0.3) 50%, transparent 50%)',
                  backgroundSize: '16px 2px',
                }}
              />

              <div style={{ display: 'flex', gap: rowGap }}>
                {seg.months.map(({ month, exps }) => (
                  <div key={`${seg.year}-${month}`} style={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                    {/* Month Node */}
                    <div style={{ position: 'relative', height: isMobile ? 38 : 56 }}>
                      <div
                        style={{
                          position: 'absolute',
                          top: 4,
                          left: 0,
                          width: isMobile ? 12 : 18,
                          height: isMobile ? 12 : 18,
                          borderRadius: '50%',
                          background: '#080d18',
                          border: isMobile ? '3px solid #9bc8a9' : '4px solid #9bc8a9',
                          boxShadow: '0 0 16px rgba(155,200,169,0.5)',
                          zIndex: 2,
                        }}
                      />
                      <h4
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: isMobile ? 14 : 20,
                          fontWeight: 500,
                          color: '#f1f5f9',
                          margin: isMobile ? '20px 0 0 0' : '36px 0 0 0',
                          letterSpacing: '0.05em',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {month}
                      </h4>
                    </div>

                    {/* Cards deste mês */}
                    <div style={{ display: 'flex', gap: rowGap, marginTop: isMobile ? 8 : 16, alignItems: 'flex-start' }}>
                      {exps.map((exp, i) => (
                        <div key={exp.id} className="reveal" style={{ flexShrink: 0, transitionDelay: `${i * 80}ms` }}>
                          <ExpeditionCard exp={exp} navigate={navigate} isMobile={isMobile} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Setas laterais (aparecem em telas menores quando a linha de 4 cards precisa rolar) */}
      {canScrollLeft && (
        <div
          style={{
            position: 'absolute',
            top: rowHasAnyYearHeader ? (isMobile ? 84 : 130) : 40,
            left: isMobile ? -12 : -24,
            bottom: isMobile ? 8 : 16,
            width: isMobile ? 64 : 100,
            background: 'linear-gradient(to left, transparent, rgba(6,14,24,0.95) 80%)',
            pointerEvents: 'none',
            zIndex: 5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            paddingLeft: isMobile ? 8 : 16,
          }}
        >
          <button
            className="pulse-arrow-left"
            onClick={scrollLeft}
            aria-label="Rolar para a esquerda"
            style={{
              pointerEvents: 'auto',
              border: '2px solid #f3dc7a',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: isMobile ? 36 : 44,
              height: isMobile ? 36 : 44,
              borderRadius: '50%',
              background: '#dab83f',
              color: '#06111a',
              boxShadow: '0 4px 16px rgba(218,184,63,0.55)',
            }}
          >
            <ArrowLeft size={isMobile ? 18 : 20} strokeWidth={2.5} />
          </button>
        </div>
      )}

      {canScrollRight && (
        <div
          style={{
            position: 'absolute',
            top: rowHasAnyYearHeader ? (isMobile ? 84 : 130) : 40,
            right: 0,
            bottom: isMobile ? 8 : 16,
            width: isMobile ? 64 : 100,
            background: 'linear-gradient(to right, transparent, rgba(6,14,24,0.95) 80%)',
            pointerEvents: 'none',
            zIndex: 5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: isMobile ? 4 : 8,
          }}
        >
          <button
            className="pulse-arrow"
            onClick={scrollRight}
            aria-label="Rolar para a direita"
            style={{
              pointerEvents: 'auto',
              border: '2px solid #f3dc7a',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: isMobile ? 36 : 44,
              height: isMobile ? 36 : 44,
              borderRadius: '50%',
              background: '#dab83f',
              color: '#06111a',
              boxShadow: '0 4px 16px rgba(218,184,63,0.55)',
            }}
          >
            <ArrowRight size={isMobile ? 18 : 20} strokeWidth={2.5} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function ExpeditionsGrid({ expeditions, loading, navigate }) {
  const { t, rich } = useT();
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Re-observa os .reveal quando os dados chegam (a timeline monta depois do carregamento)
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); observer.unobserve(e.target); } }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal:not(.revealed)').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [loading, expeditions, isMobile]);

  // Regra de exibição: somente expedições com "Destaque no Site" (highlight).
  // - Futuras/em andamento: cards normais.
  // - Já encerradas: apenas as 3 mais recentes, em modo "fantasma" (_past).
  const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
  const endOf = e => e.end_date || e.start_date || '';
  const featured = (expeditions || []).filter(e => e.highlight && e.start_date);

  const futureOnes = featured.filter(e => endOf(e) >= todayStr);
  const lastPast = featured
    .filter(e => endOf(e) < todayStr)
    .sort((a, b) => endOf(b).localeCompare(endOf(a)))
    .slice(0, 3)
    .map(e => ({ ...e, _past: true }));

  const upcoming = [...lastPast, ...futureOnes]
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

  const timelineRows = buildTimelineRows(upcoming, isMobile);

  return (
    <section id="expedicoes" data-analytics-section="expedicoes" style={{ padding: isMobile ? '40px 20px' : '64px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <div className="reveal expedition-header" style={{ display: 'flex', alignItems: 'center', gap: 32, marginBottom: isMobile ? 20 : 32 }}>
        <div>

          <h2 className="section-title" style={{ margin: 0 }}>
            {rich('expedicoes_titulo', ['#dab83f'])}
          </h2>
        </div>
        <div className="header-divider" style={{ width: 1, height: 80, background: 'rgba(241,245,249,0.2)' }} />
        <p style={{ fontFamily: "'Alumni Sans', sans-serif", fontStyle: 'italic', fontSize: isMobile ? 20 : 24, fontWeight: 400, color: 'rgba(241,245,249,0.75)', maxWidth: 420, margin: 0, lineHeight: 1.2, letterSpacing: '0.05em' }}>
          {t('expedicoes_subtitulo')}
        </p>
      </div>

      {loading ? (
        <div aria-busy="true" aria-label="Carregando expedições" style={{ display: 'flex', gap: isMobile ? 12 : 24, overflow: 'hidden' }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="jt-skeleton" style={{
              flexShrink: 0, width: isMobile ? 172 : 268, height: isMobile ? 192 : 270, borderRadius: isMobile ? 14 : 20,
              background: 'rgba(18,65,92,0.12)', border: '1px solid rgba(155,200,169,0.1)',
              animationDelay: `${i * 150}ms`,
            }} />
          ))}
        </div>
      ) : upcoming.length === 0 ? (
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: 'rgba(241,245,249,0.5)', margin: 0 }}>
          {t('expedicoes_vazio')}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 20 : 36 }}>
          {timelineRows.map((row, idx) => (
            <TimelineRow key={idx} row={row} navigate={navigate} isMobile={isMobile} />
          ))}
        </div>
      )}

      <style>{`
        /* Loading skeleton (shown only inside this section) */
        @keyframes jtSkeleton {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.7; }
        }
        .jt-skeleton { animation: jtSkeleton 1.4s ease-in-out infinite; }

        /* Hide native scrollbar */
        .timeline-horizontal-scroll::-webkit-scrollbar {
          display: none;
        }
        
        /* Pulse Animation for Right Arrow */
        @keyframes pulseRight {
          0% { transform: translateX(0); opacity: 0.9; }
          50% { transform: translateX(5px); opacity: 1; }
          100% { transform: translateX(0); opacity: 0.9; }
        }
        .pulse-arrow {
          animation: pulseRight 2s infinite ease-in-out;
        }

        /* Pulse Animation for Left Arrow */
        @keyframes pulseLeft {
          0% { transform: translateX(0); opacity: 0.9; }
          50% { transform: translateX(-5px); opacity: 1; }
          100% { transform: translateX(0); opacity: 0.9; }
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
