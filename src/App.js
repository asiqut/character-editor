import React, { useState, useEffect } from 'react';
import { loadPSD } from './lib/psdLoader';
import { CHARACTER_CONFIG, DEFAULT_CHARACTER } from './lib/characterConfig';
import CharacterPreview from './components/CharacterPreview';
import PartSelector from './components/PartSelector';
import ColorPicker from './components/ColorPicker';
import ExportButtons from './components/ExportButtons';
import './styles/main.css';

// Валидация конфига перед использованием
if (!CHARACTER_CONFIG?.parts) {
  console.error('Invalid CHARACTER_CONFIG:', CHARACTER_CONFIG);
  throw new Error('CHARACTER_CONFIG is not properly configured');
}

function App() {
  const [psdData, setPsdData] = useState(null);
  const [character, setCharacter] = useState(DEFAULT_CHARACTER);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await loadPSD();
        if (!data) throw new Error('PSD data not loaded');
        setPsdData(data);
      } catch (err) {
        console.error('PSD loading error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handlePartChange = (part, value) => {
    setCharacter(prev => ({
      ...prev,
      [part]: part === 'eyes' 
        ? { type: value, subtype: value === 'обычные' ? 'с ресницами' : null }
        : value
    }));
  };

  const handleSubtypeChange = (subtype) => {
    setCharacter(prev => ({
      ...prev,
      eyes: { ...prev.eyes, subtype }
    }));
  };

  const handleMainColorChange = (color) => {
    setCharacter(prev => {
      const updatedParts = CHARACTER_CONFIG.colors.main.affects.reduce((acc, part) => {
        acc[part] = color;
        return acc;
      }, {});
      
      return {
        ...prev,
        colors: { ...prev.colors, main: color },
        partColors: { ...prev.partColors, ...updatedParts }
      };
    });
  };

  const handlePartColorChange = (part, color) => {
    setCharacter(prev => ({
      ...prev,
      partColors: { ...prev.partColors, [part]: color }
    }));
  };

  const handleEyesWhiteChange = (color) => {
    setCharacter(prev => ({
      ...prev,
      colors: { ...prev.colors, eyesWhite: color }
    }));
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">Ошибка: {error}</div>;
  if (!psdData) return <div className="error">Данные PSD не загружены</div>;

  return (
    <div className="character-editor">
      <h1>Редактор персонажа Kinwoods</h1>
      
      <div className="editor-container">
        <div className="preview-area">
          <CharacterPreview psdData={psdData} character={character} />
        </div>
        
        <div className="controls">
          {Object.entries(CHARACTER_CONFIG.parts).map(([partKey, partConfig]) => {
            if (!partConfig?.enabled) return null;

            const currentValue = partKey === 'eyes' 
              ? character.eyes.type 
              : character[partKey];

            return (
              <div key={partKey} className="part-group">
                <PartSelector
                  title={partConfig.title}
                  part={partKey}
                  options={Object.keys(partConfig.variants)}
                  current={currentValue}
                  onChange={handlePartChange}
                  showSubtypes={partKey === 'eyes' && character.eyes.type === 'обычные'}
                  subtypes={partKey === 'eyes' 
                    ? Object.keys(partConfig.variants['обычные'].subtypes) 
                    : null}
                  currentSubtype={partKey === 'eyes' ? character.eyes.subtype : null}
                  onSubtypeChange={handleSubtypeChange}
                />

                {partKey === 'eyes' && character.eyes.type === 'обычные' && (
                  <ColorPicker
                    title="Белки глаз"
                    color={character.colors.eyesWhite}
                    onChange={handleEyesWhiteChange}
                  />
                )}

                <ColorPicker
                  title="Цвет"
                  color={character.partColors[partKey]}
                  onChange={(color) => handlePartColorChange(partKey, color)}
                />
              </div>
            );
          })}

          <div className="part-group">
            <ColorPicker
              title="Основной цвет"
              color={character.colors.main}
              onChange={handleMainColorChange}
            />
          </div>

          <ExportButtons character={character} psdData={psdData} />
        </div>
      </div>
    </div>
  );
}

export default App;
