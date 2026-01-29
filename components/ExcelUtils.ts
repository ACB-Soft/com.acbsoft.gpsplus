import * as XLSX from 'xlsx';
import { SavedLocation } from '../types';

export const downloadExcel = (locations: SavedLocation[]) => {
  if (locations.length === 0) {
    alert("Kayıt bulunamadı.");
    return;
  }

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
    { wch: 20 }, // Klasör
    { wch: 15 }, // Nokta İsmi
    { wch: 15 }, // Enlem
    { wch: 15 }, // Boylam
    { wch: 15 }, // Yükseklik
    { wch: 15 }, // Hassasiyet
    { wch: 20 }, // Tarih
    { wch: 25 }, // Açıklama
  ];
  worksheet['!cols'] = wscols;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Saha Verileri");

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
  const fileName = `Saha_Verileri_Excel_${timestamp}.xlsx`;
  
  XLSX.writeFile(workbook, fileName);
};