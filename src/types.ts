export interface Complaint {
  id: string;
  userId: string;
  userName: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  beforeImage: string;
  afterImage?: string;
  status: 'pending' | 'assigned' | 'completed';
  priority: 'low' | 'medium' | 'high';
  type: 'dry' | 'wet' | 'hazardous';
  date: string;
  assignedDriverId?: string;
}

export interface RecyclingCenter {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  acceptedWaste: string[];
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  points: number;
  rank: number;
}
