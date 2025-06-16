import React, { useState, useEffect } from 'react';
import { loadPSD } from './lib/psdLoader';
import { DEFAULT_CHARACTER, PARTS_STRUCTURE } from './lib/defaultConfig';
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
  const [layerOpacities, setLayerOpacities] = useState({});
  const handleOpacityChange = (part, layerName, value) => {
    setCharacter(prev => ({
      ...prev,
      layerOpacities: {
        ...prev.layerOpacities,
        [part]: {
          ...prev.layerOpacities?.[part],
          [layerName]: value
        }
      }
    }));
  };

  
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

  const handlePartChange = (part, value, isSubtype = false) => {
    setCharacter(prev => {
      const newChar = {...prev};
      
      if (part === 'eyes') {
        if (isSubtype) {
          newChar.eyes = {
            ...prev.eyes,
            subtype: value
          };
        } else {
          newChar.eyes = {
            type: value,
            subtype: value === 'обычные' ? 'с ресницами' : null
          };
        }
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

    function OpacityControl({ part, layerName, opacity, onChange }) {
    return (
      <div className="opacity-control">
        <label>{layerName}</label>
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={(opacity * 100) || 100}
          onChange={(e) => onChange(part, layerName, e.target.value / 100)}
        />
        <span>{Math.round((opacity || 1) * 100)}%</span>
      </div>
    );
  }

  if (loading) return <div>Загрузка...</div>;

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;
  if (!psdData) return <div>Данные не загружены</div>;

  return (
    <div className="character-editor">
      <h1>Редактор персонажа</h1>
      
      <div className="editor-container">
        <CharacterPreview psdData={psdData} character={character} />
        
        <div className="controls">
          <PartSelector
            title="Уши"
            part="ears"
            options={PARTS_STRUCTURE.ears}
            current={character.ears}
            onChange={(part, value) => handlePartChange(part, value)}
          />
          <ColorPicker
            title="Цвет ушей"
            color={character.partColors.ears}
            onChange={(color) => handlePartColorChange('ears', color)}
          />
      <div className="opacity-controls">
          <h4>Прозрачность слоёв ушей:</h4>
              <OpacityControl
            part="ears"
            layerName="свет"
            opacity={character.layerOpacities?.ears?.["свет"]}
            onChange={handleOpacityChange}
            />
          <OpacityControl
            part="ears"
            layerName="тень"
            opacity={character.layerOpacities?.ears?.["тень"]}
            onChange={handleOpacityChange}
            />
      </div>

          <PartSelector
            title="Щёки"
            part="cheeks"
            options={PARTS_STRUCTURE.cheeks}
            current={character.cheeks}
            onChange={(part, value) => handlePartChange(part, value)}
          />
          <ColorPicker
            title="Цвет щёк"
            color={character.partColors.cheeks}
            onChange={(color) => handlePartColorChange('cheeks', color)}
          />
      <div className="opacity-controls">
          <h4>Прозрачность слоёв щёк:</h4>
              <OpacityControl
            part="cheeks"
            layerName="свет"
            opacity={character.layerOpacities?.cheeks?.["свет"]}
            onChange={handleOpacityChange}
            />
          <OpacityControl
            part="cheeks"
            layerName="тень"
            opacity={character.layerOpacities?.cheeks?.["тень"]}
            onChange={handleOpacityChange}
            />
      </div>
          
          <PartSelector
            title="Глаза"
            part="eyes"
            options={PARTS_STRUCTURE.eyes.types}
            current={character.eyes.type}
            onChange={handlePartChange}
            showSubtypes={character.eyes.type === 'обычные'}
            subtypes={PARTS_STRUCTURE.eyes.subtypes['обычные']}
            currentSubtype={character.eyes.subtype}
            onSubtypeChange={handleSubtypeChange}
          />
          <ColorPicker
            title="Цвет глаз"
            color={character.partColors.eyes}
            onChange={(color) => handlePartColorChange('eyes', color)}
          />
      <div className="opacity-controls">
          <h4>Прозрачность слоёв глаз:</h4>
              <OpacityControl
            part="eyes"
            layerName="свет"
            opacity={character.layerOpacities?.eyes?.["свет"]}
            onChange={handleOpacityChange}
            />
          <OpacityControl
            part="eyes"
            layerName="тень"
            opacity={character.layerOpacities?.eyes?.["тень"]}
            onChange={handleOpacityChange}
            />
      </div>
          
          <PartSelector
            title="Грива"
            part="mane"
            options={PARTS_STRUCTURE.mane}
            current={character.mane}
            onChange={(part, value) => handlePartChange(part, value)}
          />
          <ColorPicker
            title="Цвет гривы"
            color={character.partColors.mane}
            onChange={(color) => handlePartColorChange('mane', color)}
          />
      <div className="opacity-controls">
          <h4>Прозрачность слоёв гривы:</h4>
              <OpacityControl
            part="mane"
            layerName="свет"
            opacity={character.layerOpacities?.mane?.["свет"]}
            onChange={handleOpacityChange}
            />
          <OpacityControl
            part="mane"
            layerName="тень"
            opacity={character.layerOpacities?.mane?.["тень"]}
            onChange={handleOpacityChange}
            />
      </div>
              
          <PartSelector
            title="Тело"
            part="body"
            options={PARTS_STRUCTURE.body}
            current={character.body}
            onChange={(part, value) => handlePartChange(part, value)}
          />
          <ColorPicker
            title="Цвет тела"
            color={character.partColors.body}
            onChange={(color) => handlePartColorChange('body', color)}
          />
      <div className="opacity-controls">
          <h4>Прозрачность слоёв тела:</h4>
              <OpacityControl
            part="body"
            layerName="свет"
            opacity={character.layerOpacities?.body?.["свет"]}
            onChange={handleOpacityChange}
            />
          <OpacityControl
            part="body"
            layerName="тень"
            opacity={character.layerOpacities?.body?.["тень"]}
            onChange={handleOpacityChange}
            />
      </div>
          
          <PartSelector
            title="Хвост"
            part="tail"
            options={PARTS_STRUCTURE.tail}
            current={character.tail}
            onChange={(part, value) => handlePartChange(part, value)}
          />
          <ColorPicker
            title="Цвет хвоста"
            color={character.partColors.tail}
            onChange={(color) => handlePartColorChange('tail', color)}
          />
      <div className="opacity-controls">
          <h4>Прозрачность слоёв хвоста:</h4>
              <OpacityControl
            part="tail"
            layerName="свет"
            opacity={character.layerOpacities?.tail?.["свет"]}
            onChange={handleOpacityChange}
            />
          <OpacityControl
            part="tail"
            layerName="тень"
            opacity={character.layerOpacities?.tail?.["тень"]}
            onChange={handleOpacityChange}
            />
      </div>
          
          <ColorPicker
            title="Основной цвет (все части)"
            color={character.colors.main}
            onChange={(color) => {
              handleColorChange('main', color);
              setCharacter(prev => ({
                ...prev,
                partColors: {
                  ears: color,
                  cheeks: color,
                  mane: color,
                  body: color,
                  tail: color,
                  head: color
                }
              }));
            }}
          />
          
          <ColorPicker
            title="Цвет белков глаз"
            color={character.colors.eyesWhite}
            onChange={(color) => handleColorChange('eyesWhite', color)}
          />
          
          <ExportButtons character={character} psdData={psdData} />
        </div>
      </div>
    </div>
  );
}

export default App;
