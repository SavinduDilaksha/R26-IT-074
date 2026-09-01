export default function BubblesBg() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 overflow-hidden pointer-events-none z-0 tech-grid-bg"
    >
      {/* Ambient glows */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 700px 350px at 50% 0%, rgba(14,165,233,0.15) 0%, transparent 70%), radial-gradient(ellipse 500px 250px at 80% 60%, rgba(20,184,166,0.1) 0%, transparent 70%), radial-gradient(ellipse 450px 250px at 15% 80%, rgba(168,85,247,0.08) 0%, transparent 70%)',
        }}
      />
      {/* Subtle tech lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
    </div>
  );
}
