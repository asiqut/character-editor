import React, { useState, useEffect, useRef } from 'react';
import { loadPSD } from './lib/psdLoader';
import { renderCharacter } from './lib/renderer';
import { DEFAULT_CHARACTER, PARTS_STRUCTURE, RENDER_ORDER } from './lib/config';
import PartControls from './components/PartControls';
import ExportButtons from './components/ExportButtons';
import ColorControls from './components/ColorControls';
import './styles/main.css';

function App() {
  // Состояния приложения
  const [psdData, setPsdData] = useState(null);
  const [character, setCharacter] = useState(DEFAULT_CHARACTER);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);

  // Загрузка PSD при монтировании
  useEffect(() => {
    const loadCharacterData = async () => {
      try {
        const data = await loadPSD();
        setPsdData(data);
      } catch (err) {
        console.error('Ошибка загрузки PSD:', err);
        setError('Не удалось загрузить данные персонажа');
      } finally {
        setLoading(false);
      }
    };

    loadCharacterData();
  }, []);

  // Рендеринг персонажа при изменениях
  useEffect(() => {
    if (psdData && canvasRef.current) {
      try {
        renderCharacter(canvasRef.current, psdData, character, RENDER_ORDER);
      } catch (renderError) {
        console.error('Ошибка рендеринга:', renderError);
      }
    }
  }, [psdData, character]);

  // Обработчики изменений
  const handlePartChange = (part, value, isSubtype = false) => {
    setCharacter(prev => {
      // Особый случай для глаз
      if (part === 'eyes') {
        return {
          ...prev,
          eyes: isSubtype 
            ? { ...prev.eyes, subtype: value }
            : { type: value, subtype: value === 'обычные' ? 'с ресницами' : null }
        };
      }
      
      // Общий случай для других частей
      return { ...prev, [part]: value };
    });
  };

  const handleColorChange = (type, color) => {
    setCharacter(prev => ({
      ...prev,
      colors: { ...prev.colors, [type]: color }
    }));
  };

  const handlePartColorChange = (part, color) => {
    setCharacter(prev => ({
      ...prev,
      partColors: { ...prev.partColors, [part]: color }
    }));
  };

  const resetCharacter = () => {
    setCharacter(DEFAULT_CHARACTER);
  };

  // Состояния загрузки
  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Загрузка редактора персонажей...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-error">
        <h2>Ошибка</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Перезагрузить</button>
      </div>
    );
  }

  if (!psdData) {
    return (
      <div className="app-error">
        <h2>Данные не загружены</h2>
        <p>Не удалось загрузить ресурсы персонажа</p>
      </div>
    );
  }

  return (
    <div className="character-editor">
      <header className="editor-header">
        <h1>Редактор персонажа Kinwoods</h1>
        <button 
          className="reset-button"
          onClick={resetCharacter}
          title="Сбросить настройки"
        >
          Сброс
        </button>
      </header>

      <div className="editor-container">
        {/* Область предпросмотра */}
        <div className="preview-area">
          <canvas 
            ref={canvasRef}
            width={315}
            height={315}
            aria-label="Предпросмотр персонажа"
          />
        </div>

        {/* Панель управления */}
        <div className="controls-panel">
          {/* Управление частями */}
          <PartControls
            part="ears"
            title="Уши"
            options={PARTS_STRUCTURE.ears}
            current={character.ears}
            onChange={handlePartChange}
            color={character.partColors.ears}
            onColorChange={handlePartColorChange}
          />

          <PartControls
            part="eyes"
            title="Глаза"
            options={PARTS_STRUCTURE.eyes.types}
            current={character.eyes.type}
            onChange={handlePartChange}
            showSubtypes={character.eyes.type === 'обычные'}
            subtypes={PARTS_STRUCTURE.eyes.subtypes?.обычные || []}
            currentSubtype={character.eyes.subtype}
            onSubtypeChange={(part, subtype) => handlePartChange(part, subtype, true)}
            color={character.partColors.eyes}
            onColorChange={handlePartColorChange}
          />

          {character.cheeks !== 'нет' && (
            <PartControls
              part="cheeks"
              title="Щёки"
              options={PARTS_STRUCTURE.cheeks}
              current={character.cheeks}
              onChange={handlePartChange}
              color={character.partColors.cheeks}
              onColorChange={handlePartColorChange}
            />
          )}

          <PartControls
            part="mane"
            title="Грива"
            options={PARTS_STRUCTURE.mane}
            current={character.mane}
            onChange={handlePartChange}
            color={character.partColors.mane}
            onColorChange={handlePartColorChange}
          />

          <PartControls
            part="body"
            title="Тело"
            options={PARTS_STRUCTURE.body}
            current={character.body}
            onChange={handlePartChange}
            color={character.partColors.body}
            onColorChange={handlePartColorChange}
          />

          <PartControls
            part="tail"
            title="Хвост"
            options={PARTS_STRUCTURE.tail}
            current={character.tail}
            onChange={handlePartChange}
            color={character.partColors.tail}
            onColorChange={handlePartColorChange}
          />

          {/* Управление цветами */}
          <ColorControls
            mainColor={character.colors.main}
            eyesWhiteColor={character.colors.eyesWhite}
            onMainColorChange={(color) => {
              handleColorChange('main', color);
              // Автоматически применяем к частям тела
              ['ears', 'cheeks', 'mane', 'body', 'tail'].forEach(part => {
                handlePartColorChange(part, color);
              });
            }}
            onEyesWhiteChange={(color) => handleColorChange('eyesWhite', color)}
          />

          {/* Кнопки экспорта */}
          <ExportButtons 
            character={character} 
            psdData={psdData} 
          />
        </div>
      </div>
    </div>
  );
}

export default App;
