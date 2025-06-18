import * as PSD from 'ag-psd';

/**
 * Загружает и обрабатывает PSD-файл с проверкой структуры
 * @param {string} url - Путь к PSD-файлу
 * @returns {Promise<Object>} - Нормализованные данные слоёв
 */
export async function loadPSD(url) {
  try {
    console.log(`[PSD Loader] Начинаю загрузку PSD из ${url}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    const psd = PSD.readPsd(buffer, {
      skipLayerImageData: false,
      useImageData: true,
      preserveLayerPositions: true,
      throwForMissingFeatures: true
    });

    if (!psd || !psd.children) {
      throw new Error('PSD файл не содержит слоев');
    }

    console.log('[PSD Loader] PSD загружен, начинаю обработку...');
    const processed = processPSD(psd);
    console.log('[PSD Loader] Обработка завершена', processed);
    
    return processed;
  } catch (error) {
    console.error('[PSD Loader] Ошибка загрузки:', error);
    throw new Error(`Не удалось загрузить PSD: ${error.message}`);
  }
}

/**
 * Основная функция обработки PSD-структуры
 * @param {PSD.Root} psd - Распарсенный PSD-файл
 * @returns {Object} - Нормализованная структура
 */
function processPSD(psd) {
  // Соответствие русских названий групп английским идентификаторам
  const GROUP_MAPPING = {
    'Уши': 'ears',
    'Глаза': 'eyes',
    'Щёки': 'cheeks',
    'Грива': 'mane',
    'Голова': 'head',
    'Тело': 'body',
    'Хвост': 'tail',
    'Ресницы': 'lashes'
  };

  const result = { _meta: { version: '1.0', processedAt: new Date().toISOString() } };

  // Обрабатываем каждую группу в PSD
  psd.children.forEach(group => {
    if (!group.name || !group.children) return;

    const groupId = GROUP_MAPPING[group.name];
    if (!groupId) {
      console.warn(`[PSD Processor] Неизвестная группа: ${group.name}`);
      return;
    }

    console.log(`[PSD Processor] Обрабатываю группу: ${group.name} (${groupId})`);

    // Специальная обработка головы (один вариант)
    if (groupId === 'head') {
      result[groupId] = processLayers(group.children);
      return;
    }

    // Обработка вариантов для всех остальных групп
    result[groupId] = {};
    group.children.forEach(variantGroup => {
      if (!variantGroup.name || !variantGroup.children) return;

      const variantName = normalizeVariantName(variantGroup.name);
      result[groupId][variantName] = processLayers(variantGroup.children);
    });
  });

  // Валидация обязательных групп
  validateStructure(result);
  return result;
}

/**
 * Нормализует имена вариантов (убирает лишние пробелы, приводит к lowercase)
 */
function normalizeVariantName(name) {
  return name.trim().toLowerCase();
}

/**
 * Обрабатывает массив слоев, извлекает необходимые данные
 */
function processLayers(layers) {
  return layers.map(layer => ({
    name: layer.name || 'unnamed',
    canvas: layer.canvas,
    left: layer.left || 0,
    top: layer.top || 0,
    opacity: typeof layer.opacity === 'number' ? layer.opacity : 1,
    blendMode: layer.blendMode || 'normal',
    clipping: layer.clipping || false,
    visible: !layer.hidden,
    tags: extractLayerTags(layer.name)
  }));
}

/**
 * Извлекает теги из имени слоя ([красить], [белок] и т.д.)
 */
function extractLayerTags(layerName) {
  if (!layerName) return [];
  
  const tags = [];
  const tagRegex = /\[(.*?)\]/g;
  let match;
  
  while ((match = tagRegex.exec(layerName)) !== null) {
    tags.push(match[1].toLowerCase());
  }
  
  return tags;
}

/**
 * Проверяет наличие обязательных групп и слоев
 */
function validateStructure(data) {
  const REQUIRED_GROUPS = ['ears', 'eyes', 'body'];
  const missingGroups = REQUIRED_GROUPS.filter(g => !data[g]);
  
  if (missingGroups.length > 0) {
    throw new Error(`Отсутствуют обязательные группы: ${missingGroups.join(', ')}`);
  }

  // Проверка что есть хотя бы один вариант для каждой группы
  for (const group in data) {
    if (group === '_meta' || group === 'head') continue;
    
    const variants = Object.keys(data[group]);
    if (variants.length === 0) {
      throw new Error(`Группа ${group} не содержит вариантов`);
    }
  }
}

/**
 * Вспомогательные функции для работы со слоями
 */

// Поиск слоя по пути (например: 'eyes/лисьи/радужка')
export function findLayer(data, path) {
  const parts = path.split('/');
  let current = data;

  for (const part of parts) {
    if (!current[part]) {
      console.warn(`Слой не найден: ${path} (на этапе ${part})`);
      return null;
    }
    current = current[part];
  }

  return current;
}

// Применение цвета к слою
export function applyColorToLayer(layer, color) {
  if (!layer?.canvas) return layer;

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = layer.canvas.width;
  tempCanvas.height = layer.canvas.height;
  const ctx = tempCanvas.getContext('2d');

  // 1. Рисуем оригинальный слой
  ctx.drawImage(layer.canvas, 0, 0);
  
  // 2. Применяем цвет
  ctx.globalCompositeOperation = 'source-atop';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

  return {
    ...layer,
    canvas: tempCanvas
  };
}

/**
 * Группировка слоев по тегам (для быстрого доступа)
 */
export function groupLayersByTag(layers) {
  return layers.reduce((acc, layer) => {
    layer.tags?.forEach(tag => {
      if (!acc[tag]) acc[tag] = [];
      acc[tag].push(layer);
    });
    return acc;
  }, {});
}
