import { useEffect, useRef } from 'react';

// Resolución interna de la NES; el CSS lo escala con píxeles nítidos.
const W = 256;
const H = 240;
const FPS = 30;

// Estática de televisor: ruido en escala de grises + una banda clara que sube y baja.
export default function StaticCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const image = ctx.createImageData(W, H);
    const pixels = new Uint32Array(image.data.buffer);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let raf = 0;
    let last = 0;
    let band = 0;

    const frame = () => {
      band = (band + 2) % (H + 80);
      for (let y = 0; y < H; y++) {
        const d = y - (band - 40);
        const lift = d > 0 && d < 40 ? Math.sin((d / 40) * Math.PI) * 60 : 0;
        const rowShade = (Math.random() - 0.5) * 24; // ruido por línea horizontal
        const row = y * W;
        for (let x = 0; x < W; x++) {
          let v = Math.random() * 215 + 20 + lift + rowShade;
          v = v < 0 ? 0 : v > 255 ? 255 : v | 0;
          pixels[row + x] = 0xff000000 | (v << 16) | (v << 8) | v; // gris: sin problema de endianness
        }
      }
      ctx.putImageData(image, 0, 0);
    };

    const loop = (t) => {
      raf = requestAnimationFrame(loop);
      if (t - last < 1000 / FPS) return;
      last = t;
      frame();
    };

    frame();
    if (!reduceMotion) raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={canvasRef} className="static-canvas" width={W} height={H} aria-hidden="true" />;
}
