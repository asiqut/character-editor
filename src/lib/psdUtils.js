import * as PSD from 'ag-psd';

/**
 * Загружает и обрабатывает PSD-файл
 * @param {string} url - Путь к PSD-файлу
 * @returns {Promise<Object>} - Обработанные данные слоёв
 */
export async function loadPSD(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const buffer = await response.arrayBuffer();
    const psd = PSD.readPsd(buffer, {
      skipLayerImageData: false,
      parseLayerBlendingModes: true,
      preserveLayerPositions: true
    });

    if (!psd || !psd.children) throw new Error('Invalid PSD structure');
    return processPSD(psd);

  } catch (error) {
    console.error('PSD loading failed:', error);
    throw new Error('Не удалось загрузить PSD файл');
  }
}

/**
 * Обрабатывает структуру PSD в удобный для работы формат
 * @param {Object} psd - Данные PSD
 * @returns {Object} - Структурированные данные слоёв
 */
function processPSD(psd) {
  const parts = {};
  const groupMap = {
    'Уши': 'ears',
    'Глаза': 'eyes',
    'Щёки': 'cheeks',
    'Грудь/шея/грива': 'mane',
    'Голова': 'head',
    'Тело': 'body',
    'Хвосты': 'tail'
  };

  psd.children.forEach(group => {
    const partId = groupMap[group.name];
    if (!partId || !group.children) return;

    parts[partId] = {};

    group.children.forEach(variantGroup => {
      const variantName = variantGroup.name;
      if (!variantName || !variantGroup.children) return;

      // Специальная обработка головы (единственный вариант)
      if (partId === 'head') {
        parts[partId] = variantGroup.children.map(processLayer);
        return;
      }

      parts[partId][variantName] = variantGroup.children.map(processLayer);
    });
  });

  // Добавляем ресницы как отдельные слои
  if (parts.eyes?.обычные) {
    parts.lashes = {
      'с ресницами': [createLayerFromName('Глаза/обычные/с ресницами')],
      'без ресниц': [createLayerFromName('Глаза/обычные/без ресниц')]
    };
  }

  return parts;
}

/**
 * Обрабатывает слой PSD
 * @param {Object} layer - Слой PSD
 * @returns {Object} - Нормализованный слой
 */
function processLayer(layer) {
  return {
    name: layer.name,
    canvas: layer.canvas,
    left: layer.left || 0,
    top: layer.top || 0,
    blendMode: layer.blendMode,
    opacity: layer.opacity ?? 1,
    visible: layer.hidden !== true
  };
}

/**
 * Создаёт виртуальный слой по имени
 * (Для ресниц, которые могут быть в общей структуре)
 */
function createLayerFromName(layerName) {
  return {
    name: layerName,
    canvas: null, // Будет заполнено при рендеринге
    left: 0,
    top: 0,
    blendMode: 'normal',
    opacity: 1,
    visible: true
  };
}

/**
 * Находит слой в структуре PSD
 * @param {Object} psdData - Данные PSD
 * @param {string} path - Путь к слою (например: 'Глаза/обычные/блики')
 * @returns {Object|null} - Найденный слой
 */
export function findLayer(psdData, path) {
  const parts = path.split('/');
  let current = psdData;

  for (const part of parts) {
    if (!current[part]) return null;
    current = current[part];
  }

  return current;
}
