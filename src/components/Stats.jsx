import { useEffect, useRef, useState } from 'react';
import { STATS } from '../data/expeditions.js';
import { useT } from '../content/SiteTexts.jsx';

function AnimatedNumber({ target, suffix, started }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!started) return;
    const duration = 1800, steps = 60, increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setDisplay(target); clearInterval(timer); }
      else setDisplay(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, target]);
  return <span>{target >= 1000 ? display.toLocaleString('pt-BR') : display}{suffix}</span>;
}

const GOLD_TEXT = { background: 'linear-gradient(135deg,#dab83f,#e8ca6a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' };

// "46K+" -> { value: 46, suffix: 'K+' } ; "1.200+" -> { value: 1200, suffix: '+' }
function parseStat(raw) {
  const m = String(raw).match(/^\s*([\d.,]+)\s*(.*)$/);
  if (!m) return { value: 0, suffix: String(raw) };
  return { value: parseInt(m[1].replace(/[.,]/g, ''), 10) || 0, suffix: m[2] };
}

export default function Stats() {
  const { t, rich } = useT();
  const stats = STATS.map((s, i) => ({
    ...s,
    id: i + 1,
    ...parseStat(t(`estat_${i + 1}_numero`)),
    label: t(`estat_${i + 1}_rotulo`),
  }));
  const [started, setStarted] = useState(false);
  const sectionRef = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} style={{ padding: '90px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 60 }}>

          <h2 className="section-title" style={{ marginBottom: 12 }}>
            {rich('comunidade_titulo', [GOLD_TEXT])}
          </h2>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: 'rgba(155,200,169,0.6)', maxWidth: 420, margin: '0 auto' }}>
            {t('comunidade_subtitulo')}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
          {stats.map((stat, i) => (
            <div key={stat.id} className="reveal" style={{
              transitionDelay: `${i * 100}ms`, textAlign: 'center', padding: '48px 24px',
              background: i % 2 === 0 ? 'rgba(0,65,64,0.2)' : 'rgba(18,65,92,0.2)',
              border: '1px solid rgba(155,200,169,0.08)',
              borderRadius: i === 0 ? '20px 0 0 20px' : i === stats.length - 1 ? '0 20px 20px 0' : 0,
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(218,184,63,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ fontSize: 32, marginBottom: 8 }}>{stat.icon}</div>
              <div style={{ fontFamily: "'Alumni Sans', sans-serif", fontStyle: 'italic', fontSize: 'clamp(44px, 6vw, 64px)', fontWeight: 900, background: 'linear-gradient(135deg,#dab83f,#e8ca6a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>
                <AnimatedNumber target={stat.value} suffix={stat.suffix} started={started} />
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700, color: 'rgba(241,245,249,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
