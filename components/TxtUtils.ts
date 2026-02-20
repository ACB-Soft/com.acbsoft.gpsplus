import { SavedLocation } from '../types';

export const downloadTXT = (locations: SavedLocation[]) => {
  if (locations.length === 0) {
    alert("Kayıt bulunamadı.");
    return;
  }

  let content = "Klasör\tNokta\tEnlem\tBoylam\tYükseklik(m)\tHassasiyet\tTarih\n";
  content += "------------------------------------------------------------------------------------------------\n";

  locations.forEach(loc => {
    const dateStr = new Date(loc.timestamp).toLocaleString('tr-TR');
    content += `${loc.folderName}\t${loc.name}\t${loc.lat.toFixed(6)}\t${loc.lng.toFixed(6)}\t${loc.altitude !== null ? Math.round(loc.altitude) : '---'}\t${loc.accuracy.toFixed(1)}m\t${dateStr}\n`;
  });

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
  link.href = url;
  link.download = `Saha_Verileri_${timestamp}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
