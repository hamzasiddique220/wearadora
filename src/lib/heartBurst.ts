export function heartBurst(x: number, y: number) {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y}px;
    pointer-events: none;
    z-index: 10002;
  `;

  const count = 10;
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
    const distance = 40 + Math.random() * 30;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance - 10;
    const size = 8 + Math.random() * 6;
    const isHeart = i % 2 === 0;

    particle.textContent = isHeart ? '♥' : '✦';
    particle.style.cssText = `
      position: absolute;
      left: 0;
      top: 0;
      transform: translate(-50%, -50%) scale(0);
      color: ${isHeart ? '#c94b6b' : '#8b6f47'};
      font-size: ${size}px;
      font-weight: 700;
      line-height: 1;
      opacity: 1;
      will-change: transform, opacity;
      --dx: ${dx}px;
      --dy: ${dy}px;
      animation: heart-burst-out 0.85s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    `;
    container.appendChild(particle);
  }

  document.body.appendChild(container);
  setTimeout(() => container.remove(), 900);
}
