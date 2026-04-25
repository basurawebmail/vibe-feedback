'use client';

import { useEffect, useRef } from 'react';

interface Layer {
  color: string;
  speed: number;
  phase: number;
  width: number;
  angle: number;
  blur: number;
  amplitude: number;
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isMobile = () => window.innerWidth < 768;

    const allLayers: Layer[] = [
      { color: 'rgba(79, 70, 229, 0.10)',  speed: 14000, phase: 0,           width: 0.32, angle: 18, blur: 90,  amplitude: 0.18 },
      { color: 'rgba(20, 184, 166, 0.08)', speed: 17000, phase: Math.PI / 2, width: 0.24, angle: 22, blur: 110, amplitude: 0.22 },
      { color: 'rgba(99, 90, 255, 0.07)',  speed: 12000, phase: Math.PI,     width: 0.38, angle: 15, blur: 70,  amplitude: 0.15 },
      { color: 'rgba(0, 210, 190, 0.06)',  speed: 16000, phase: Math.PI * 1.5, width: 0.20, angle: 25, blur: 120, amplitude: 0.25 },
    ];

    let animationId: number;
    let startTime = performance.now();

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    };

    const drawLayer = (layer: Layer, elapsed: number) => {
      const w = canvas.width;
      const h = canvas.height;
      const t = (elapsed % layer.speed) / layer.speed;
      const progress = t * Math.PI * 2 + layer.phase;

      // Offset sinusoidal a lo largo del eje perpendicular al ángulo
      const rad = (layer.angle * Math.PI) / 180;
      const centerX = w * 0.5 + Math.sin(progress) * w * layer.amplitude;
      const centerY = h * 0.5 + Math.cos(progress * 0.7) * h * layer.amplitude * 0.6;

      const halfW = w * layer.width;
      // Longitud del path a lo largo del eje del ángulo
      const len = Math.sqrt(w * w + h * h);

      const dx = Math.cos(rad) * len;
      const dy = Math.sin(rad) * len;
      const nx = -Math.sin(rad) * halfW;
      const ny = Math.cos(rad) * halfW;

      // Cuatro puntos del path Bezier curvado
      const p0x = centerX - dx - nx * 0.3;
      const p0y = centerY - dy - ny * 0.3;
      const p3x = centerX + dx + nx * 0.3;
      const p3y = centerY + dy + ny * 0.3;

      // Puntos de control con desplazamiento perpendicular para la curvatura
      const bend = Math.sin(progress * 0.5) * halfW * 0.5;
      const cp1x = centerX - dx * 0.3 + nx + bend * Math.sin(rad);
      const cp1y = centerY - dy * 0.3 + ny + bend * Math.cos(rad);
      const cp2x = centerX + dx * 0.3 - nx - bend * Math.sin(rad);
      const cp2y = centerY + dy * 0.3 - ny - bend * Math.cos(rad);

      const grad = ctx.createLinearGradient(p0x, p0y, p3x, p3y);
      grad.addColorStop(0,   'transparent');
      grad.addColorStop(0.2, layer.color);
      grad.addColorStop(0.5, layer.color);
      grad.addColorStop(0.8, layer.color);
      grad.addColorStop(1,   'transparent');

      ctx.save();
      ctx.filter = `blur(${layer.blur}px)`;

      // Path de ola: dos Bezier que forman la franja
      ctx.beginPath();
      ctx.moveTo(p0x, p0y);
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p3x, p3y);
      ctx.bezierCurveTo(cp2x + nx * 2, cp2y + ny * 2, cp1x + nx * 2, cp1y + ny * 2, p0x, p0y);
      ctx.closePath();

      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    };

    const draw = (timestamp: number) => {
      const elapsed = timestamp - startTime;

      ctx.fillStyle = '#fafaf9';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const layers = isMobile() ? allLayers.slice(0, 3) : allLayers;
      layers.forEach(layer => drawLayer(layer, elapsed));

      animationId = requestAnimationFrame(draw);
    };

    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationId);
      } else {
        startTime = performance.now() - (performance.now() % 20000);
        animationId = requestAnimationFrame(draw);
      }
    };

    resize();
    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibility);
    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  );
}
