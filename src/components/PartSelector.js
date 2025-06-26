import { PSD_CONFIG } from '../lib/defaultConfig';
import React from 'react';

export default function PartSelector({
  part,
  config,
  currentValue,
  onChange,
  currentSubtype,
  onSubtypeChange
}) {
  // Для частей с isSingleVariant не показываем выбор вариантов
  if (config.isSingleVariant) {
    return null;
  }

  const variants = Object.keys(config.variants);
  const showSubtypes = part === 'eyes' && 
                      currentValue === 'обычные' && 
                      config.variants['обычные']?.subtypes;

  return (
    <div className={`part-selector ${part}`}>
      <h3>Варианты</h3>
      
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

      {showSubtypes && (
        <>
          <h3>Ресницы</h3>
          <div className="options">
            {Object.keys(config.variants['обычные'].subtypes).map(subtype => (
              <button
                key={subtype}
                className={subtype === currentSubtype ? 'active' : ''}
                onClick={() => onSubtypeChange(part, subtype)}
              >
                {subtype}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
