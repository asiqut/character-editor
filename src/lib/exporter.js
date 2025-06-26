import * as PSD from 'ag-psd';
import { PSD_CONFIG } from './defaultConfig';
import { renderCharacter } from './renderer';

// Экспортирует текущего персонажа в PNG файл
// Принимает:
// - character: текущие настройки персонажа
// - psdData: структурированные данные PSD
// Не возвращает значение, создает файл для скачивания
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

// Экспортирует текущего персонажа в PSD файл с сохранением структуры
// Принимает:
// - originalPsd: исходные данные PSD
// - character: текущие настройки персонажа
// Не возвращает значение, создает файл для скачивания
export const exportPSD = (originalPsd, character) => {
  const groupOrder = Object.keys(PSD_CONFIG.groups);
  const newPsd = {
    width: 315,
    height: 315,
    children: []
  };

  // Создаем маппинг кодов частей на имена групп
  const partToGroupName = {};
  Object.entries(PSD_CONFIG.groups).forEach(([name, config]) => {
    partToGroupName[config.code] = name;
  });

  // Применяет выбранный цвет к слоям с маркерами [красить]
  // Параметры:
  // - layer: слой PSD для обработки
  // - partName: код части (ears, eyes и т.д.)
  // - character: текущий персонаж
  // Возвращает модифицированный слой
  const applyColorToLayer = (layer, partName, character) => {
    if (!layer.canvas) return layer;
  
    let color;
    const colorTarget = PSD_CONFIG.colorTargets[partName];
    
    // Специальная обработка белков глаз
    if (partName === 'eyes' && layer.name.includes('[белок красить]')) {
      color = character.colors.eyesWhite;
    } 
    // Обычные слои для покраски
    else if (layer.name.includes('[красить]')) {
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

  // Обрабатываем каждую группу в заданном порядке
  groupOrder.forEach(groupName => {
    const partName = Object.keys(partToGroupName).find(
      key => partToGroupName[key] === groupName
    );
    
    if (!partName) return;
    // Пропускаем щеки если выбран вариант "нет"
    if (partName === 'cheeks' && character.cheeks === 'нет') return;

    // Определяем текущий вариант для части
    let variantName;
    if (partName === 'head') {
      variantName = 'default'; // Голова без вариантов
    } else if (partName === 'eyes') {
      variantName = character.eyes.type; // Особый случай для глаз
    } else {
      variantName = character[partName]; // Текущий вариант части
    }

    // Получаем слои для текущего варианта
    let layers = [];
    if (partName === 'head') {
      layers = originalPsd[partName] || []; // Голова - один вариант
    } else {
      layers = originalPsd[partName]?.[variantName] || []; // Варианты части
    }

    // Обрабатываем каждый слой группы
    const groupLayers = layers.map(layer => {
      // Применяем цвет если нужно
      const coloredLayer = applyColorToLayer(layer, partName, character);
  
      // Проверяем нужно ли применять обтравочную маску
      const shouldClip = PSD_CONFIG.clippedLayers.includes(layer.name);
      const clipLayer = shouldClip ? layers.find(l => l.name.includes('[красить]')) : null;
  
      // Формируем итоговый слой PSD
      return {
        name: layer.name,
        canvas: coloredLayer.canvas,
        left: layer.left,
        top: layer.top,
        opacity: layer.opacity,
        blendMode: layer.blendMode,
        clipping: shouldClip && clipLayer ? true : false, // Флаг обтравочной маски
        hidden: false
      };
    });

    // Особый случай: добавляем подтип глаз (ресницы)
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

    // Добавляем группу в PSD (unshift чтобы сохранить порядок как в PSD)
    if (groupLayers.length > 0) {
      newPsd.children.unshift({
        name: groupName,
        children: groupLayers
      });
    }
  });

  // Конвертируем структуру в бинарный PSD
  const psdBytes = PSD.writePsd(newPsd);
  // Создаем Blob для скачивания
  const blob = new Blob([psdBytes], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  
  // Создаем ссылку для скачивания
  const a = document.createElement('a');
  a.href = url;
  a.download = `character_${Date.now()}.psd`;
  a.click();
  
  // Освобождаем память
  URL.revokeObjectURL(url);
};
