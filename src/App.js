import React, { useState, useEffect } from 'react';
import { loadPSD } from './lib/psdLoader';
import { CHARACTER_CONFIG, DEFAULT_CHARACTER } from './lib/characterConfig';
import CharacterPreview from './components/CharacterPreview';
import PartSelector from './components/PartSelector';
import ColorPicker from './components/ColorPicker';
import ExportButtons from './components/ExportButtons';
import './styles/main.css';

if (!CHARACTER_CONFIG || !CHARACTER_CONFIG.parts) {
  throw new Error('Invalid CHARACTER_CONFIG - missing parts');
}

if (!CHARACTER_CONFIG || typeof CHARACTER_CONFIG !== 'object') {
  throw new Error('CHARACTER_CONFIG is not properly initialized');
}

if (!CHARACTER_CONFIG.parts || typeof CHARACTER_CONFIG.parts !== 'object') {
  console.error('Invalid CHARACTER_CONFIG.parts:', CHARACTER_CONFIG.parts);
  throw new Error('CHARACTER_CONFIG.parts must be an object');
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
      const newChar = { ...prev };
      
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

  const handleSubtypeChange = (subtype) => {
    setCharacter(prev => ({
      ...prev,
      eyes: {
        ...prev.eyes,
        subtype
      }
    }));
  };

  const handleMainColorChange = (color) => {
    setCharacter(prev => {
      const updatedPartColors = {};
      
      CHARACTER_CONFIG.colors.main.affects.forEach(part => {
        updatedPartColors[part] = color;
      });

      return {
        ...prev,
        colors: {
          ...prev.colors,
          main: color
        },
        partColors: {
          ...prev.partColors,
          ...updatedPartColors
        }
      };
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

  const handleEyesWhiteChange = (color) => {
    setCharacter(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        eyesWhite: color
      }
    }));
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;
  if (!psdData) return <div>Данные не загружены</div>;

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
            
            if (partKey === 'cheeks' && character.cheeks === 'нет') {
              return (
                <div key={partKey} className="part-group">
                  <PartSelector
                    title={partConfig.title}
                    part={partKey}
                    options={Object.keys(partConfig.variants)}
                    current={character[partKey]}
                    onChange={handlePartChange}
                  />
                </div>
              );
            }

            return (
              <div key={partKey} className="part-group">
                <PartSelector
                  title={partConfig.title}
                  part={partKey}
                  options={Object.keys(partConfig.variants)}
                  current={partConfig.isSingleVariant ? null : character[partKey]}
                  onChange={handlePartChange}
                  showSubtypes={partKey === 'eyes' && character.eyes?.type === 'обычные'}
                  subtypes={partKey === 'eyes' ? 
                    Object.keys(CHARACTER_CONFIG.parts.eyes.variants['обычные'].subtypes) : null}
                  currentSubtype={partKey === 'eyes' ? character.eyes?.subtype : null}
                  onSubtypeChange={handleSubtypeChange}
                />

                {!partConfig.isSingleVariant && (
                  <>
                    {partKey === 'eyes' && character.eyes?.type === 'обычные' && (
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
                  </>
                )}
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
