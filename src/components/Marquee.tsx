const STACK_A = [
  'React', 'TypeScript', 'Laravel', 'Node.js', 'Supabase', 'Tailwind CSS', 'Vite', 'PostgreSQL', 'Bootstrap',
];
const STACK_B = [
  'PHP', 'JavaScript', 'REST API', 'Git & GitHub', 'MySQL', 'Figma', 'Golang', 'CodeIgniter', 'C++', 'C', 'Python',
];

function Row({ items, className }: { items: string[]; className: string }) {
  const doubled = [...items, ...items];
  return (
    <div className={`marquee-row ${className}`}>
      {doubled.map((label, i) => (
        <span className="marquee-item" key={i}>
          {label} <span className="marquee-dot" />
        </span>
      ))}
    </div>
  );
}

export default function Marquee() {
  return (
    <section className="marquee-section" aria-label="Tech stack">
      <div className="marquee-strip">
        <Row items={STACK_A} className="marquee-row--a" />
      </div>
      <div className="marquee-strip marquee-strip--b">
        <Row items={STACK_B} className="marquee-row--b" />
      </div>
    </section>
  );
}
