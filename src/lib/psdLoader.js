import * as PSD from 'ag-psd';

export async function loadPSD() {
  try {
    const response = await fetch(`${window.publicPath || ''}/assets/model_kinwoods.psd`);
    if (!response.ok) throw new Error(`Failed to fetch PSD: ${response.status}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const psd = PSD.readPsd(arrayBuffer);
    
    if (!psd || !psd.children) throw new Error('Invalid PSD structure');
    
    // Нормализуем имена групп (заменяем обратные слеши)
    psd.children.forEach(group => {
      if (group.name) {
        group.name = group.name.replace(/\\/g, '/');
      }
      if (group.children) {
        group.children.forEach(subGroup => {
          if (subGroup.name) {
            subGroup.name = subGroup.name.replace(/\\/g, '/');
          }
        });
      }
    });
    
    console.log('PSD loaded successfully. Structure:', psd.children.map(c => c.name));
    return psd;
  } catch (error) {
    console.error('Error loading PSD:', error);
    throw error;
  }
}
