// Используется в App.js для выбора вариантов частей тела (например, уши, глаза, хвост). Он отображает: заголовок, набор кнопок для выбора варианта, подтипы, если они есть (например, для глаз: подтипы "с ресницами" или "без ресниц")
import React from 'react';
import { PSD_CONFIG } from '../lib/defaultConfig';

function PartSelector({
  part,
  current,
  onChange,
  currentSubtype,
  onSubtypeChange,
  character
}) {
  const { 
    interface_title: title, 
    variants 
  } = PSD_CONFIG.groups[part] || {};
  
  const options = Object.keys(variants);
  const showSubtypes = part === 'eyes' && variants[current]?.subtypes;
  const subtypes = showSubtypes 
    ? Object.keys(variants[current].subtypes) 
    : [];

  return (
    <div className={`part-selector ${part}`}>
      <h3>{title}</h3>
      <div className="options">
        {options.map(option => (
          <button
            key={option}
            className={option === current ? 'active' : ''}
            onClick={() => onChange(part, option)}
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
