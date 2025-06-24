import React from 'react';

function PartSelector({
  title,
  options,
  current,
  onChange,
  subtypes,
  currentSubtype,
  onSubtypeChange
}) {
  return (
    <div className="part-selector">
      <h3>{title}</h3>
      
      {/* Основные варианты */}
      <div className="options">
        {options.map(option => (
          <button
            key={option}
            className={option === current ? 'active' : ''}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
      
      {/* Подтипы (если есть) */}
      {subtypes && (
        <div className="subtypes">
          {subtypes.map(subtype => (
            <button
              key={subtype}
              className={subtype === currentSubtype ? 'active' : ''}
              onClick={() => onSubtypeChange(subtype)}
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
