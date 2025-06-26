// Отвечает за canvas, выводит на него картинку с рендера - показывает изменения в реальном времени
import React, { useEffect, useRef } from 'react';
import { renderCharacter } from '../lib/renderer';

function CharacterPreview({ psdData, character }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (psdData && canvasRef.current) {
      console.log('Eyes data:', psdData.eyes);
      renderCharacter(canvasRef.current, psdData, character);
    }
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
