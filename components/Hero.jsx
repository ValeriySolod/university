export default function Hero() {
  return (
    <section className="hero" aria-labelledby="page-title">
      <div>
        <p className="eyebrow">Тренуйся у власному темпі</p>
        <h1 id="page-title">Математика стає простішою з кожною відповіддю.</h1>
        <p className="hero-copy">
          Обери правильний варіант, отримай коротке пояснення та дізнайся свій результат.
        </p>
      </div>
      <div className="hero-orbit" aria-hidden="true">
        <span>π</span>
        <span>×</span>
        <span>√</span>
      </div>
    </section>
  );
}
