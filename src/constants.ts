import { Complaint, RecyclingCenter, LeaderboardEntry } from './types';

export const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: '1',
    userId: 'u1',
    userName: 'John Doe',
    description: 'Overflowing bin near the park entrance.',
    location: { lat: 40.7128, lng: -74.006, address: 'Central Park West' },
    beforeImage: 'https://picsum.photos/seed/waste1/400/300',
    status: 'pending',
    priority: 'high',
    type: 'dry',
    date: '2024-03-10',
  },
  {
    id: '2',
    userId: 'u2',
    userName: 'Jane Smith',
    description: 'Illegal dumping in the alleyway.',
    location: { lat: 40.7282, lng: -73.9942, address: 'East Village' },
    beforeImage: 'https://picsum.photos/seed/waste2/400/300',
    status: 'assigned',
    priority: 'medium',
    type: 'wet',
    date: '2024-03-12',
    assignedDriverId: 'd1',
  },
  {
    id: '3',
    userId: 'u1',
    userName: 'John Doe',
    description: 'Broken glass on the sidewalk.',
    location: { lat: 40.7589, lng: -73.9851, address: 'Times Square' },
    beforeImage: 'https://picsum.photos/seed/waste3/400/300',
    afterImage: 'https://picsum.photos/seed/clean3/400/300',
    status: 'completed',
    priority: 'low',
    type: 'hazardous',
    date: '2024-03-14',
  },
];

export const MOCK_RECYCLING_CENTERS: RecyclingCenter[] = [
  {
    id: 'rc1',
    name: 'Green Earth Recycling',
    address: '123 Eco St, New York',
    lat: 40.7128,
    lng: -74.006,
    acceptedWaste: ['Plastic', 'Paper', 'Glass'],
  },
  {
    id: 'rc2',
    name: 'City Waste Management',
    address: '456 Urban Ave, New York',
    lat: 40.7306,
    lng: -73.9352,
    acceptedWaste: ['Electronic', 'Metal', 'Hazardous'],
  },
];

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { id: '1', name: 'EcoWarrior', points: 1250, rank: 1 },
  { id: '2', name: 'GreenCitizen', points: 980, rank: 2 },
  { id: '3', name: 'WasteReducer', points: 850, rank: 3 },
  { id: '4', name: 'John Doe', points: 150, rank: 12 },
];
