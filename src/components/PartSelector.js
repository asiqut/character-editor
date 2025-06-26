// Используется в App.js для выбора вариантов частей тела (например, уши, глаза, хвост)
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
  const variants = config.isSingleVariant 
    ? [part]
    : Object.keys(config.variants);

  const showSubtypes = part === 'eyes' && 
                      currentValue === 'обычные' && 
                      config.variants['обычные']?.subtypes;

  return (
    <div className={`part-selector ${part}`}>
      <h3>{config.interface_title}</h3>
      
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
        <div className="subtypes">
          <h4>Варианты:</h4>
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
      )}
    </div>
  );
}
