export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type Status = 'reported' | 'claimed' | 'en_route' | 'on_scene' | 'resolved';
export type Category = 'fire' | 'medical' | 'security' | 'other';

export interface TimelineEvent {
  timestamp: string;
  actor: string;
  action: string;
  note?: string;
}

export interface Incident {
  id: string;
  category: Category;
  severity: Severity;
  status: Status;
  location: { room: string; floor: number; x: number; y: number };
  description: string;
  reportedBy: string;
  reportedAt: string;
  claimedBy?: string;
  timeline: TimelineEvent[];
}

export interface Staff {
  id: string;
  name: string;
  role: 'security' | 'manager' | 'housekeeping' | 'medic';
  status: 'available' | 'responding' | 'off_duty';
  location?: { x: number; y: number };
}

export interface Broadcast {
  id: string;
  type: 'evacuate' | 'lockdown' | 'all_clear' | 'custom';
  message: string;
  sentAt: string;
  sentBy: string;
}

export interface FloorPlan {
  floors: {
    number: number;
    rooms: {
      id: string;
      x: number;
      y: number;
    }[];
  }[];
}
