import React from 'react';

function PartSelector({
  partName, // Имя части (например 'ears', 'eyes')
  character,
  onPartChange,
  onSubtypeChange
}) {
  const partConfig = PARTS_STRUCTURE[partName];
  if (!partConfig) return null;

  // Для частей с одним вариантом (голова)
  if (partConfig.isSingleVariant) {
    return (
      <div className={`part-selector ${partName}`}>
        <h3>{partConfig.title}</h3>
        <ColorPicker
          title="Цвет"
          color={character.partColors[partName] || character.colors.main}
          onChange={(color) => onPartChange(partName, color, 'color')}
        />
      </div>
    );
  }

  // Для частей с вариантами
  const currentVariant = partName === 'eyes' 
    ? character.eyes.type 
    : character[partName];

  return (
    <div className={`part-selector ${partName}`}>
      <h3>{partConfig.title}</h3>
      <div className="options">
        {Object.keys(partConfig.variants).map(variantKey => (
          <button
            key={variantKey}
            className={variantKey === currentVariant ? 'active' : ''}
            onClick={() => onPartChange(partName, variantKey)}
          >
            {variantKey}
          </button>
        ))}
      </div>

      {/* Подтипы для глаз */}
      {partName === 'eyes' && currentVariant === 'обычные' && (
        <div className="subtypes">
          <h4>Варианты:</h4>
          {Object.keys(partConfig.variants['обычные'].subtypes).map(subtype => (
            <button
              key={subtype}
              className={subtype === character.eyes.subtype ? 'active' : ''}
              onClick={() => onSubtypeChange(partName, subtype)}
            >
              {subtype}
            </button>
          ))}
        </div>
      )}

      {/* Цветовой пикер для всех частей кроме глаз (у них особый цвет) */}
      {partName !== 'eyes' && (
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
