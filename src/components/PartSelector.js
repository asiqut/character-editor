import React from 'react';

function PartSelector({
  title,
  part,
  variants, // Теперь принимаем объект вариантов
  current,
  onChange,
  showSubtypes = false,
  subtypes = [],
  currentSubtype,
  onSubtypeChange
}) {
  // Преобразуем варианты в массив для отображения
  const variantKeys = Object.keys(variants);
  
  return (
    <div className={`part-selector ${part}`}>
      <h3>{title}</h3>
      <div className="options">
        {variantKeys.map(variantKey => {
          const variant = variants[variantKey];
          return (
            <button
              key={variantKey}
              className={variantKey === current ? 'active' : ''}
              onClick={() => onChange(part, variantKey)}
            >
              {variant.label || variantKey}
            </button>
          );
        })}
      </div>
      
      {showSubtypes && (
        <div className="subtypes">
          <h4>Варианты:</h4>
          {Object.entries(subtypes).map(([subtypeKey, subtypeData]) => (
            <button
              key={subtypeKey}
              className={subtypeKey === currentSubtype ? 'active' : ''}
              onClick={() => onSubtypeChange(part, subtypeKey)}
            >
              {subtypeKey}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default PartSelector;
