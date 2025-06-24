import { PARTS } from './defaultConfig';

export function getLayersForPart(part, variant, subtype = null) {
  const partConfig = PARTS[part];
  if (!partConfig) return [];

  let layers = [];
  
  if (partConfig.isSingleVariant) {
    layers = [...partConfig.layers];
  } else {
    const variantConfig = partConfig.variants[variant];
    if (variantConfig) {
      layers = [...variantConfig.layers];
      
      // Добавляем подтипы для глаз
      if (part === 'eyes' && variant === 'обычные' && subtype) {
        const subtypeConfig = variantConfig.subtypes?.[subtype];
        if (subtypeConfig) {
          layers = layers.concat(subtypeConfig.layers);
        }
      }
    }
  }
  
  return layers;
}
