import { DEFAULT_CHARACTER, PARTS_CONFIG } from './config';

export class RenderEngine {
  constructor() {
    this.layerCache = new Map();
    this.renderOrder = [
      'tail',
      'body',
      'mane',
      'head',
      'cheeks',
      'eyes',
      'ears'
    ];
  }

  /**
   * Инициализация рендерера с загруженными PSD-данными
   * @param {Object} psdData - Данные PSD
   */
  initialize(psdData) {
    this.psdData = psdData;
    this.buildLayerCache();
  }

  /**
   * Построение кэша слоев для быстрого доступа
   */
  buildLayerCache() {
    this.layerCache.clear();
    
    const processLayers = (layers, path = '') => {
      layers.forEach(layer => {
        const fullPath = path ? `${path}/${layer.name}` : layer.name;
        
        if (layer.children) {
          processLayers(layer.children, fullPath);
        } else {
          this.layerCache.set(fullPath, layer);
        }
      });
    };

    if (this.psdData) {
      Object.values(this.psdData).forEach(partGroup => {
        if (Array.isArray(partGroup)) {
          processLayers(partGroup);
        } else {
          Object.values(partGroup).forEach(processLayers);
        }
      });
    }
  }

  /**
   * Основной метод рендеринга персонажа
   * @param {HTMLCanvasElement} canvas - Целевой canvas
   * @param {Object} character - Текущий персонаж
   */
  render(canvas, character = DEFAULT_CHARACTER) {
    if (!canvas || !this.psdData) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Очистка canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Рендерим части в заданном порядке
    this.renderOrder.forEach(partId => {
      if (character[partId] !== 'нет' || partId === 'lashes') {
        this.renderPart(ctx, partId, character);
      }
    });
  }

  /**
   * Рендеринг конкретной части персонажа
   * @private
   */
  renderPart(ctx, partId, character) {
    // Специальная обработка ресниц
    if (partId === 'lashes') {
      if (character.eyes.type !== 'обычные') return;
      this.renderVariant(ctx, 'lashes', character.lashes);
      return;
    }

    // Специальная обработка глаз
    if (partId === 'eyes') {
      this.renderEyes(ctx, character);
      return;
    }

    // Стандартный рендеринг части
    const variant = this.getVariantName(partId, character);
    this.renderVariant(ctx, partId, variant);
  }

  /**
   * Рендеринг глаз с учетом подтипов
   * @private
   */
  renderEyes(ctx, character) {
    const eyeType = character.eyes.type;
    this.renderVariant(ctx, 'eyes', eyeType);

    // Рендерим подтип если есть
    if (eyeType === 'обычные' && character.eyes.subtype) {
      this.renderVariant(ctx, 'lashes', character.eyes.subtype);
    }
  }

  /**
   * Рендеринг конкретного варианта части
   * @private
   */
  renderVariant(ctx, partId, variantName) {
    const layers = this.getLayers(partId, variantName);
    if (!layers) return;

    layers.forEach(layer => {
      if (!layer.canvas || layer.hidden) return;

      ctx.save();
      ctx.translate(layer.left || 0, layer.top || 0);

      // Применяем blend mode если указан
      if (layer.blendMode) {
        ctx.globalCompositeOperation = this.convertBlendMode(layer.blendMode);
      }

      // Применяем opacity
      if (layer.opacity !== undefined && layer.opacity < 1) {
        ctx.globalAlpha = layer.opacity;
      }

      // Рендерим слой
      ctx.drawImage(layer.canvas, 0, 0);
      ctx.restore();
    });
  }

  /**
   * Получает слои для части и варианта
   * @private
   */
  getLayers(partId, variantName) {
    if (!this.psdData || !this.psdData[partId]) return null;

    if (partId === 'head') {
      return this.psdData[partId]; // Голова не имеет вариантов
    }

    return this.psdData[partId][variantName] || null;
  }

  /**
   * Получает имя варианта для части
   * @private
   */
  getVariantName(partId, character) {
    switch (partId) {
      case 'eyes': return character.eyes.type;
      case 'head': return 'default';
      default: return character[partId];
    }
  }

  /**
   * Конвертирует PSD blend mode в canvas
   * @private
   */
  convertBlendMode(psdBlendMode) {
    const modes = {
      'normal': 'source-over',
      'multiply': 'multiply',
      'screen': 'screen',
      'overlay': 'overlay',
      'darken': 'darken',
      'lighten': 'lighten',
      'color-dodge': 'color-dodge',
      'color-burn': 'color-burn',
      'hard-light': 'hard-light',
      'soft-light': 'soft-light',
      'difference': 'difference',
      'exclusion': 'exclusion'
    };
    return modes[psdBlendMode.toLowerCase()] || 'source-over';
  }

  /**
   * Применяет цвет к слою
   * @param {Object} layer - Слой PSD
   * @param {string} color - Цвет в HEX
   * @returns {Object} - Слой с примененным цветом
   */
  applyColorToLayer(layer, color) {
    if (!layer.canvas) return layer;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = layer.canvas.width;
    tempCanvas.height = layer.canvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    // 1. Рендерим оригинальный слой
    tempCtx.drawImage(layer.canvas, 0, 0);

    // 2. Применяем цвет через composite operation
    tempCtx.globalCompositeOperation = 'source-atop';
    tempCtx.fillStyle = color;
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    return {
      ...layer,
      canvas: tempCanvas
    };
  }
}
