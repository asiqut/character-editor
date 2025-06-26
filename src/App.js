import React, { useState, useEffect } from 'react';
import { loadAndProcessPSD, PSD_CONFIG, DEFAULT_CHARACTER } from './lib/defaultConfig';
import CharacterPreview from './components/CharacterPreview';
import PartSelector from './components/PartSelector';
import ColorPicker from './components/ColorPicker';
import ExportButtons from './components/ExportButtons';
import './styles/main.css';

// Главный компонент приложения - редактор персонажа
function App() {
  // Состояния приложения:
  const [psdData, setPsdData] = useState(null); // Данные PSD после загрузки
  const [character, setCharacter] = useState(DEFAULT_CHARACTER); // Текущие настройки персонажа
  const [loading, setLoading] = useState(true); // Флаг загрузки
  const [error, setError] = useState(null); // Ошибки загрузки
  const [groupsConfig, setGroupsConfig] = useState({}); // Конфиг групп для интерфейса

  // Эффект: преобразование структуры групп для удобного использования в интерфейсе
  // Запускается один раз при монтировании
  useEffect(() => {
    const transformed = {};
    Object.entries(PSD_CONFIG.groups).forEach(([groupName, config]) => {
      transformed[config.code] = {
        ...config,
        interface_title: config.interface_title
      };
    });
    setGroupsConfig(transformed);
  }, []);

  // Эффект: загрузка и обработка PSD файла
  // Запускается один раз при монтировании
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

  // Обработчик изменения варианта части персонажа
  // Для глаз обрабатывает отдельно основной тип и подтип (ресницы)
  const handlePartChange = (part, value) => {
    setCharacter(prev => {
      if (part === 'eyes') {
        return {
          ...prev,
          eyes: {
            type: value,
            subtype: value === 'обычные' ? 'с ресницами' : null
          }
        };
      }
      return { ...prev, [part]: value };
    });
  };

  // Обработчик изменения подтипа (только для глаз - ресницы)
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

  // Обработчик изменения цвета (основные цвета)
  const handleColorChange = (colorType, color) => {
    setCharacter(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorType]: color
      }
    }));
  };

  // Обработчик изменения цвета конкретной части
  const handlePartColorChange = (part, color) => {
    setCharacter(prev => ({
      ...prev,
      partColors: {
        ...prev.partColors,
        [part]: color
      }
    }));
  };

  // Рендер группы элементов управления для конкретной части персонажа
  const renderPartGroup = (part) => {
    const config = groupsConfig[part];
    if (!config) {
      console.error(`Missing config for part: ${part}`);
      return null;
    }

    return (
      <div className="part-group" key={part}>
        <h2>{config.interface_title}</h2>
        
        {/* Селектор вариантов, если не единственный вариант */}
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

        {/* Цветовая палитра для части (кроме щёк, если выбран вариант "нет") */}
        {(part !== 'cheeks' || character.cheeks !== 'нет') && (
          <ColorPicker
            title={PSD_CONFIG.colorTargets[part]?.interface_color_title}
            color={character.partColors[part]}
            onChange={(color) => handlePartColorChange(part, color)}
          />
        )}

        {/* Дополнительная палитра для белков глаз */}
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

  // Состояния загрузки и ошибок
  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;
  if (!psdData) return <div>Данные не загружены</div>;

  // Основной рендер интерфейса
  return (
    <div className="character-editor">
      <h1>Редактор персонажа KINWOODS</h1>
      
      <div className="editor-container">
        {/* Область предпросмотра персонажа */}
        <div className="preview-area">
          <CharacterPreview psdData={psdData} character={character} />
          <ExportButtons character={character} psdData={psdData} />
        </div>
        
        {/* Панель управления с элементами выбора */}
        <div className="controls">
          {/* Рендер групп элементов управления в заданном порядке */}
          {PSD_CONFIG.renderOrder.map(part => renderPartGroup(part))}

          {/* Блок основного цвета (меняет сразу несколько частей) */}
          <div className="part-group">
            <h2>{PSD_CONFIG.colorTargets.main.interface_color_title}</h2>
            <ColorPicker
              title="Цвет"
              color={character.colors.main}
              onChange={(color) => {
                handleColorChange('main', color);
                // Применяем основной цвет ко всем связанным частям
                const newPartColors = {...character.partColors};
                PSD_CONFIG.colorTargets.main.elements.forEach(part => {
                  newPartColors[part] = color;
                });
                setCharacter({...character, partColors: newPartColors});
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
