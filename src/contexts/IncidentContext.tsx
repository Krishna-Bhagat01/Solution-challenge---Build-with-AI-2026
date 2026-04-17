import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Incident, Broadcast, Staff } from '../types';
import { useSocket } from './SocketContext';
import { toast } from 'sonner';
import { Howl } from 'howler';

interface IncidentContextType {
  incidents: Incident[];
  broadcasts: Broadcast[];
  staff: Staff[];
  loading: boolean;
  addIncident: (incident: Partial<Incident>) => Promise<Incident>;
  updateIncident: (id: string, update: Partial<Incident>) => Promise<Incident>;
  sendBroadcast: (broadcast: Partial<Broadcast>) => Promise<Broadcast>;
  seedDemo: () => Promise<void>;
}

const IncidentContext = createContext<IncidentContextType | null>(null);

const sirenSound = new Howl({
  src: ['https://www.soundjay.com/buttons/sounds/beep-01a.mp3'], // Placeholder for now, real siren would be better
  volume: 0.5
});

export const IncidentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  const fetchInitialData = async () => {
    try {
      const [incRes, staffRes] = await Promise.all([
        fetch('/api/incidents'),
        fetch('/api/staff')
      ]);
      const [incidentsData, staffData] = await Promise.all([
        incRes.json(),
        staffRes.json()
      ]);
      setIncidents(incidentsData);
      setStaff(staffData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch initial data', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('incident:new', (incident: Incident) => {
      setIncidents(prev => [incident, ...prev]);
      toast.error(`NEW ${incident.severity.toUpperCase()} INCIDENT: ${incident.id}`, {
        description: `${incident.category.toUpperCase()} - ${incident.location.room}`,
      });
      if (incident.severity === 'critical') {
        sirenSound.play();
      }
    });

    socket.on('incident:update', (updatedIncident: Incident) => {
      setIncidents(prev => prev.map(inc => inc.id === updatedIncident.id ? updatedIncident : inc));
      toast.info(`Incident ${updatedIncident.id} Updated`, {
        description: `Status: ${updatedIncident.status.replace('_', ' ')}`
      });
    });

    socket.on('broadcast:new', (broadcast: Broadcast) => {
      setBroadcasts(prev => [broadcast, ...prev]);
      toast(`FACILITY WIDE ALERT: ${broadcast.type.toUpperCase()}`, {
        description: broadcast.message,
        duration: 10000,
      });
    });

    return () => {
      socket.off('incident:new');
      socket.off('incident:update');
      socket.off('broadcast:new');
    };
  }, [socket]);

  const addIncident = useCallback(async (data: Partial<Incident>) => {
    const res = await fetch('/api/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  }, []);

  const updateIncident = useCallback(async (id: string, update: Partial<Incident>) => {
    const res = await fetch(`/api/incidents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update)
    });
    return res.json();
  }, []);

  const sendBroadcast = useCallback(async (data: Partial<Broadcast>) => {
    const res = await fetch('/api/broadcasts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  }, []);

  const seedDemo = useCallback(async () => {
    await fetch('/api/demo/seed', { method: 'POST' });
  }, []);

  return (
    <IncidentContext.Provider value={{ 
      incidents, 
      broadcasts, 
      staff, 
      loading, 
      addIncident, 
      updateIncident, 
      sendBroadcast,
      seedDemo
    }}>
      {children}
    </IncidentContext.Provider>
  );
};

export const useIncidents = () => {
  const context = useContext(IncidentContext);
  if (!context) throw new Error('useIncidents must be used within an IncidentProvider');
  return context;
};
