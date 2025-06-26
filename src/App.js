import React, { useState, useEffect } from 'react';
import { loadAndProcessPSD } from './lib/defaultConfig';
import CharacterPreview from './components/CharacterPreview';
import PartSelector from './components/PartSelector';
import ColorPicker from './components/ColorPicker';
import ExportButtons from './components/ExportButtons';
import './styles/main.css';

function App() {
  const [psdData, setPsdData] = useState(null);
  const [character, setCharacter] = useState(PSD_CONFIG.defaultCharacter);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await loadAndProcessPSD();
        setPsdData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handlePartChange = (part, value) => {
    setCharacter(prev => {
      const newChar = {...prev};
      
      if (part === 'eyes') {
        newChar.eyes = {
          type: value,
          subtype: value === 'обычные' ? 'с ресницами' : null
        };
      } else {
        newChar[part] = value;
      }
      
      return newChar;
    });
  };

  const handleSubtypeChange = (part, subtype) => {
    if (part !== 'eyes') return;
    
    setCharacter(prev => ({
      ...prev,
      eyes: {
        ...prev.eyes,
        subtype: subtype
      }
    }));
  };

  const handleColorChange = (colorType, color) => {
    setCharacter(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorType]: color
      }
    }));
  };

  const handlePartColorChange = (part, color) => {
    setCharacter(prev => ({
      ...prev,
      partColors: {
        ...prev.partColors,
        [part]: color
      }
    }));
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;
  if (!psdData) return <div>Данные не загружены</div>;

  const renderPartGroup = (part) => {
    const config = PSD_CONFIG.groups[part];
    return (
      <div className="part-group" key={part}>
        <PartSelector
          part={part}
          currentValue={character[part]}
          onChange={handlePartChange}
          currentSubtype={part === 'eyes' ? character.eyes.subtype : null}
          onSubtypeChange={handleSubtypeChange}
          character={character}
        />
        
        {/* Основной цвет части */}
        <ColorPicker
          title={`${config.interface_title} цвет`}
          color={character.partColors[part]}
          onChange={(color) => handlePartColorChange(part, color)}
        />

        {/* Специальные цветовые цели (белки глаз) */}
        {part === 'eyes' && (
          <ColorPicker
            title="Белки глаз"
            color={character.colors.eyesWhite}
            onChange={(color) => handleColorChange('eyesWhite', color)}
          />
        )}
      </div>
    );
  };

  return (
    <div className="character-editor">
      <h1>Редактор персонажа</h1>
      
      <div className="editor-container">
        <div className="preview-area">
          <CharacterPreview psdData={psdData} character={character} />
        </div>
        
        <div className="controls">
          {PSD_CONFIG.renderOrder.map(part => (
            part === 'cheeks' && character.cheeks === 'нет' ? null : renderPartGroup(part)
          ))}

          {/* Глобальный цвет */}
          <div className="part-group">
            <ColorPicker
              title="Основной цвет"
              color={character.colors.main}
              onChange={(color) => {
                handleColorChange('main', color);
                // Автоматическое применение к всем частям
                const newPartColors = {};
                Object.keys(PSD_CONFIG.groups).forEach(part => {
                  newPartColors[part] = color;
                });
                setCharacter(prev => ({
                  ...prev,
                  partColors: newPartColors
                }));
              }}
            />
          </div>

          <ExportButtons character={character} psdData={psdData} />
        </div>
      </div>
    </div>
  );
}

export default App;
