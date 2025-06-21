// src/components/CharacterPreview.js
import React, { useEffect, useRef } from 'react';

function CharacterPreview({ psdData, character }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!psdData || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Временная отрисовка - позже заменим на полноценный рендеринг
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#333';
    ctx.font = '16px Arial';
    ctx.fillText('Preview will be here', 10, 30);
    
  }, [psdData, character]);

  return (
    <div style={{ width: '315px', height: '315px', border: '1px solid #ddd' }}>
      <canvas 
        ref={canvasRef}
        width={315}
        height={315}
      />
    </div>
  );
}

export default CharacterPreview;
