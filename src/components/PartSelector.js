// src/components/PartSelector.js
import React from 'react';

function PartSelector({ title, options, current, onChange }) {
  return (
    <div className="part-selector">
      <h3>{title}</h3>
      <div className="options">
        {Object.keys(options).map(option => (
          <button
            key={option}
            className={option === current ? 'active' : ''}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export default PartSelector;
