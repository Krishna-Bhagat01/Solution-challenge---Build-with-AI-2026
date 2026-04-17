import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { nanoid } from 'nanoid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// --- Data Models & Store ---

type Severity = 'critical' | 'high' | 'medium' | 'low';
type Status = 'reported' | 'claimed' | 'en_route' | 'on_scene' | 'resolved';
type Category = 'fire' | 'medical' | 'security' | 'other';

interface TimelineEvent {
  timestamp: string;
  actor: string;
  action: string;
  note?: string;
}

interface Incident {
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
  lastEscalatedAt?: string;
}

interface Staff {
  id: string;
  name: string;
  role: 'security' | 'manager' | 'housekeeping' | 'medic';
  status: 'available' | 'responding' | 'off_duty';
  location?: { x: number; y: number };
}

interface Broadcast {
  id: string;
  type: 'evacuate' | 'lockdown' | 'all_clear' | 'custom';
  message: string;
  sentAt: string;
  sentBy: string;
}

const incidents: Map<string, Incident> = new Map();
const staff: Map<string, Staff> = new Map();
const broadcasts: Broadcast[] = [];

// --- Mock Data ---

const ROOMS_PER_FLOOR = 12;
const FLOORS = 3;

const floorPlan = {
  floors: Array.from({ length: FLOORS }, (_, f) => ({
    number: f + 1,
    rooms: Array.from({ length: ROOMS_PER_FLOOR }, (_, r) => ({
      id: `${f + 1}${String(r + 1).padStart(2, '0')}`,
      x: 10 + (r % 4) * 25,
      y: 20 + Math.floor(r / 4) * 30,
    }))
  }))
};

const seedStaff = () => {
  const roles: Staff['role'][] = ['security', 'manager', 'housekeeping', 'medic', 'security', 'housekeeping'];
  const names = ['Marcus Chen', 'Sarah Jenkins', 'Elena Rodriguez', 'Dr. Aris Thorne', 'Officer Miller', 'Maria Lopez'];
  
  names.forEach((name, i) => {
    const id = nanoid(5);
    staff.set(id, {
      id,
      name,
      role: roles[i],
      status: 'available',
      location: { x: Math.random() * 100, y: Math.random() * 100 }
    });
  });
};

const triageSeverity = (description: string): Severity => {
  const critKeywords = /fire|smoke|gun|weapon|shooter|bomb|explosion|blood|unconscious|stopped breathing|heart attack/i;
  const highKeywords = /fight|theft|robbery|injury|leak|flood|broken glass/i;
  const medKeywords = /noise|complaint|lost|missing|animal/i;

  if (critKeywords.test(description)) return 'critical';
  if (highKeywords.test(description)) return 'high';
  if (medKeywords.test(description)) return 'medium';
  return 'low';
};

// Seed initial staff
seedStaff();

// --- API Endpoints ---

app.get('/api/incidents', (req, res) => {
  res.json(Array.from(incidents.values()));
});

app.get('/api/staff', (req, res) => {
  res.json(Array.from(staff.values()));
});

app.get('/api/floorplan', (req, res) => {
  res.json(floorPlan);
});

app.post('/api/incidents', (req, res) => {
  const { category, description, location, reportedBy } = req.body;
  const id = `INC-${Math.floor(1000 + Math.random() * 9000)}`;
  const severity = triageSeverity(description);
  
  const newIncident: Incident = {
    id,
    category,
    description,
    location,
    severity,
    status: 'reported',
    reportedBy: reportedBy || 'Anonymous Guest',
    reportedAt: new Date().toISOString(),
    timeline: [{
      timestamp: new Date().toISOString(),
      actor: reportedBy || 'Guest',
      action: 'Incident reported'
    }]
  };

  incidents.set(id, newIncident);
  io.emit('incident:new', newIncident);
  res.status(201).json(newIncident);
});

app.patch('/api/incidents/:id', (req, res) => {
  const { id } = req.params;
  const update = req.body;
  const incident = incidents.get(id);

  if (!incident) return res.status(404).send('Incident not found');

  const updatedIncident = { ...incident, ...update };
  
  // Add to timeline if status changed
  if (update.status && update.status !== incident.status) {
    updatedIncident.timeline.push({
      timestamp: new Date().toISOString(),
      actor: update.claimedBy || 'System',
      action: `Status changed to ${update.status.replace('_', ' ')}`,
      note: update.note
    });
  }

  incidents.set(id, updatedIncident);
  io.emit('incident:update', updatedIncident);
  res.json(updatedIncident);
});

app.post('/api/broadcasts', (req, res) => {
  const { type, message, sentBy } = req.body;
  const broadcast: Broadcast = {
    id: nanoid(),
    type,
    message,
    sentAt: new Date().toISOString(),
    sentBy
  };
  broadcasts.push(broadcast);
  io.emit('broadcast:new', broadcast);
  res.status(201).json(broadcast);
});

app.post('/api/demo/seed', (req, res) => {
  // Generate 3 sample incidents
  const samples = [
    { category: 'medical', description: 'Elderly guest collapsed in the lobby', room: 'Lobby', floor: 1 },
    { category: 'fire', description: 'Smoke detected in kitchen area', room: 'Kitchen', floor: 1 },
    { category: 'security', description: 'Unauthorized person in service elevator', room: 'Elevator B', floor: 2 }
  ];

  samples.forEach(s => {
    const id = `INC-${Math.floor(1000 + Math.random() * 9000)}`;
    const severity = triageSeverity(s.description);
    const incident: Incident = {
      id,
      category: s.category as Category,
      description: s.description,
      location: { room: s.room, floor: s.floor, x: 20 + Math.random() * 60, y: 20 + Math.random() * 60 },
      severity,
      status: 'reported',
      reportedBy: 'System Demo',
      reportedAt: new Date().toISOString(),
      timeline: [{ timestamp: new Date().toISOString(), actor: 'System', action: 'Demo incident seeded' }]
    };
    incidents.set(id, incident);
    io.emit('incident:new', incident);
  });

  res.json({ message: 'Demo data seeded' });
});

// --- Auto-Escalation Logic ---

setInterval(() => {
  const now = Date.now();
  incidents.forEach((incident, id) => {
    if (incident.status === 'reported' && incident.severity !== 'critical') {
      const reportTime = new Date(incident.reportedAt).getTime();
      const lastEscalation = incident.lastEscalatedAt ? new Date(incident.lastEscalatedAt).getTime() : reportTime;
      
      // Escalate if unattended for > 60s
      if (now - lastEscalation > 60000) {
        const nextSeverity: Record<Severity, Severity> = {
          low: 'medium',
          medium: 'high',
          high: 'critical',
          critical: 'critical'
        };

        const updatedIncident: Incident = {
          ...incident,
          severity: nextSeverity[incident.severity],
          lastEscalatedAt: new Date().toISOString(),
          timeline: [
            ...incident.timeline,
            { timestamp: new Date().toISOString(), actor: 'System', action: 'Auto-escalated due to inactivity' }
          ]
        };

        incidents.set(id, updatedIncident);
        io.emit('incident:update', updatedIncident);
        console.log(`Auto-escalated incident ${id} to ${updatedIncident.severity}`);
      }
    }
  });
}, 10000);

// --- Vite Middleware (Development) ---

if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = 3000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Sentinel Command Bridge active on port ${PORT}`);
});
