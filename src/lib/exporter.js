import * as PSD from 'ag-psd';
import { renderCharacter } from './renderer';

export const exportPNG = (character, psdData) => {
  const canvas = document.createElement('canvas');
  canvas.width = 315;
  canvas.height = 315;
  
  renderCharacter(canvas, psdData, character);

  const link = document.createElement('a');
  link.download = `character_${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
};

export const exportPSD = (originalPsd, character) => {
  const groupOrder = [
    'Уши',
    'Глаза',
    'Щёки', 
    'Голова',
    'Грудь Шея Грива',
    'Тело',
    'Хвосты'
  ];

  const newPsd = {
    width: 315,
    height: 315,
    children: []
  };

  const partToGroupName = {
    'ears': 'Уши',
    'eyes': 'Глаза',
    'cheeks': 'Щёки',
    'head': 'Голова',
    'mane': 'Грудь Шея Грива',
    'body': 'Тело',
    'tail': 'Хвосты'
  };

  const applyColorToLayer = (layer, partName, character) => {
    if (!layer.canvas) return layer;
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = layer.canvas.width;
    tempCanvas.height = layer.canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    let color;
    if (layer.name.includes('[белок красить]')) {
      color = character.colors?.eyesWhite || '#ffffff';
    } else if (layer.name.includes('[красить]')) {
      color = character.partColors?.[partName] || character.colors?.main || '#f1ece4';
    } else {
      return layer;
    }
    
    tempCtx.drawImage(layer.canvas, 0, 0);
    tempCtx.globalCompositeOperation = 'source-atop';
    tempCtx.fillStyle = color;
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    return {
      ...layer,
      canvas: tempCanvas
    };
  };

  groupOrder.forEach(groupName => {
    const partName = Object.keys(partToGroupName).find(
      key => partToGroupName[key] === groupName
    );
    
    if (!partName) return;

    if (partName === 'cheeks' && character.cheeks === 'нет') return;

    let variantName;
    if (partName === 'head') {
      variantName = 'default';
    } else if (partName === 'eyes') {
      variantName = character.eyes.type;
    } else {
      variantName = character[partName];
    }

    let layers = [];
    if (partName === 'head') {
      layers = originalPsd[partName] || [];
    } else {
      layers = originalPsd[partName]?.[variantName] || [];
    }

    const groupLayers = [];
    
    if (partName === 'eyes') {
      // Base layers (excluding lash layers)
      const baseLayers = layers.filter(layer => 
        !['с ресницами', 'без ресниц'].includes(layer.name)
      );

      baseLayers.forEach(layer => {
        const coloredLayer = applyColorToLayer(layer, partName, character);
        groupLayers.push({
          name: layer.name,
          canvas: coloredLayer.canvas,
          left: layer.left,
          top: layer.top,
          opacity: layer.opacity,
          blendMode: layer.blendMode,
          clipping: layer.clipping,
          hidden: false
        });
      });

      // Add selected lash layer
      if (variantName === 'обычные') {
        const lashesLayers = originalPsd.eyes['обычные_lashes'] || [];
        const selectedLashesLayer = lashesLayers.find(
          layer => layer.name === character.eyes.subtype
        );

        if (selectedLashesLayer) {
          groupLayers.push({
            name: selectedLashesLayer.name,
            canvas: selectedLashesLayer.canvas,
            left: selectedLashesLayer.left,
            top: selectedLashesLayer.top,
            opacity: selectedLashesLayer.opacity,
            blendMode: selectedLashesLayer.blendMode,
            clipping: selectedLashesLayer.clipping,
            hidden: false
          });
        }
      }
    } else {
      // Normal processing for other parts
      layers.forEach(layer => {
        const coloredLayer = applyColorToLayer(layer, partName, character);
        groupLayers.push({
          name: layer.name,
          canvas: coloredLayer.canvas,
          left: layer.left,
          top: layer.top,
          opacity: layer.opacity,
          blendMode: layer.blendMode,
          clipping: layer.clipping,
          hidden: false
        });
      });
    }

    if (groupLayers.length > 0) {
      newPsd.children.unshift({
        name: groupName,
        children: groupLayers
      });
    }
  });

  const psdBytes = PSD.writePsd(newPsd);
  const blob = new Blob([psdBytes], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `character_${Date.now()}.psd`;
  a.click();
  
  URL.revokeObjectURL(url);
};
