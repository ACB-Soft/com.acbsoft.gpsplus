import * as XLSX from 'xlsx';
import { SavedLocation } from '../types';

export const downloadExcel = (locations: SavedLocation[]) => {
  if (locations.length === 0) return "";

  const data = locations.map(loc => ({
    "Proje / Klasör": loc.folderName,
    "Nokta İsmi": loc.name,
    "Enlem": loc.lat,
    "Boylam": loc.lng,
    "Yükseklik (m)": loc.altitude !== null ? Math.round(loc.altitude) : '---',
    "Hassasiyet (m)": loc.accuracy.toFixed(2),
    "Tarih": new Date(loc.timestamp).toLocaleString('tr-TR'),
    "Açıklama": loc.description || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const wscols = [
    { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, 
    { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 25 },
  ];
  worksheet['!cols'] = wscols;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Saha Verileri");

  // Android için Base64 formatında çıktı alıyoruz
  return XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });
};
