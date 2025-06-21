import React, { useState, useEffect } from 'react';
import { loadPSD } from './lib/psdLoader';
import { CHARACTER_CONFIG, DEFAULT_CHARACTER } from './lib/characterConfig';
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

  // Обработчик изменения варианта части
  const handlePartChange = (part, value) => {
    setCharacter(prev => {
      const newChar = { ...prev };
      
      if (part === 'eyes') {
        newChar.eyes = {
          type: value,
          // Для обычных глаз устанавливаем подтип по умолчанию
          subtype: value === 'обычные' ? 'с ресницами' : null
        };
      } else {
        newChar[part] = value;
      }
      
      return newChar;
    });
  };

  // Обработчик изменения подтипа (для глаз)
  const handleSubtypeChange = (subtype) => {
    setCharacter(prev => ({
      ...prev,
      eyes: {
        ...prev.eyes,
        subtype
      }
    }));
  };

  // Обработчик изменения основного цвета
  const handleMainColorChange = (color) => {
    setCharacter(prev => {
      const updatedPartColors = {};
      
      // Обновляем все части, на которые влияет основной цвет
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

  // Обработчик изменения цвета части
  const handlePartColorChange = (part, color) => {
    setCharacter(prev => ({
      ...prev,
      partColors: {
        ...prev.partColors,
        [part]: color
      }
    }));
  };

  // Обработчик изменения цвета белков глаз
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
  
  if (!CHARACTER_CONFIG || !CHARACTER_CONFIG.parts) {
  return (
    <div className="error">
      <h2>Ошибка конфигурации</h2>
      <p>Не удалось загрузить конфигурацию персонажа. Проверьте файл characterConfig.js</p>
    </div>
  );
  }
  
  return (
    <div className="character-editor">
      <h1>Редактор персонажа Kinwoods</h1>
      
      <div className="editor-container">
        <div className="preview-area">
          <CharacterPreview psdData={psdData} character={character} />
        </div>
        
        <div className="controls">
          {/* Рендерим части персонажа на основе конфигурации */}
          {Object.entries(CHARACTER_CONFIG?.parts || {}).map(([partKey, partConfig]) => {
            if (!partConfig || !partConfig.enabled) return null;
            
            // Пропускаем щёки, если они отключены
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

                {/* Цветовые пикеры */}
                {!partConfig.isSingleVariant ? (
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
                ) : (
                  <ColorPicker
                    title="Цвет"
                    color={character.partColors[partKey]}
                    onChange={(color) => handlePartColorChange(partKey, color)}
                  />
                )}
              </div>
            );
          })}

          {/* Основной цвет */}
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
