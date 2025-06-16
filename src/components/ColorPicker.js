import React, { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';

function ColorPicker({ title, color, onChange }) {
  const [showPicker, setShowPicker] = useState(false);
  const [currentColor, setCurrentColor] = useState(color);
  
  useEffect(() => {
    setCurrentColor(color);
  }, [color]);

  const handleChange = (newColor) => {
    setCurrentColor(newColor);
    onChange(newColor);
  };
  
  return (
    <div className="color-picker">
      <h3>{title}</h3>
      <div 
        className="color-swatch" 
        style={{ backgroundColor: currentColor }}
        onClick={() => setShowPicker(!showPicker)}
      />
      
      {showPicker && (
        <HexColorPicker
          color={currentColor}
          onChange={handleChange}
        />
      )}
      <div className="color-value">
        {currentColor}
      </div>
    </div>
  );
}

export default ColorPicker;
