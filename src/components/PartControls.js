import React from 'react';
import PartSelector from './PartSelector';
import ColorPicker from './ColorPicker';

function PartControls({ 
  part, 
  title, 
  options, 
  current, 
  onChange,
  // Опциональные параметры:
  color, 
  onColorChange,
  showSubtypes = false,
  subtypes = [],
  currentSubtype,
  onSubtypeChange
}) {
  return (
    <div className={`part-controls ${part}`}>
      <div className="part-group">
        <PartSelector
          part={part}
          title={title}
          options={options}
          current={current}
          onChange={onChange}
        />

        {showSubtypes && (
          <div className="subtype-controls">
            <h4>Варианты:</h4>
            <div className="subtype-options">
              {subtypes.map(subtype => (
                <button
                  key={subtype}
                  className={subtype === currentSubtype ? 'active' : ''}
                  onClick={() => onSubtypeChange(part, subtype)}
                >
                  {subtype}
                </button>
              ))}
            </div>
          </div>
        )}

        {color && (
          <ColorPicker
            title={`Цвет ${title.toLowerCase()}`}
            color={color}
            onChange={(newColor) => onColorChange(part, newColor)}
          />
        )}
      </div>
    </div>
  );
}

export default PartControls;
