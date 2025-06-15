// src/lib/psdLoader.js
import PSD from 'psd.js';

export async function loadPSD(url) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const psd = await PSD.fromArrayBuffer(arrayBuffer);
  return psd;
}

export function extractLayers(psd, structure) {
  // Функция для извлечения слоев по структуре
  const result = {};
  
  function traverse(node, path) {
    if (node.children) {
      node.children.forEach(child => {
        const newPath = path ? `${path}/${child.name}` : child.name;
        traverse(child, newPath);
      });
    } else {
      // Обработка слоев для окрашивания
      if (node.name.includes('[красить]')) {
        const part = path.split('/')[0];
        result[part] = result[part] || {};
        result[part][path] = node;
      }
    }
  }
  
  traverse(psd.tree());
  return result;
}
