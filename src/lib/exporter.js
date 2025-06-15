import * as PSD from 'ag-psd'; // Используем только ag-psd

export const exportPNG = (canvas, character) => {
  const link = document.createElement('a');
  link.download = `character_${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
};

export const exportPSD = (psdData, character) => {
  try {
    const newPsd = {
      width: 800,
      height: 800,
      children: []
    };
    
    const psdBytes = PSD.writePsd(newPsd);
    const blob = new Blob([psdBytes], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `character_${Date.now()}.psd`;
    a.click();
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};
