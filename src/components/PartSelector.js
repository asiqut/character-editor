// Используется в App.js для выбора вариантов частей тела (например, уши, глаза, хвост)
import React from 'react';
import { PSD_CONFIG } from '../lib/defaultConfig';

function PartSelector({
  part, // 'ears', 'eyes', 'tail' и т.д.
  currentValue,
  onChange,
  currentSubtype,
  onSubtypeChange 
}) {
  // Получаем конфигурацию для этой части тела
  const partConfig = PSD_CONFIG.groups[part];
  
  // Формируем варианты выбора
  const variants = partConfig.isSingleVariant 
    ? [part] // Для головы (единственный вариант)
    : Object.keys(partConfig.variants); // Все варианты

  // Проверяем наличие подтипов (только для глаз)
  const showSubtypes = part === 'eyes' && 
                       currentValue === 'обычные' && 
                       partConfig.variants.обычные.subtypes;

  return (
    <div className={`part-selector ${part}`}>
      <h3>{partConfig.interface_title}</h3>
      
      {/* Основные варианты */}
      <div className="options">
        {variants.map(variant => (
          <button
            key={variant}
            className={variant === currentValue ? 'active' : ''}
            onClick={() => onChange(part, variant)}
          >
            {variant}
          </button>
        ))}
      </div>
      
      {/* Подтипы (только для обычных глаз) */}
      {showSubtypes && (
        <div className="subtypes">
          <h4>Варианты:</h4>
          {Object.keys(partConfig.variants.обычные.subtypes).map(subtype => (
            <button
              key={subtype}
              className={subtype === currentSubtype ? 'active' : ''}
              onClick={() => onSubtypeChange(part, subtype)}
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
