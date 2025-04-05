
export interface Document {
  id: string;
  name: string;
  content: string;
  userId: string;
  uploadDate: Date;
}

export interface CreditRequest {
  id: string;
  userId: string;
  userName: string;
  requestDate: Date;
  status: 'pending' | 'approved' | 'rejected';
  requestedCredits: number;
}

export interface ScanRecord {
  id: string;
  userId: string;
  userName: string;
  timestamp: Date;
}
