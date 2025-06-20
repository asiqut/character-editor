import React, { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';

function ColorPicker({ title, color, onChange }) {
  const [showPicker, setShowPicker] = useState(false);
  const [currentColor, setCurrentColor] = useState(color);
  const [hexInput, setHexInput] = useState(color);
  
  useEffect(() => {
    setCurrentColor(color);
    setHexInput(color);
  }, [color]);

  const handleChange = (newColor) => {
    setCurrentColor(newColor);
    setHexInput(newColor);
    onChange(newColor);
  };

  const handleHexChange = (e) => {
    const value = e.target.value;
    setHexInput(value);
    
    // Проверяем валидность HEX-кода
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      setCurrentColor(value);
      onChange(value);
    }
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
        <>
          <HexColorPicker
            color={currentColor}
            onChange={handleChange}
          />
          <div className="hex-input">
            <input
              type="text"
              value={hexInput}
              onChange={handleHexChange}
              placeholder="HEX color"
            />
          </div>
        </>
      )}
      <div className="color-value">
        {currentColor}
      </div>
    </div>
  );
}

export default ColorPicker;
