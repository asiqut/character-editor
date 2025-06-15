export function renderCharacter(canvas, psdData, character) {
  // Здесь будет логика отрисовки персонажа на canvas
  // на основе psdData и выбранных параметров character
  console.log('Rendering character:', character);
  
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Заглушка - в реальности нужно обрабатывать PSD слои
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#333';
  ctx.font = '20px Arial';
  ctx.fillText('Character Preview', 50, 50);
}
