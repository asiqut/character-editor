// Отвечает за цветовые пикеры, окно цветовых пикеров, строку HEX кода 
import React, { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';

function ColorPicker({ title, color, onChange }) {
  const [showPicker, setShowPicker] = useState(false);
  const [currentColor, setCurrentColor] = useState(color);
  const pickerRef = useRef(null);

  useEffect(() => setCurrentColor(color), [color]);

  return (
    <div className="color-picker">
      <h3>{title}</h3>
      <div 
        className="color-swatch" 
        style={{ backgroundColor: currentColor }}
        onClick={() => setShowPicker(!showPicker)}
      />
      
      {showPicker && (
        <div ref={pickerRef} className="color-picker-popup">
          <HexColorPicker color={currentColor} onChange={setCurrentColor} />
          <input
            type="text"
            value={currentColor}
            onChange={(e) => {
              setCurrentColor(e.target.value);
              onChange(e.target.value);
            }}
          />
        </div>
      )}
    </div>
  );
}

export default ColorPicker;
