import React from 'react';

function PartSelector({
  title,
  part,
  options,
  current,
  onChange,
  showSubtypes = false,
  subtypes = [],
  currentSubtype,
  onSubtypeChange
}) {
  return (
    <div className={`part-selector ${part}`}>
      <h3>{title}</h3>
      <div className="options">
        {options.map(option => (
          <button
            key={option}
            className={option === current ? 'active' : ''}
            onClick={() => onChange(part, option)} // Изменено здесь
          >
            {option}
          </button>
        ))}
      </div>
      
      {showSubtypes && (
        <div className="subtypes">
          <h4>Варианты:</h4>
          {subtypes.map(subtype => (
            <button
              key={subtype}
              className={subtype === currentSubtype ? 'active' : ''}
              onClick={() => onSubtypeChange('eyes', subtype)} // Изменено здесь
            >
              {subtype}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default PartSelector;
