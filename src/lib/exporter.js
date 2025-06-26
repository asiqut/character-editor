import * as PSD from 'ag-psd';
import { PSD_CONFIG } from './defaultConfig';
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
  const groupOrder = Object.keys(PSD_CONFIG.groups);
  const newPsd = {
    width: 315,
    height: 315,
    children: []
  };

  const partToGroupName = {};
  Object.entries(PSD_CONFIG.groups).forEach(([name, config]) => {
    partToGroupName[config.code] = name;
  });

  const applyColorToLayer = (layer, partName, character) => {
    if (!layer.canvas) return layer;

    let color;
    if (layer.name.includes(PSD_CONFIG.colorTargets.eyesWhite.split('/').pop())) {
      color = character.colors.eyesWhite;
    } else if (layer.name.includes('[красить]')) {
      color = character.partColors?.[partName] || character.colors?.main || '#f1ece4';
    } else {
      return layer;
    }

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = layer.canvas.width;
    tempCanvas.height = layer.canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
  
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

    const groupLayers = layers.map(layer => {
      const coloredLayer = applyColorToLayer(layer, partName, character);
  
      // Добавляем поддержку clipping mask
      const shouldClip = PSD_CONFIG.clippedLayers.includes(layer.name);
      const clipLayer = shouldClip ? layers.find(l => l.name.includes('[красить]')) : null;
  
      return {
        name: layer.name,
        canvas: coloredLayer.canvas,
        left: layer.left,
        top: layer.top,
        opacity: layer.opacity,
        blendMode: layer.blendMode,
        clipping: shouldClip && clipLayer ? true : false, // Устанавливаем флаг clipping
        hidden: false
      };
    });

    if (partName === 'eyes' && variantName === 'обычные') {
      const subtypeLayer = layers.find(l => l.name === character.eyes.subtype);
      if (subtypeLayer) {
        groupLayers.push({
          name: subtypeLayer.name,
          canvas: subtypeLayer.canvas,
          left: subtypeLayer.left,
          top: subtypeLayer.top,
          opacity: subtypeLayer.opacity,
          blendMode: subtypeLayer.blendMode,
          clipping: subtypeLayer.clipping,
          hidden: false
        });
      }
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
