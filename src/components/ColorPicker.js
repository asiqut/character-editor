// src/components/ColorPicker.js
import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';

function ColorPicker({ title, color, onChange }) {
  const [showPicker, setShowPicker] = useState(false);
  
  return (
    <div className="color-picker">
      <h3>{title}</h3>
      <div 
        className="color-swatch" 
        style={{ backgroundColor: color }}
        onClick={() => setShowPicker(!showPicker)}
      />
      
      {showPicker && (
        <HexColorPicker
          color={color}
          onChange={onChange}
        />
      )}
    </div>
  );
}

export default ColorPicker;
