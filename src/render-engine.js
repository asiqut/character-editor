export class Editor {
  constructor(canvasSelector, config) {
    this.canvas = document.querySelector(canvasSelector);
    this.ctx = this.canvas.getContext('2d');
    this.config = config;
    this.character = this.loadDefaultCharacter();
  }

  loadDefaultCharacter() {
    // Возвращает персонажа с default-настройками
    return Object.keys(this.config.parts).reduce((char, part) => {
      char[part] = 'default';
      return char;
    }, {});
  }

  setPart(part, variant) {
    // Обновляет часть персонажа
    if (this.config.parts[part]?.variants[variant]) {
      this.character[part] = variant;
      this.render();
    }
  }

  render() {
    // Основной цикл отрисовки
    this.clearCanvas();
    this.config.renderOrder.forEach(part => {
      this.drawPart(part);
    });
  }
}
