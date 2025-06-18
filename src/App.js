import React, { useState, useEffect } from 'react';
import { loadPSD } from './lib/psdLoader';
import { DEFAULT_CHARACTER, PARTS_STRUCTURE } from './lib/psdStructure';
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

  useEffect(() => {
    async function load() {
      try {
        const data = await loadPSD();
        setPsdData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handlePartChange = (part, value, changeType) => {
  setCharacter(prev => {
    if (changeType === 'color') {
      return {
        ...prev,
        partColors: {
          ...prev.partColors,
          [part]: value
        }
      };
    }

    if (part === 'eyes') {
      return {
        ...prev,
        eyes: {
          type: value,
          subtype: value === 'обычные' ? 'с ресницами' : null
        }
      };
    }

    return {
      ...prev,
      [part]: value
    };
  });
};

const handleSubtypeChange = (part, subtype) => {
  if (part !== 'eyes') return;
  
  setCharacter(prev => ({
    ...prev,
    eyes: {
      ...prev.eyes,
      subtype
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

if (loading) return <div>Загрузка PSD файла...</div>;
if (error) return <div>Ошибка загрузки: {error}</div>;
if (!psdData) return <div>Не удалось загрузить данные PSD</div>;

// В return добавим проверку
<CharacterPreview psdData={psdData} character={character} />

  return (
    <div className="character-editor">
      <h1>Редактор персонажа</h1>
      
      <div className="editor-container">
        <div className="preview-area">
          <CharacterPreview psdData={psdData} character={character} />
        </div>
        
        <div className="controls">
  {Object.keys(PARTS_STRUCTURE).map(partName => (
    <div className="part-group" key={partName}>
      <PartSelector
        partName={partName}
        character={character}
        onPartChange={handlePartChange}
        onSubtypeChange={handleSubtypeChange}
      />
      
      {/* Для головы цвет уже встроен в PartSelector */}
      {partName !== 'head' && partName !== 'eyes' && (
        <ColorPicker
          title="Цвет"
          color={character.partColors[partName] || character.colors.main}
          onChange={(color) => handlePartChange(partName, color, 'color')}
        />
      )}
    </div>
  ))}

  {/* Основные цвета */}
  <div className="part-group">
    <ColorPicker
      title="Основной цвет"
      color={character.colors.main}
      onChange={(color) => {
        handleColorChange('main', color);
        // Автоматическое применение ко всем частям
        const newPartColors = {};
        Object.keys(PARTS_STRUCTURE).forEach(part => {
          newPartColors[part] = color;
        });
        setCharacter(prev => ({
          ...prev,
          partColors: newPartColors
        }));
      }}
    />
    <ColorPicker
      title="Белки глаз"
      color={character.colors.eyesWhite}
      onChange={(color) => handleColorChange('eyesWhite', color)}
    />
  </div>

  <ExportButtons character={character} psdData={psdData} />
</div>
      </div>
    </div>
  );
}

export default App;
