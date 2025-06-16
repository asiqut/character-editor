import React, { useEffect, useRef } from 'react';
import { renderCharacter } from '../lib/renderer';

function CharacterPreview({ psdData, character }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (psdData && canvasRef.current) {
      // Устанавливаем размеры канваса (можно сделать больше для лучшего качества)
      canvasRef.current.width = 630; // 315 * 2
      canvasRef.current.height = 630;
      renderCharacter(canvasRef.current, psdData, character);
    }
  }, [psdData, character]);
  
  return (
    <div style={{
      width: '630px',
      height: '630px',
      position: 'relative',
      border: '1px solid #ddd'
    }}>
      <canvas 
        ref={canvasRef} 
        width={630}
        height={630}
        style={{ display: 'block' }}
      />
    </div>
  );
}

export default CharacterPreview;
