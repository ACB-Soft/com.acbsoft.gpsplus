export interface Coordinate {
  lat: number;
  lng: number;
  accuracy: number;
  altitude: number | null;
  timestamp: number;
}

export interface SavedLocation {
  id: string;
  folderName: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
  altitude: number | null;
  accuracy: number;
  photo: string | null;
  timestamp: number;
}

export enum AppStatus {
  IDLE = 'IDLE',
  COUNTDOWN = 'COUNTDOWN',
  CAPTURING = 'CAPTURING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}