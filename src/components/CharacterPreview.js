import React, { useEffect, useRef } from 'react';
import { renderCharacter } from '../lib/renderer';

function CharacterPreview({ psdData, character }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    console.log('CharacterPreview useEffect triggered', { psdData, character });
    if (psdData && canvasRef.current) {
      console.log('Calling renderCharacter');
      renderCharacter(canvasRef.current, psdData, character);
    }
  }, [psdData, character]);
  
  return (
    <div style={{ border: '1px solid red', position: 'relative' }}>
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={800} 
        style={{ maxWidth: '100%', border: '1px solid blue' }}
      />
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        color: 'red',
        background: 'white',
        padding: '5px'
      }}>
        Debug Canvas
      </div>
    </div>
  );
}

export default CharacterPreview;
