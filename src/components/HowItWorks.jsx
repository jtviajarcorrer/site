import { Search, ClipboardList, Plane, Medal } from 'lucide-react';

const STEPS = [
  { icon: Search,        step: '01', title: 'Escolha seu Destino',    desc: 'Navegue pelas expedições e encontre o destino que te desafia. Cada viagem une a emoção da corrida com experiências culturais únicas.', color: '#dab83f' },
  { icon: ClipboardList, step: '02', title: 'Inscreva-se',            desc: 'Preencha o formulário de interesse. Nossa equipe entra em contato para confirmar sua vaga, tirar dúvidas e te preparar para a aventura.', color: '#9bc8a9' },
  { icon: Plane,         step: '03', title: 'Embarque Tranquilo',     desc: 'A JT cuida de tudo — voos, hotéis, inscrição na prova e guia especializado. Você só precisa trazer a energia e os tênis de corrida.', color: '#9bc8a9' },
  { icon: Medal,         step: '04', title: 'Cruze a Linha de Chegada', desc: 'Viva a experiência de cruzar o finish line em um destino incrível, ao lado de uma galera que vai se tornar família para sempre.', color: '#dab83f' },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" style={{ padding: '100px 24px', background: 'rgba(0,65,64,0.07)', borderTop: '1px solid rgba(155,200,169,0.07)', borderBottom: '1px solid rgba(155,200,169,0.07)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 70 }}>

          <h2 className="section-title" style={{ marginBottom: 14 }}>
            Sua jornada em{' '}
            <span style={{ background: 'linear-gradient(135deg,#dab83f,#e8ca6a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>4 passos</span>
          </h2>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 17, color: 'rgba(155,200,169,0.6)', maxWidth: 440, margin: '0 auto' }}>
            Do sonho à linha de chegada — a JT transforma cada detalhe em uma expedição perfeita.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.step} className="reveal" style={{ transitionDelay: `${i * 100}ms` }}>
                <div
                  style={{ background: 'rgba(18,65,92,0.15)', border: '1px solid rgba(155,200,169,0.1)', borderRadius: 20, padding: '32px 28px', height: '100%', transition: 'border-color 0.3s, background 0.3s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,65,64,0.25)'; e.currentTarget.style.borderColor = `${step.color}44`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(18,65,92,0.15)'; e.currentTarget.style.borderColor = 'rgba(155,200,169,0.1)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: `${step.color}18`, border: `1px solid ${step.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={24} color={step.color} />
                    </div>
                    <span style={{ fontFamily: "'Alumni Sans', sans-serif", fontStyle: 'italic', fontSize: 54, fontWeight: 900, color: 'rgba(155,200,169,0.07)', lineHeight: 1 }}>
                      {step.step}
                    </span>
                  </div>
                  <h3 style={{ fontFamily: "'Alumni Sans', sans-serif", fontStyle: 'italic', fontSize: 24, fontWeight: 700, textTransform: 'uppercase', color: '#f1f5f9', margin: '0 0 10px' }}>
                    {step.title}
                  </h3>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: 'rgba(155,200,169,0.55)', lineHeight: 1.7, margin: 0 }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
