// Отвечает за цветовые пикеры, окно цветовых пикеров, строку HEX кода 
import React, { useState, useEffect, useRef } from 'react';
import { HexColorPicker } from 'react-colorful';
import { PSD_CONFIG } from '../lib/defaultConfig';

const COLOR_REGEX = /^#[0-9A-F]{6}$/i;

function ColorPicker({ title, color, onChange }) {
  const [showPicker, setShowPicker] = useState(false);
  const [currentColor, setCurrentColor] = useState(color);
  const [hexInput, setHexInput] = useState(color);
  const pickerRef = useRef(null);
  const swatchRef = useRef(null);

  useEffect(() => {
    setCurrentColor(color);
    setHexInput(color);
  }, [color]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        if (swatchRef.current && !swatchRef.current.contains(event.target)) {
          setShowPicker(false);
        }
      }
    }

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showPicker]);

  const handleChange = (newColor) => {
    setCurrentColor(newColor);
    setHexInput(newColor);
    onChange(newColor);
  };

  const handleHexChange = (e) => {
    const value = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`;
    setHexInput(value);
    
    // Проверяем по colorTargets
    const isValidColor = /^#[0-9A-F]{6}$/i.test(value);
    if (isValidColor) {
      setCurrentColor(value);
      onChange(value);
    }
  };

  const getPickerPosition = () => {
    if (!swatchRef.current) return { top: 'auto', bottom: '100%' };
    
    const swatchRect = swatchRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - swatchRect.bottom;
    const spaceAbove = swatchRect.top;
    
    return spaceBelow > 300 || spaceBelow > spaceAbove 
      ? { top: '100%', bottom: 'auto' }
      : { top: 'auto', bottom: '100%' };
  };
  
  return (
    <div className="color-picker">
      <h3>{title}</h3>
      <div 
        ref={swatchRef}
        className="color-swatch" 
        style={{ backgroundColor: currentColor }}
        onClick={() => setShowPicker(!showPicker)}
      />
      
      {showPicker && (
        <div 
          ref={pickerRef}
          className="color-picker-popup"
          style={getPickerPosition()}
        >
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
              maxLength="7"
            />
          </div>
        </div>
      )}
      {!showPicker && (
        <div className="color-value">
          {currentColor}
        </div>
      )}
    </div>
  );
}

export default ColorPicker;
