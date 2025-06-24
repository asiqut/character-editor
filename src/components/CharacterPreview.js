import React, { useEffect, useRef } from 'react';
import { renderCharacter } from '../lib/renderer';

function CharacterPreview({ psdData, character }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (psdData && canvasRef.current) {
      renderCharacter(canvasRef.current, psdData, character);
    }
  }, [psdData, character]);
  
  return (
    <div style={{ width: '315px', height: '315px', border: '1px solid #ddd' }}>
      <canvas 
        ref={canvasRef} 
        width={315}
        height={315}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
    </div>
  );
}

export default CharacterPreview;
