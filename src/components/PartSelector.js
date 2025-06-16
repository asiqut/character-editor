function PartSelector({
  title,
  part,
  options,
  current,
  onChange,
  showSubtypes = false,
  subtypes = [],
  currentSubtype,
  onSubtypeChange
}) {
  const handleMainOptionClick = (option) => {
    onChange(part, option);
  };

  const handleSubtypeClick = (subtype) => {
    onSubtypeChange(part, subtype);
  };

  return (
    <div className={`part-selector ${part}`}>
      <h3>{title}</h3>
      <div className="options">
        {options.map(option => (
          <button
            key={option}
            className={option === current ? 'active' : ''}
            onClick={() => handleMainOptionClick(option)}
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
              onClick={() => handleSubtypeClick(subtype)}
            >
              {subtype}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
