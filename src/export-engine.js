import * as PSD from 'ag-psd';
import { CHARACTER_CONFIG } from './config.js';

export class ExportManager {
  // Экспорт в PNG
  // @param {Object} characterData - Текущее состояние персонажа
  // @param {Object} psdData - Загруженные данные PSD
  static exportPNG(characterData, psdData) {
    const canvas = document.createElement('canvas');
    canvas.width = CHARACTER_CONFIG.canvas.width;
    canvas.height = CHARACTER_CONFIG.canvas.height;
    const ctx = canvas.getContext('2d');

    // 1. Очистка холста
    ctx.fillStyle = CHARACTER_CONFIG.canvas.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Отрисовка всех видимых частей в правильном порядке
    CHARACTER_CONFIG.renderOrder.forEach(part => {
      if (this.shouldRenderPart(part, characterData)) {
        this.renderPartToCanvas(ctx, part, characterData, psdData);
      }
    });

    // 3. Создание PNG и скачивание
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `character_${Date.now()}.png`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }, 'image/png', 0.95);
  }

  // Экспорт в PSD
  // @param {Object} characterData - Текущее состояние персонажа
  // @param {Object} psdData - Загруженные данные PSD
  static exportPSD(characterData, psdData) {
    const newPsd = {
      width: CHARACTER_CONFIG.canvas.width,
      height: CHARACTER_CONFIG.canvas.height,
      children: []
    };

    // 1. Сборка видимых слоев с сохранением структуры
    CHARACTER_CONFIG.renderOrder.forEach(part => {
      if (characterData[part] === 'off') return;

      const partConfig = CHARACTER_CONFIG.parts[part];
      const variant = characterData[part];
      const layers = psdData[part]?.[variant] || [];

      const group = {
        name: partConfig.title,
        children: layers
          .filter(layer => !layer.hidden)
          .map(layer => this.processLayer(layer, part, characterData))
      };

      if (group.children.length > 0) {
        newPsd.children.push(group);
      }
    });

    // 2. Генерация и скачивание PSD
    const psdBytes = PSD.writePsd(newPsd);
    const blob = new Blob([psdBytes], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `character_${Date.now()}.psd`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  // Обработка слоя (покраска и применение эффектов)
  static processLayer(layer, part, characterData) {
    const newLayer = { ...layer };

    // Окрашивание слоев с маркерами
    if (layer.name.includes('[красить]')) {
      newLayer.canvas = this.applyColor(
        layer.canvas, 
        characterData.partColors[part] || CHARACTER_CONFIG.colors.main.default
      );
    } else if (layer.name.includes('[белок красить]')) {
      newLayer.canvas = this.applyColor(
        layer.canvas,
        characterData.colors.eyesWhite
      );
    }

    return newLayer;
  }

  // Применение цвета к слою
  static applyColor(sourceCanvas, color) {
    const canvas = document.createElement('canvas');
    canvas.width = sourceCanvas.width;
    canvas.height = sourceCanvas.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(sourceCanvas, 0, 0);
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    return canvas;
  }

  // Проверка, нужно ли рендерить часть
  static shouldRenderPart(part, characterData) {
    const config = CHARACTER_CONFIG.parts[part];
    if (!config?.enabled) return false;
    if (characterData[part] === 'off') return false;
    
    // Проверка зависимостей (например, ресницы только для обычных глаз)
    if (config.dependsOn) {
      return characterData[config.dependsOn.part] === config.dependsOn.variant;
    }
    
    return true;
  }

  // Отрисовка части на canvas
  static renderPartToCanvas(ctx, part, characterData, psdData) {
    const variant = characterData[part];
    const layers = psdData[part]?.[variant] || [];

    layers.forEach(layer => {
      if (layer.hidden) return;

      ctx.save();
      ctx.translate(layer.left || 0, layer.top || 0);

      // Обработка режимов наложения
      if (layer.blendMode) {
        ctx.globalCompositeOperation = this.convertBlendMode(layer.blendMode);
      }

      // Отрисовка с учетом покраски
      if (layer.name.includes('[красить]')) {
        const color = characterData.partColors[part] || 
                     CHARACTER_CONFIG.colors.main.default;
        this.drawColoredLayer(ctx, layer, color);
      } 
      else if (layer.name.includes('[белок красить]')) {
        this.drawColoredLayer(ctx, layer, characterData.colors.eyesWhite);
      }
      else {
        ctx.drawImage(layer.canvas, 0, 0);
      }

      ctx.restore();
    });
  }

  // Отрисовка цветного слоя
  static drawColoredLayer(ctx, layer, color) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = layer.canvas.width;
    tempCanvas.height = layer.canvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    tempCtx.drawImage(layer.canvas, 0, 0);
    tempCtx.globalCompositeOperation = 'source-atop';
    tempCtx.fillStyle = color;
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    ctx.drawImage(tempCanvas, 0, 0);
  }

  // Конвертация режимов наложения PSD -> Canvas
  static convertBlendMode(psdMode) {
    const modes = {
      'normal': 'source-over',
      'multiply': 'multiply',
      'screen': 'screen',
      'overlay': 'overlay'
    };
    return modes[psdMode.toLowerCase()] || 'source-over';
  }
}
