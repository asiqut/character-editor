import PSD from 'psd.js';

export async function loadPSD(url) {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const psd = PSD.fromArrayBuffer(arrayBuffer);
    psd.parse();
    return psd;
  } catch (error) {
    console.error('Error loading PSD:', error);
    throw error;
  }
}
