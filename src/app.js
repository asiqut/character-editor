import { RenderEngine } from './render-engine.js';
import { ExportEngine } from './export-engine.js';
import config from './config.js';

class CharacterEditor {
  constructor() {
    this.state = {
      activeParts: {},
      colors: {},
      psdData: null
    };

    this.renderEngine = new RenderEngine(config);
    this.exportEngine = new ExportEngine(config);

    this.ui = {
      previewCanvas: document.getElementById('preview-canvas'),
      partsContainer: document.getElementById('parts-container'),
      colorPickers: {}
    };

    this.init();
  }

  async init() {
    await this.loadPSD();
    this.initDefaultState();
    this.render();
    this.initUI();
  }

  async loadPSD() {
    this.state.psdData = await this.renderEngine.loadPSD('assets/model.psd');
  }

  initDefaultState() {
    Object.keys(config.parts).forEach(partId => {
      const part = config.parts[partId];
      
      if (part.isSingleVariant) {
        this.state.activeParts[partId] = part.variant;
      } else {
        const firstVariant = Object.keys(part.variants)[0];
        this.state.activeParts[partId] = part.variants[firstVariant];
      }
    });

    Object.keys(config.colors).forEach(colorId => {
      this.state.colors[colorId] = config.colors[colorId].default;
    });
  }

  render() {
    this.renderEngine.render(
      this.ui.previewCanvas, 
      this.state.psdData, 
      this.state.activeParts, 
      this.state.colors
    );
  }

  initUI() {
    this.initPartsUI();
    this.initColorPickers();
    this.initExportButtons();
  }

  setPartVariant(partId, variantId) {
    this.state.activeParts[partId] = config.parts[partId].variants[variantId];
    this.render();
  }

  setColor(colorId, colorValue) {
    this.state.colors[colorId] = colorValue;
    
    if (colorId === 'main') {
      config.colors.main.affects.forEach(affectedPart => {
        this.state.colors[affectedPart] = colorValue;
      });
    }
    
    this.render();
  }

  async exportPNG() {
    return this.exportEngine.exportToPNG(
      this.ui.previewCanvas,
      config.canvasSettings.width,
      config.canvasSettings.height
    );
  }

  async exportPSD() {
    return this.exportEngine.exportToPSD(
      this.state.psdData,
      this.state.activeParts,
      this.state.colors,
      config.canvasSettings.width,
      config.canvasSettings.height
    );
  }

initPartsUI() {
  const partsContainer = this.ui.partsContainer;
  partsContainer.innerHTML = '';

  Object.entries(config.parts).forEach(([partId, part]) => {
    // Проверяем зависимости (например, ресницы только для обычных глаз)
    if (part.dependsOn) {
      const dependsOnPart = this.state.activeParts[part.dependsOn.part];
      if (!dependsOnPart || dependsOnPart !== part.dependsOn.variant) {
        return;
      }
    }

    // Пропускаем скрытые в UI элементы
    if (part.variants) {
      const firstVariant = Object.values(part.variants)[0];
      if (firstVariant.hideInUI) return;
    }

    // Создаем контейнер для части
    const partContainer = document.createElement('div');
    partContainer.className = 'part-container';

    // Добавляем заголовок
    const title = document.createElement('h3');
    title.textContent = part.title;
    partContainer.appendChild(title);

    // Добавляем варианты, если они есть
    if (part.variants && !part.isSingleVariant) {
      const variantsContainer = document.createElement('div');
      variantsContainer.className = 'variants-container';

      Object.entries(part.variants).forEach(([variantId, variant]) => {
        if (variant.hideInUI) return;

        const button = document.createElement('button');
        button.className = 'variant-button';
        if (this.state.activeParts[partId] === variant) {
          button.classList.add('active');
        }
        button.textContent = variant.label;
        button.addEventListener('click', () => {
          this.setPartVariant(partId, variantId);
          // Обновляем активные кнопки
          variantsContainer.querySelectorAll('.variant-button').forEach(btn => {
            btn.classList.remove('active');
          });
          button.classList.add('active');
        });
        variantsContainer.appendChild(button);
      });

      partContainer.appendChild(variantsContainer);
    }

    partsContainer.appendChild(partContainer);
  });
}

initColorPickers() {
  Object.entries(config.colors).forEach(([colorId, colorConfig]) => {
    // Для main цвета создаем отдельный пикер
    if (colorId === 'main') {
      this.createColorPicker(colorId, colorConfig, true);
    } else if (!colorConfig.layerMarker) { // Игнорируем специальные цвета вроде eyesWhite
      this.createColorPicker(colorId, colorConfig);
    }
  });
}

createColorPicker(colorId, colorConfig, isMain = false) {
  // Находим контейнер соответствующей части
  let container = null;
  
  if (isMain) {
    // Для основного цвета создаем отдельный контейнер вверху
    container = document.createElement('div');
    container.className = 'part-container';
    const title = document.createElement('h3');
    title.textContent = 'Основной цвет';
    container.appendChild(title);
    this.ui.partsContainer.prepend(container);
  } else {
    // Находим контейнер части по colorId
    const partId = colorId; // В нашем конфиге colorId совпадает с partId
    container = Array.from(document.querySelectorAll('.part-container'))
      .find(el => el.querySelector('h3')?.textContent === config.parts[partId]?.title);
    
    if (!container) return;
  }

  const colorContainer = document.createElement('div');
  colorContainer.className = 'color-picker-container';

  const label = document.createElement('span');
  label.textContent = isMain ? 'Основной цвет:' : 'Цвет:';
  colorContainer.appendChild(label);

  const colorInput = document.createElement('input');
  colorInput.type = 'color';
  colorInput.value = this.state.colors[colorId] || colorConfig.default;
  colorInput.addEventListener('input', (e) => {
    this.setColor(colorId, e.target.value);
  });

  const hexInput = document.createElement('input');
  hexInput.type = 'text';
  hexInput.value = this.state.colors[colorId] || colorConfig.default;
  hexInput.placeholder = 'HEX цвет';
  hexInput.addEventListener('change', (e) => {
    if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
      this.setColor(colorId, e.target.value);
      colorInput.value = e.target.value;
    }
  });

  colorContainer.appendChild(colorInput);
  colorContainer.appendChild(hexInput);
  container.appendChild(colorContainer);

  // Сохраняем ссылку на пикер
  this.ui.colorPickers[colorId] = { colorInput, hexInput };
}

initExportButtons() {
  document.getElementById('export-png').addEventListener('click', async () => {
    const blob = await this.exportPNG();
    this.downloadBlob(blob, 'character.png');
  });

  document.getElementById('export-psd').addEventListener('click', async () => {
    const blob = await this.exportPSD();
    this.downloadBlob(blob, 'character.psd');
  });
}

downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
}

document.addEventListener('DOMContentLoaded', () => {
  new CharacterEditor();
});
