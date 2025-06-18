import * as PSD from 'ag-psd';
import { PARTS_STRUCTURE } from './psdStructure';

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

export const exportPSD = (psdData, character) => {
  const newPsd = {
    width: 315,
    height: 315,
    children: []
  };

  // Соответствие между английскими именами и русскими названиями групп
  const partToGroupName = {
    'ears': 'Уши',
    'eyes': 'Глаза',
    'cheeks': 'Щёки',
    'head': 'Голова',
    'mane': 'Грудь Шея Грива',
    'body': 'Тело',
    'tail': 'Хвосты'
  };

  // Правильный порядок групп (снизу вверх)
  const groupOrder = [
    'Хвосты',
    'Тело',
    'Грудь Шея Грива',
    'Голова',
    'Щёки',
    'Глаза',
    'Уши'
  ];

  groupOrder.forEach(groupName => {
    const partName = Object.keys(partToGroupName).find(
      key => partToGroupName[key] === groupName
    );
    if (!partName) return;

    // Пропускаем щёки если они отключены
    if (partName === 'cheeks' && character.cheeks === 'нет') return;

    const partConfig = PARTS_STRUCTURE[partName];
    if (!partConfig) return;

    const groupLayers = [];

    // Для головы (single variant)
    if (partConfig.isSingleVariant) {
      partConfig.layers.forEach(layerPath => {
        const layer = findLayerInPsd(layerPath, psdData);
        if (layer) {
          groupLayers.push(createPsdLayer(layer, partName, character));
        }
      });
    }
    // Для частей с вариантами
    else {
      const variantName = getCharacterVariant(partName, character);
      const variantConfig = partConfig.variants[variantName];
      if (!variantConfig) return;

      variantConfig.layers.forEach(layerPath => {
        const layer = findLayerInPsd(layerPath, psdData);
        if (layer) {
          groupLayers.push(createPsdLayer(layer, partName, character));
        }
      });

      // Добавляем подтип для глаз
      if (partName === 'eyes' && variantName === 'обычные') {
        const subtype = character.eyes.subtype;
        const subtypeLayerPath = variantConfig.subtypes[subtype][0];
        const subtypeLayer = findLayerInPsd(subtypeLayerPath, psdData);
        if (subtypeLayer) {
          groupLayers.push(createPsdLayer(subtypeLayer, partName, character));
        }
      }
    }

    if (groupLayers.length > 0) {
      newPsd.children.unshift({
        name: groupName,
        children: groupLayers
      });
    }
  });

  // Экспорт PSD
  const psdBytes = PSD.writePsd(newPsd);
  const blob = new Blob([psdBytes], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `character_${Date.now()}.psd`;
  a.click();
  
  URL.revokeObjectURL(url);
};

function createPsdLayer(layer, partName, character) {
  // Применяем цвет к слою если нужно
  const coloredLayer = applyColorToLayer(layer, partName, character);
  
  return {
    name: layer.name,
    canvas: coloredLayer.canvas,
    left: layer.left,
    top: layer.top,
    opacity: layer.opacity !== undefined ? layer.opacity : 1,
    blendMode: layer.blendMode,
    clipping: layer.clipping,
    hidden: false
  };
}

function applyColorToLayer(layer, partName, character) {
  if (!layer.canvas) return layer;
  
  // Определяем цвет
  let color;
  if (layer.name.includes('[белок красить]')) {
    color = character.colors?.eyesWhite || '#ffffff';
  } 
  else if (layer.name.includes('[красить]')) {
    color = character.partColors?.[partName] || character.colors?.main || '#f1ece4';
  } 
  else {
    return layer; // Не меняем слои без покраски
  }
  
  // Применяем цвет
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
}
