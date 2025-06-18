import React from 'react';
import { PARTS_STRUCTURE } from '../lib/psdStructure';
import ColorPicker from './ColorPicker';

function PartSelector({ partName, character, onPartChange, onSubtypeChange }) {
  const partConfig = PARTS_STRUCTURE[partName];
  if (!partConfig) return null;

  // Получаем текущее значение варианта
  const currentVariant = partName === 'eyes' 
    ? character.eyes.type 
    : character[partName];

  return (
    <div className={`part-selector ${partName}`}>
      <h3>{partConfig.title}</h3>
      
      {/* Для частей с вариантами */}
      {!partConfig.isSingleVariant && (
        <div className="options">
          {Object.keys(partConfig.variants).map(variant => (
            <button
              key={variant}
              className={variant === currentVariant ? 'active' : ''}
              onClick={() => onPartChange(partName, variant)}
            >
              {variant}
            </button>
          ))}
        </div>
      )}

      {/* Подтипы для глаз */}
      {partName === 'eyes' && currentVariant === 'обычные' && (
        <div className="subtypes">
          <h4>Варианты:</h4>
          {Object.keys(partConfig.variants['обычные'].subtypes).map(subtype => (
            <button
              key={subtype}
              className={subtype === character.eyes.subtype ? 'active' : ''}
              onClick={() => onSubtypeChange('eyes', subtype)}
            >
              {subtype}
            </button>
          ))}
        </div>
      )}

      {/* Цветовой пикер для всех частей кроме глаз (их цвет в основном блоке) */}
      {partName !== 'eyes' && !partConfig.isSingleVariant && (
        <ColorPicker
          title="Цвет"
          color={character.partColors[partName] || character.colors.main}
          onChange={(color) => onPartChange(partName, color, 'color')}
        />
      )}

      {/* Для головы (только цвет) */}
      {partConfig.isSingleVariant && (
        <ColorPicker
          title="Цвет"
          color={character.partColors[partName] || character.colors.main}
          onChange={(color) => onPartChange(partName, color, 'color')}
        />
      )}
    </div>
  );
}

export default PartSelector;
