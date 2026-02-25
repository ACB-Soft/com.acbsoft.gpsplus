import { SavedLocation } from '../types';

export const downloadTXT = (locations: SavedLocation[]) => {
  if (locations.length === 0) return "";

  let content = "Klasör\tNokta\tEnlem\tBoylam\tYükseklik(m)\tHassasiyet\tTarih\n";
  content += "------------------------------------------------------------------------------------------------\n";

  locations.forEach(loc => {
    const dateStr = new Date(loc.timestamp).toLocaleString('tr-TR');
    content += `${loc.folderName}\t${loc.name}\t${loc.lat.toFixed(6)}\t${loc.lng.toFixed(6)}\t${loc.altitude !== null ? Math.round(loc.altitude) : '---'}\t${loc.accuracy.toFixed(1)}m\t${dateStr}\n`;
  });

  return content;
};
