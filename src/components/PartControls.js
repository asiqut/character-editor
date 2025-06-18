import React from 'react';
import '../styles/part-controls.css';

const PartControls = ({ config, character, onChange }) => {
  const handlePartChange = (part, value) => {
    onChange(part, value);
  };

  const handleSubtypeChange = (part, subtype) => {
    onChange(part, subtype, true);
  };

  const renderPartControl = (partId) => {
    const partConfig = config[partId];
    if (!partConfig || !partConfig.variants) return null;

    const currentValue = character[partId];
    const currentSubtype = partId === 'eyes' ? character.eyes.subtype : null;

    // Пропускаем скрытые части (например, отключенные щеки)
    if (currentValue === 'нет') return null;

    return (
      <div key={partId} className={`part-group part-${partId}`}>
        <h3>{partConfig.title}</h3>
        
        <div className="variant-options">
          {Object.entries(partConfig.variants).map(([variantId, variant]) => (
            <button
              key={variantId}
              className={`variant-button ${
                currentValue === variantId ? 'active' : ''
              }`}
              onClick={() => handlePartChange(partId, variantId)}
            >
              {variant.label || variantId}
            </button>
          ))}
        </div>

        {/* Подтипы для глаз */}
        {partId === 'eyes' && 
          character.eyes.type === 'обычные' && (
            <div className="subtype-options">
              <h4>Варианты глаз:</h4>
              {Object.entries(partConfig.variants['обычные'].subtypes).map(
                ([subtypeId, subtypeLabel]) => (
                  <button
                    key={subtypeId}
                    className={`subtype-button ${
                      currentSubtype === subtypeId ? 'active' : ''
                    }`}
                    onClick={() => handleSubtypeChange('eyes', subtypeId)}
                  >
                    {subtypeLabel}
                  </button>
                )
              )}
            </div>
          )}
      </div>
    );
  };

  return (
    <div className="parts-controls">
      <h2>Части тела</h2>
      
      {/* Основные части */}
      {Object.keys(config).map(renderPartControl)}
      
      {/* Специальный контроль для щек */}
      <div className="part-group part-cheeks">
        <h3>Щёки</h3>
        <div className="variant-options">
          <button
            className={`variant-button ${
              character.cheeks === 'нет' ? 'active' : ''
            }`}
            onClick={() => handlePartChange('cheeks', 'нет')}
          >
            Отключить
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartControls;
