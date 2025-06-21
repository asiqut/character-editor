import React, { useEffect, useRef } from 'react';
import { renderCharacter } from '../lib/renderer';

function CharacterPreview({ psdData, character }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!psdData || !canvasRef.current) return;
    
    console.log('Rendering character:', { psdData, character });
    
    try {
      const canvas = canvasRef.current;
      canvas.width = 630;
      canvas.height = 630;
      
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      renderCharacter(canvas, psdData, character);
    } catch (error) {
      console.error('Rendering error:', error);
    }
  }, [psdData, character]);

  return (
    <div style={{
      width: '315px',
      height: '315px',
      position: 'relative',
      border: '1px solid #ddd',
      overflow: 'hidden'
    }}>
      <canvas 
        ref={canvasRef}
        width={315}
        height={315}
        style={{ display: 'block' }}
      />
      {!psdData && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#999'
        }}>
          Загрузка персонажа...
        </div>
      )}
    </div>
  );
}

export default CharacterPreview;
