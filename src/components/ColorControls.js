import React, { useState, useEffect, useRef } from 'react';
import { loadPSD, processPSD } from '../lib/psdUtils';
import { renderCharacter } from '../lib/renderUtils';
import { DEFAULT_CHARACTER, PARTS_CONFIG } from '../lib/config';
import PartControls from './PartControls';
import ColorControls from './ColorControls';
import ExportButtons from './ExportButtons';
import '../styles/main.css';

const CharacterEditor = () => {
  const [psdData, setPsdData] = useState(null);
  const [character, setCharacter] = useState(DEFAULT_CHARACTER);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);

  // Загрузка PSD при монтировании
  useEffect(() => {
    const loadCharacterData = async () => {
      try {
        const rawPsd = await loadPSD(`${window.publicPath || ''}/assets/model_kinwoods.psd`);
        const processedPsd = processPSD(rawPsd);
        setPsdData(processedPsd);
      } catch (err) {
        console.error('PSD loading error:', err);
        setError('Не удалось загрузить файл персонажа');
      } finally {
        setLoading(false);
      }
    };

    loadCharacterData();
  }, []);

  // Рендеринг персонажа при изменениях
  useEffect(() => {
    if (psdData && canvasRef.current) {
      renderCharacter(canvasRef.current, psdData, character, PARTS_CONFIG);
    }
  }, [psdData, character]);

  const handlePartChange = (part, value, isSubtype = false) => {
    setCharacter(prev => {
      // Особый случай для глаз (подтипы)
      if (part === 'eyes') {
        if (isSubtype) {
          return {
            ...prev,
            eyes: {
              ...prev.eyes,
              subtype: value
            }
          };
        }
        return {
          ...prev,
          eyes: {
            type: value,
            subtype: value === 'обычные' ? 'с ресницами' : null
          }
        };
      }
      
      // Общий случай для других частей
      return {
        ...prev,
        [part]: value
      };
    });
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

  if (loading) {
    return <div className="loading">Загрузка персонажа...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!psdData) {
    return <div className="error">Данные персонажа не загружены</div>;
  }

  return (
    <div className="character-editor">
      <h1>Редактор персонажа Kinwoods</h1>
      
      <div className="editor-container">
        <div className="preview-area">
          <canvas 
            ref={canvasRef}
            width={315}
            height={315}
            className="character-canvas"
          />
        </div>
        
        <div className="controls">
          {/* Управление частями персонажа */}
          <PartControls
            config={PARTS_CONFIG}
            character={character}
            onChange={handlePartChange}
          />
          
          {/* Управление цветами */}
          <ColorControls
            character={character}
            onMainColorChange={(color) => {
              handleColorChange('main', color);
              // Автоматическое применение основного цвета ко всем частям
              ['ears', 'cheeks', 'mane', 'body', 'tail', 'head'].forEach(part => {
                handlePartColorChange(part, color);
              });
            }}
            onPartColorChange={handlePartColorChange}
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
};

export default CharacterEditor;
