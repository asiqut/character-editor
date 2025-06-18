import React from 'react';

const PartControls = ({ config, character, onChange }) => {
  const handleChange = (part, value) => {
    if (part === 'eyes') {
      onChange(part, { 
        type: value,
        subtype: value === 'обычные' ? 'с ресницами' : null 
      });
    } else {
      onChange(part, value);
    }
  };

  return (
    <div className="parts-controls">
      <h2>Части тела</h2>

      {Object.entries(config).map(([partId, partConfig]) => (
        <div key={partId} className={`part-group part-${partId}`}>
          <h3>{partConfig.title}</h3>
          <div className="variant-options">
            {Object.keys(partConfig.variants).map(variantId => (
              <button
                key={variantId}
                className={`variant-button ${
                  character[partId] === variantId || 
                  (partId === 'eyes' && character.eyes.type === variantId) 
                    ? 'active' : ''
                }`}
                onClick={() => handleChange(partId, variantId)}
              >
                {partConfig.variants[variantId].label || variantId}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PartControls;
