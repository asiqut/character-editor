// src/components/PresetSelector.js
import React from 'react';

function PresetSelector({ part, presets, current, onChange }) {
  return (
    <div className="preset-selector">
      <h3>{part.charAt(0).toUpperCase() + part.slice(1)}</h3>
      <div className="preset-options">
        {presets.map(preset => (
          <button
            key={preset}
            className={preset === current ? 'active' : ''}
            onClick={() => onChange(part, preset)}
          >
            {preset}
          </button>
        ))}
      </div>
    </div>
  );
}

export default PresetSelector;
