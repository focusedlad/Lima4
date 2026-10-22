import React from 'react';

export const FluidLiquidBackground: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 select-none overflow-hidden opacity-30 dark:opacity-10"
      style={{
        backgroundImage: 'radial-gradient(#d4d4d8 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    />
  );
};
