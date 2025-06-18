// src/components/PartSelector.js
import React from 'react';
import PropTypes from 'prop-types';
import ColorPicker from './ColorPicker';

function PartSelector({
  part,
  title,
  options,
  current,
  onChange,
  color,
  onColorChange,
  showSubtypes = false,
  subtypes = [],
  currentSubtype,
  onSubtypeChange
}) {
  return (
    <div className={`part-selector ${part}`}>
      <h3>{title}</h3>
      
      <div className="options">
        {options.map(option => (
          <button
            key={option}
            className={option === current ? 'active' : ''}
            onClick={() => onChange(part, option)}
            aria-label={`Выбрать ${option}`}
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

      {color && (
        <ColorPicker
          title={`Цвет ${title.toLowerCase()}`}
          color={color}
          onChange={(newColor) => onColorChange(part, newColor)}
        />
      )}
    </div>
  );
}

PartSelector.propTypes = {
  part: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  current: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  color: PropTypes.string,
  onColorChange: PropTypes.func,
  showSubtypes: PropTypes.bool,
  subtypes: PropTypes.arrayOf(PropTypes.string),
  currentSubtype: PropTypes.string,
  onSubtypeChange: PropTypes.func
};

export default PartSelector;
