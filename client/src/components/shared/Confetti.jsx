import { useEffect, useRef } from 'react';

export default function Confetti({ message, onDone }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      w: Math.random() * 10 + 5,
      h: Math.random() * 6 + 3,
      color: ['#2D8B72','#D4674A','#fbbf24','#60a5fa','#a78bfa'][Math.floor(Math.random()*5)],
      rot: Math.random() * 360,
      rotSpeed: Math.random() * 8 - 4,
      fallSpeed: Math.random() * 3 + 2,
      drift: Math.random() * 2 - 1,
    }));

    let frame;
    let done = false;

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        ctx.save();
        ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
        p.y += p.fallSpeed;
        p.x += p.drift;
        p.rot += p.rotSpeed;
      });
      if (!done) frame = requestAnimationFrame(animate);
    }
    animate();

    const timer = setTimeout(() => {
      done = true;
      cancelAnimationFrame(frame);
      onDone();
    }, 2800);

    return () => { clearTimeout(timer); cancelAnimationFrame(frame); };
  }, []);

  return (
    <div style={{ position:'fixed', inset:0, zIndex:100, pointerEvents:'none' }}>
      <canvas ref={canvasRef} style={{ position:'absolute', inset:0 }} />
      <div style={{
        position:'absolute', top:'40%', left:'50%', transform:'translate(-50%,-50%)',
        background:'var(--white)', border:'2px solid var(--teal)', borderRadius:'var(--radius-lg)',
        padding:'20px 32px', textAlign:'center', boxShadow:'0 8px 32px rgba(0,0,0,0.15)',
        pointerEvents:'none'
      }}>
        <div style={{ fontSize:36, marginBottom:8 }}>🎉</div>
        <div style={{ fontFamily:'var(--font-serif)', fontSize:20, color:'var(--teal)' }}>{message}</div>
      </div>
    </div>
  );
}
