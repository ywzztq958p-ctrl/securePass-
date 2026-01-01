
export interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  capacity: number;
  status: 'active' | 'upcoming' | 'finished';
  category: string;
}

export interface Ticket {
  id: string;
  eventId: string;
  holderName: string;
  type: 'VIP' | 'Standard' | 'Backstage';
  seat: string;
  scannedAt?: string;
  status: 'valid' | 'invalid' | 'already_scanned';
  qrData: string;
}

export interface ScanHistory {
  id: string;
  eventId: string;
  timestamp: string;
  ticketId: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  holderName?: string;
}

export interface SecurityStats {
  totalExpected: number;
  scannedCount: number;
  vipCount: number;
  anomalies: number;
}
