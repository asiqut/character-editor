// src/components/ColorPicker.js
import React from 'react';
import { HexColorPicker } from 'react-colorful';

function ColorPicker({ part, color, onChange }) {
  const [showPicker, setShowPicker] = React.useState(false);
  
  return (
    <div className="color-picker">
      <h3>Color for {part}</h3>
      <div 
        className="color-swatch" 
        style={{ backgroundColor: color }}
        onClick={() => setShowPicker(!showPicker)}
      />
      
      {showPicker && (
        <ChromePicker
          color={color}
          onChangeComplete={(color) => {
            onChange(part, color.hex);
            setShowPicker(false);
          }}
        />
      )}
    </div>
  );
}

export default ColorPicker;
