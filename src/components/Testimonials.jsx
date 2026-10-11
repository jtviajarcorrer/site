import { useState } from 'react';
import { TESTIMONIALS } from '../data/expeditions.js';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const prev = () => setActive(a => (a - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const next = () => setActive(a => (a + 1) % TESTIMONIALS.length);

  return (
    <section style={{ padding: '100px 24px', background: '#080d18', borderTop: '1px solid rgba(155,200,169,0.1)', borderBottom: '1px solid rgba(155,200,169,0.1)' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 56 }}>

          <h2 className="section-title" style={{ margin: 0 }}>
            Quem correu,{' '}
            <span style={{ background: 'linear-gradient(135deg,#dab83f,#e8ca6a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>voltou</span>
          </h2>
        </div>

        <div className="reveal jt-glass" style={{ borderRadius: 24, padding: '48px 52px', position: 'relative', textAlign: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(155,200,169,0.1)', boxShadow: '0 16px 40px rgba(0,0,0,0.2)' }}>
          <Quote size={40} style={{ position: 'absolute', top: 28, left: 36, color: 'rgba(218,184,63,0.15)', transform: 'scaleX(-1)' }} />

          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#004140,#12415c)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 0 3px rgba(218,184,63,0.25), 0 0 0 6px rgba(218,184,63,0.08)' }}>
            <span style={{ fontFamily: "'Alumni Sans', sans-serif", fontStyle: 'italic', fontSize: 24, fontWeight: 900, color: '#dab83f' }}>{TESTIMONIALS[active].avatar}</span>
          </div>

          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 18, fontStyle: 'italic', color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, margin: '0 0 28px', maxWidth: 580, marginLeft: 'auto', marginRight: 'auto' }}>
            "{TESTIMONIALS[active].text}"
          </p>

          <div>
            <div style={{ fontFamily: "'Alumni Sans', sans-serif", fontStyle: 'italic', fontSize: 20, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ffffff' }}>
              {TESTIMONIALS[active].name}
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: 'rgba(155,200,169,0.6)', marginTop: 4 }}>
              {TESTIMONIALS[active].city} · {TESTIMONIALS[active].expedition}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginTop: 32 }}>
          <button onClick={prev} className="jt-btn-ghost" style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, color: '#ffffff' }}>
            <ChevronLeft size={18} />
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setActive(i)}
                style={{ width: i === active ? 24 : 8, height: 8, borderRadius: 99, background: i === active ? '#dab83f' : 'rgba(155,200,169,0.2)', border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }}
              />
            ))}
          </div>
          <button onClick={next} className="jt-btn-ghost" style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, color: '#ffffff' }}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
