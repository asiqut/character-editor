import React, { useEffect, useRef } from 'react';
import { renderCharacter } from '../lib/renderer';

function CharacterPreview({ psdData, character }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    console.log('Updating character preview', { psdData, character });
    if (psdData && canvasRef.current) {
      renderCharacter(canvasRef.current, psdData, character);
    }
  }, [psdData, character]);
  
  return (
    <div style={{
      border: '2px solid #ccc',
      borderRadius: '8px',
      overflow: 'hidden',
      width: '800px',
      height: '800px'
    }}>
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={800}
        style={{ display: 'block' }}
      />
    </div>
  );
}

export default CharacterPreview;
