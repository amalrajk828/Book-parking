import QRCode from 'qrcode';

export const generateQR = async (text) => {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      color: {
        dark: '#0f172a',  // zinc dark color
        light: '#ffffff'  // white background
      },
      width: 300,
      margin: 1
    });
    return dataUrl;
  } catch (err) {
    console.error('QR Generation error:', err);
    throw new Error('Failed to generate QR code');
  }
};
