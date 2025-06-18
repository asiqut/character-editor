// render-engine.js - Движок отрисовки персонажа
import agPsd from 'ag-psd'; // Библиотека для работы с PSD

export class RenderEngine {
  constructor(config) {
    this.config = config;
    this.psd = null;
    this.layerCache = new Map(); // Кэш для быстрого доступа к слоям
  }

  async loadPSD(filePath) {
    try {
      // Загрузка PSD файла
      const response = await fetch(filePath);
      const arrayBuffer = await response.arrayBuffer();
      
      // Парсинг PSD
      this.psd = agPsd.readPsd(arrayBuffer);
      
      // Строим кэш слоёв для быстрого доступа
      this.buildLayerCache(this.psd.children);
      
      return this.psd;
    } catch (error) {
      console.error('Ошибка загрузки PSD:', error);
      throw error;
    }
  }

  // Рекурсивно строим кэш слоёв по именам
  buildLayerCache(layers, path = '') {
    layers.forEach(layer => {
      const fullPath = path ? `${path}/${layer.name}` : layer.name;
      
      if (layer.children) {
        this.buildLayerCache(layer.children, fullPath);
      } else {
        this.layerCache.set(fullPath, layer);
      }
    });
  }

  // Основной метод рендеринга
  render(canvas, psdData, activeParts, colors) {
    if (!psdData) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Рендерим части в порядке, указанном в конфиге
    this.config.defaultRenderOrder.forEach(partId => {
      if (activeParts[partId]) {
        this.renderPart(ctx, activeParts[partId], colors);
      }
    });
  }

  // Рендерим конкретную часть персонажа
  renderPart(ctx, part, colors) {
    part.layers.forEach(layerPath => {
      const layer = this.layerCache.get(layerPath);
      if (!layer) return;

      // Создаем временный canvas для слоя
      const layerCanvas = document.createElement('canvas');
      layerCanvas.width = layer.width;
      layerCanvas.height = layer.height;
      const layerCtx = layerCanvas.getContext('2d');

      // Отрисовываем слой
      this.drawLayer(layerCtx, layer, part, colors);

      // Копируем на основной canvas
      ctx.drawImage(
        layerCanvas,
        0, 0, layer.width, layer.height,
        0, 0, ctx.canvas.width, ctx.canvas.height
      );
    });
  }

  // Отрисовка отдельного слоя с учетом цветов и эффектов
  drawLayer(ctx, layer, part, colors) {
    // Если слой требует покраски
    const colorable = part.colorable;
    let shouldColor = false;
    let colorKey = null;

    if (typeof colorable === 'string' && layer.name.includes(colorable)) {
      shouldColor = true;
      colorKey = colorable === '[красить]' ? part.colorable : 'eyesWhite';
    } else if (typeof colorable === 'object') {
      for (const [marker, key] of Object.entries(colorable)) {
        if (layer.name.includes(marker)) {
          shouldColor = true;
          colorKey = key;
          break;
        }
      }
    }

    // Применяем цвет если нужно
    if (shouldColor && colorKey && colors[colorKey]) {
      this.applyColorToLayer(ctx, layer, colors[colorKey]);
    } else {
      // Отрисовываем как есть
      this.drawLayerImage(ctx, layer);
    }
  }

  // Применение цвета к слою
  applyColorToLayer(ctx, layer, color) {
    // Создаем временный canvas для цветовой маски
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = layer.width;
    tempCanvas.height = layer.height;
    const tempCtx = tempCanvas.getContext('2d');

    // Отрисовываем оригинальный слой
    this.drawLayerImage(tempCtx, layer);

    // Применяем цвет
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, layer.width, layer.height);
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(tempCanvas, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
  }

  // Базовая отрисовка изображения слоя
drawLayerImage(ctx, layer) {
  if (!layer.imageData) return;
  
  try {
    const imageData = new ImageData(
      new Uint8ClampedArray(layer.imageData),
      layer.width,
      layer.height
    );
    ctx.putImageData(imageData, 0, 0);
  } catch (e) {
    console.error('Error drawing layer:', layer.name, e);
  }
}
  
}
