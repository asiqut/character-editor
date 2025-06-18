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

document.addEventListener('DOMContentLoaded', () => {
  new CharacterEditor();

  initPartsUI() {
  Object.keys(this.config.parts).forEach(partId => {
    const part = this.config.parts[partId];
    if (part.hideInUI) return;

    // Проверяем зависимости (например, ресницы только для обычных глаз)
    if (part.dependsOn) {
      const dependsOnValue = this.state.activeParts[part.dependsOn.part]?.label;
      if (dependsOnValue !== part.dependsOn.variant) return;
    }

    const partContainer = document.createElement('div');
    partContainer.className = 'part-container';
    
    const title = document.createElement('h3');
    title.textContent = part.title;
    partContainer.appendChild(title);

    const variantsContainer = document.createElement('div');
    variantsContainer.className = 'variants-container';
    
    Object.keys(part.variants).forEach(variantId => {
      const variant = part.variants[variantId];
      const button = document.createElement('button');
      
      button.textContent = variant.label;
      button.className = 'variant-button';
      button.dataset.partId = partId;
      button.dataset.variantId = variantId;
      
      button.addEventListener('click', () => {
        this.setPartVariant(partId, variantId);
      });
      
      variantsContainer.appendChild(button);
    });
    
    partContainer.appendChild(variantsContainer);
    this.ui.partsContainer.appendChild(partContainer);
  });
}

initColorPickers() {
  // Главный цвет
  this.createColorPicker('main', 'Основной цвет');
  
  // Цвета для отдельных частей
  Object.keys(this.config.colors).forEach(colorId => {
    if (colorId !== 'main' && !colorId.includes('White')) {
      this.createColorPicker(colorId, this.getColorLabel(colorId));
    }
  });
}

createColorPicker(colorId, label) {
  const container = document.createElement('div');
  container.className = 'color-picker-container';
  
  const labelEl = document.createElement('span');
  labelEl.textContent = label;
  container.appendChild(labelEl);
  
  const input = document.createElement('input');
  input.type = 'color';
  input.value = this.state.colors[colorId];
  input.dataset.colorId = colorId;
  
  input.addEventListener('input', (e) => {
    this.setColor(colorId, e.target.value);
  });
  
  container.appendChild(input);
  this.ui.partsContainer.appendChild(container);
}

getColorLabel(colorId) {
  const labels = {
    ears: 'Цвет ушей',
    eyes: 'Цвет глаз',
    cheeks: 'Цвет щёк',
    head: 'Цвет головы',
    mane: 'Цвет гривы',
    body: 'Цвет тела',
    tail: 'Цвет хвоста'
  };
  return labels[colorId] || colorId;
}
});
