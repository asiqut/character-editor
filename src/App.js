import React, { useState, useEffect } from 'react';
import { loadAndProcessPSD, PSD_CONFIG, DEFAULT_CHARACTER } from './lib/defaultConfig';
import CharacterPreview from './components/CharacterPreview';
import PartSelector from './components/PartSelector';
import ColorPicker from './components/ColorPicker';
import ExportButtons from './components/ExportButtons';
import './styles/main.css';

function App() {
  const [psdData, setPsdData] = useState(null);
  const [character, setCharacter] = useState(DEFAULT_CHARACTER);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groupsConfig, setGroupsConfig] = useState({});

  // Преобразование структуры групп
  useEffect(() => {
    const transformed = {};
    Object.entries(PSD_CONFIG.groups).forEach(([groupName, config]) => {
      transformed[config.code] = {
        ...config,
        interface_title: groupName
      };
    });
    setGroupsConfig(transformed);
  }, []);

  // Загрузка PSD данных
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
        type: value, // value должен быть строкой ('обычные' или 'лисьи')
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
    setCharacter(prev => {
      const newColors = {...prev.colors, [colorType]: color};
    
      // Если меняется основной цвет - обновляем только указанные части
      if (colorType === 'main') {
        const newPartColors = {...prev.partColors};
        PSD_CONFIG.colorTargets.main.elements.forEach(part => {
          newPartColors[part] = color;
        });
        return {...prev, colors: newColors, partColors: newPartColors};
      }
    
      return {...prev, colors: newColors};
    });
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

const renderPartGroup = (part) => {
  const config = groupsConfig[part];
  if (!config) {
    console.error(`Missing config for part: ${part}`);
    return null;
  }

  return (
    <div className="part-group" key={part}>
      <h3>{config.interface_title}</h3>
      
      {!config.isSingleVariant && (
        <PartSelector
          part={part}
          config={config}
          currentValue={part === 'eyes' ? character.eyes.type : character[part]}
          onChange={handlePartChange}
          currentSubtype={part === 'eyes' ? character.eyes.subtype : null}
          onSubtypeChange={handleSubtypeChange}
        />
      )}

      {(part !== 'cheeks' || character.cheeks !== 'нет') && (
        <ColorPicker
          title={PSD_CONFIG.colorTargets[part]?.interface_color_title}
          color={character.partColors[part]}
          onChange={(color) => handlePartColorChange(part, color)}
        />
      )}

      {part === 'eyes' && (
        <ColorPicker
          title={PSD_CONFIG.colorTargets.eyesWhite.interface_color_title}
          color={character.colors.eyesWhite}
          onChange={(color) => handleColorChange('eyesWhite', color)}
        />
      )}
    </div>
  );
};

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;
  if (!psdData) return <div>Данные не загружены</div>;

return (
  <div className="character-editor">
    <h1>Редактор персонажа</h1>
    
    <div className="editor-container">
      <div className="preview-area">
        <CharacterPreview psdData={psdData} character={character} />
      </div>
      
      <div className="controls">
        {PSD_CONFIG.renderOrder.map(part => renderPartGroup(part))}

        <div className="part-group">
        <ColorPicker
          title={PSD_CONFIG.colorTargets.main.interface_color_title}
          color={character.colors.main}
          onChange={(color) => {
            handleColorChange('main', color);
            const newPartColors = {};
            PSD_CONFIG.colorTargets.main.elements.forEach(part => {
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
