import React, { useEffect, useState } from 'react';

export const FluidLiquidBackground: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.3 });

  useEffect(() => {
    let ticking = false;
    const handleMouseMove = (e: MouseEvent) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setMousePos({
            x: e.clientX / window.innerWidth,
            y: e.clientY / window.innerHeight,
          });
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const offsetX = (mousePos.x - 0.5) * 35;
  const offsetY = (mousePos.y - 0.5) * 35;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none opacity-70 dark:opacity-40 transition-opacity duration-700"
    >
      {/* Liquid Blob 1: Warm Amber / Butter Yellow */}
      <div
        className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full blur-[80px] bg-gradient-to-tr from-amber-200/50 via-yellow-300/40 to-orange-200/30 animate-liquid-1 will-change-transform"
        style={{
          transform: `translate(${offsetX * 0.8}px, ${offsetY * 0.8}px)`,
          transition: 'transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      />

      {/* Liquid Blob 2: Lavender / Purple Soft Fluid */}
      <div
        className="absolute top-1/4 -right-28 w-[480px] h-[480px] rounded-full blur-[90px] bg-gradient-to-bl from-indigo-200/45 via-purple-300/35 to-pink-200/30 animate-liquid-2 will-change-transform"
        style={{
          transform: `translate(${-offsetX * 1.1}px, ${-offsetY * 1.1}px)`,
          transition: 'transform 1.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      />

      {/* Liquid Blob 3: Mint / Sky Water Drop */}
      <div
        className="absolute top-2/3 left-1/5 w-[440px] h-[440px] rounded-full blur-[85px] bg-gradient-to-r from-emerald-150/40 via-teal-200/35 to-sky-250/30 animate-liquid-1 will-change-transform"
        style={{
          transform: `translate(${offsetX * 0.9}px, ${-offsetY * 0.9}px)`,
          transition: 'transform 1.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      />

      {/* Liquid Blob 4: Soft Coral / Rose Drop near bottom */}
      <div
        className="absolute -bottom-32 right-1/4 w-[500px] h-[500px] rounded-full blur-[95px] bg-gradient-to-t from-rose-200/40 via-pink-300/30 to-amber-100/30 animate-liquid-2 will-change-transform"
        style={{
          transform: `translate(${-offsetX * 0.7}px, ${offsetY * 0.7}px)`,
          transition: 'transform 1.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      />

      {/* Floating Micro Liquid Droplets */}
      <div className="absolute top-[18%] left-[12%] w-16 h-16 rounded-full bg-amber-200/40 blur-xl animate-clay-orb" />
      <div className="absolute top-[45%] right-[18%] w-20 h-20 rounded-full bg-sky-200/40 blur-xl animate-clay-orb delay-700" />
      <div className="absolute top-[75%] left-[30%] w-24 h-24 rounded-full bg-pink-200/35 blur-xl animate-clay-orb delay-1000" />
    </div>
  );
};
