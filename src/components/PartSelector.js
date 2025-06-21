import React from 'react';

function PartSelector({
  title,
  part,
  options,
  current,
  onChange,
  showSubtypes = false,
  subtypes = null,
  currentSubtype = null,
  onSubtypeChange
}) {
  // Функция для обработки выбора варианта
  const handleOptionSelect = (option) => {
    onChange(part, option);
  };

  // Функция для обработки выбора подтипа
  const handleSubtypeSelect = (subtype) => {
    onSubtypeChange(subtype);
  };

  return (
    <div className={`part-selector ${part}`}>
      <h3>{title}</h3>
      
      {/* Основные варианты */}
      <div className="options">
        {options.map(option => (
          <button
            key={option}
            className={option === current ? 'active' : ''}
            onClick={() => handleOptionSelect(option)}
          >
            {CHARACTER_CONFIG.parts[part].variants[option]?.label || option}
          </button>
        ))}
      </div>
      
      {/* Подтипы (для глаз) */}
      {showSubtypes && subtypes && (
        <div className="subtypes">
          <h4>Варианты:</h4>
          {subtypes.map(subtype => (
            <button
              key={subtype}
              className={subtype === currentSubtype ? 'active' : ''}
              onClick={() => handleSubtypeSelect(subtype)}
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
