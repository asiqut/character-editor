import React, { useState, useEffect, useRef } from 'react';
import { loadPSD } from './lib/psdUtils';
import { renderCharacter } from './lib/renderUtils';
import { DEFAULT_CHARACTER, PARTS_CONFIG, RENDER_ORDER } from './lib/config';
import CharacterEditor from './components/CharacterEditor';
import './styles/main.css';

const App = () => {
  const [appState, setAppState] = useState({
    psdData: null,
    character: DEFAULT_CHARACTER,
    loading: true,
    error: null
  });

  const canvasRef = useRef(null);

  // Загрузка PSD при монтировании
  useEffect(() => {
    const initializeEditor = async () => {
      try {
        const psd = await loadPSD(`${window.publicPath || ''}/assets/model_kinwoods.psd`);
        
        setAppState(prev => ({
          ...prev,
          psdData: psd,
          loading: false
        }));
      } catch (err) {
        console.error('PSD initialization error:', err);
        setAppState(prev => ({
          ...prev,
          error: 'Failed to load character data',
          loading: false
        }));
      }
    };

    initializeEditor();
  }, []);

  // Рендеринг при изменениях
  useEffect(() => {
    if (appState.psdData && canvasRef.current) {
      renderCharacter(
        canvasRef.current,
        appState.psdData,
        appState.character,
        RENDER_ORDER
      );
    }
  }, [appState.psdData, appState.character]);

  // Обработчики изменений
  const handlePartChange = (part, value, isSubtype = false) => {
    setAppState(prev => {
      // Особый случай для глаз
      if (part === 'eyes') {
        return {
          ...prev,
          character: {
            ...prev.character,
            eyes: isSubtype 
              ? { ...prev.character.eyes, subtype: value }
              : { type: value, subtype: value === 'обычные' ? 'с ресницами' : null }
          }
        };
      }

      // Общий случай для других частей
      return {
        ...prev,
        character: {
          ...prev.character,
          [part]: value
        }
      };
    });
  };

  const handleColorChange = (type, color) => {
    setAppState(prev => ({
      ...prev,
      character: {
        ...prev.character,
        colors: {
          ...prev.character.colors,
          [type]: color
        }
      }
    }));
  };

  const handlePartColorChange = (part, color) => {
    setAppState(prev => ({
      ...prev,
      character: {
        ...prev.character,
        partColors: {
          ...prev.character.partColors,
          [part]: color
        }
      }
    }));
  };

  // Состояния загрузки и ошибок
  if (appState.loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading character editor...</p>
      </div>
    );
  }

  if (appState.error) {
    return (
      <div className="error-screen">
        <h2>Error</h2>
        <p>{appState.error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!appState.psdData) {
    return (
      <div className="error-screen">
        <h2>Data Not Loaded</h2>
        <p>Character data failed to initialize</p>
      </div>
    );
  }

  return (
    <div className="character-editor">
      <header>
        <h1>Kinwoods Character Editor</h1>
        <p className="subtitle">Customize your character's appearance</p>
      </header>

      <CharacterEditor
        innerRef={canvasRef}
        config={PARTS_CONFIG}
        character={appState.character}
        onPartChange={handlePartChange}
        onColorChange={handleColorChange}
        onPartColorChange={handlePartColorChange}
      />
    </div>
  );
};

export default App;
