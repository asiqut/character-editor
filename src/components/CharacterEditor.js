import React from 'react';
import ColorPicker from './ColorPicker';

function PartSelector({
  title,
  part,
  options,
  current,
  onChange,
  color,
  onColorChange,
  showSubtypes = false,
  subtypes = [],
  currentSubtype,
  onSubtypeChange
}) {
  return (
    <div className={`part-selector ${part}`}>
      <h3>{title}</h3>
      <div className="options-grid">
        {options.map(option => (
          <button
            key={option}
            className={`option-btn ${option === current ? 'active' : ''}`}
            onClick={() => onChange(part, option)}
          >
            {option}
          </button>
        ))}
      </div>

      {showSubtypes && (
        <div className="subtypes">
          {subtypes.map(subtype => (
            <button
              key={subtype}
              className={`subtype-btn ${subtype === currentSubtype ? 'active' : ''}`}
              onClick={() => onSubtypeChange(part, subtype)}
            >
              {subtype}
            </button>
          ))}
        </div>
      )}

      {color && (
        <ColorPicker 
          color={color}
          onChange={(newColor) => onColorChange(part, newColor)}
          label={`Цвет ${title.toLowerCase()}`}
        />
      )}
    </div>
  );
}

export default React.memo(PartSelector);
