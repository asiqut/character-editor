import React, { useEffect, useRef } from 'react';
import { renderCharacter } from '../lib/renderer';

function CharacterPreview({ psdData, character }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (psdData && canvasRef.current) {
      console.log('Starting render...');
      try {
        const canvas = canvasRef.current;
        canvas.width = 630;
        canvas.height = 630;
        
        console.log('Canvas before render:', canvas);
        renderCharacter(canvas, psdData, character);
        console.log('Render completed');
      } catch (error) {
        console.error('Render error:', error);
      }
    }
  }, [psdData, character]);

  return (
    <div style={{
      width: '315px',
      height: '315px',
      position: 'relative',
      border: '1px solid #ddd',
      backgroundColor: '#f5f5f5', // Добавим фон для видимости
      overflow: 'hidden'
    }}>
      <canvas 
        ref={canvasRef}
        width={315}
        height={315}
        style={{ display: 'block' }}
      />
      {!psdData && <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }}>Loading model...</div>}
    </div>
  );
}

export default CharacterPreview;
