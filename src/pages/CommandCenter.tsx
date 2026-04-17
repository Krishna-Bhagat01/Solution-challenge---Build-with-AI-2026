import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  Map as MapIcon, 
  Radio, 
  History, 
  Download, 
  LayoutGrid, 
  Flame, 
  ShieldAlert, 
  Activity, 
  Clock, 
  FlameIcon,
  CircleDot
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';
import { jsPDF } from 'jspdf';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useIncidents } from '@/contexts/IncidentContext';
import FloorMap from '@/components/shared/FloorMap';
import { Incident } from '@/types';

export default function CommandCenter() {
  const { incidents, broadcasts, sendBroadcast, loading } = useIncidents();
  const [activeFloor, setActiveFloor] = useState(1);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);

  // Stats Calculations
  const stats = useMemo(() => {
    const total = incidents.length;
    const active = incidents.filter(i => i.status !== 'resolved').length;
    const critical = incidents.filter(i => i.severity === 'critical' && i.status !== 'resolved').length;
    
    const byCategory = [
      { name: 'Fire', value: incidents.filter(i => i.category === 'fire').length },
      { name: 'Med', value: incidents.filter(i => i.category === 'medical').length },
      { name: 'Sec', value: incidents.filter(i => i.category === 'security').length },
      { name: 'Oth', value: incidents.filter(i => i.category === 'other').length },
    ];

    const timelineData = Array.from({ length: 6 }, (_, i) => {
      const hour = new Date();
      hour.setHours(hour.getHours() - (5 - i));
      return {
        time: hour.getHours() + ':00',
        incidents: Math.floor(Math.random() * 5)
      };
    });

    return { total, active, critical, byCategory, timelineData };
  }, [incidents]);

  const generateBriefing = (incident: Incident) => {
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.text('INCIDENT BRIEFING CARD', 10, 20);
    
    doc.setFontSize(12);
    doc.text(`Incident ID: ${incident.id}`, 10, 35);
    doc.text(`Category: ${incident.category.toUpperCase()}`, 10, 42);
    doc.text(`Severity: ${incident.severity.toUpperCase()}`, 10, 49);
    doc.text(`Location: Room ${incident.location.room}, Floor ${incident.location.floor}`, 10, 56);
    doc.text(`Reported At: ${new Date(incident.reportedAt).toLocaleString()}`, 10, 63);
    
    doc.setFontSize(14);
    doc.text('Description:', 10, 75);
    doc.setFontSize(11);
    doc.text(incident.description, 10, 82, { maxWidth: 180 });
    
    doc.setFontSize(14);
    doc.text('Timeline Events:', 10, 100);
    doc.setFontSize(9);
    incident.timeline.forEach((event, i) => {
      doc.text(`${new Date(event.timestamp).toLocaleTimeString()} - ${event.actor}: ${event.action}`, 10, 110 + (i * 7));
    });
    
    doc.save(`${incident.id}-briefing.pdf`);
  };

  if (loading) return <div>Loading Command Center...</div>;

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Top Navigation */}
      <header className="h-[72px] border-b border-border bg-background/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-black shadow-lg shadow-primary/20">
            S
          </div>
          <h1 className="text-xl font-bold tracking-tight">SENTINEL</h1>
        </div>

        <div className="stats-bar hidden xl:flex gap-8">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Active Incidents</span>
            <span className="text-lg font-mono font-bold text-destructive">{stats.active || '00'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Staff On Scene</span>
            <span className="text-lg font-mono font-bold">09</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">System Status</span>
            <span className="text-lg font-mono font-bold text-success uppercase">Secure</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Dialog open={isBroadcastOpen} onOpenChange={setIsBroadcastOpen}>
            <DialogTrigger render={
              <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/10 font-bold uppercase tracking-tight text-[10px] h-9 px-4 gap-2">
                <Radio className="w-3.5 h-3.5" /> BROADCAST ALERT
              </Button>
            } />
            <DialogContent className="bg-card glass border-white/10">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black tracking-tight uppercase">Emergency Broadcast</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-2">
                  {['evacuate', 'lockdown', 'all_clear', 'custom'].map(type => (
                    <Button 
                      key={type} 
                      variant="outline" 
                      onClick={() => {
                        sendBroadcast({ type: type as any, message: `ATTENTION: ${type.replace('_', ' ').toUpperCase()} IN EFFECT IMMEDIATELY.`, sentBy: 'COMMAND' });
                        setIsBroadcastOpen(false);
                      }}
                      className="font-bold uppercase text-[10px] border-white/10 hover:bg-white/10"
                    >
                      {type.replace('_', ' ')}
                    </Button>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button className="bg-primary text-white hover:bg-primary/90 font-bold uppercase tracking-tight text-[10px] h-9 px-4">
            GENERATE BRIEF
          </Button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-[1px] bg-border overflow-hidden">
        {/* Left: Global Map & Heatmap */}
        <section className="bg-background p-6 flex flex-col overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1 bg-secondary rounded-lg p-1 border border-border">
                 {[1, 2, 3].map(f => (
                    <Button 
                      key={f}
                      variant={activeFloor === f ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveFloor(f)}
                      className={`h-7 px-4 text-[10px] font-bold tracking-tight rounded-md ${activeFloor === f ? 'bg-primary shadow-sm text-white' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      FL 0{f}
                    </Button>
                  ))}
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest hidden sm:inline">Venue: Grand Continental Resort</span>
            </div>
            <Button 
              variant={showHeatmap ? 'default' : 'outline'}
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`gap-2 h-9 px-4 font-bold uppercase tracking-tight text-[10px] ${showHeatmap ? 'bg-orange-500 border-orange-500 text-white' : 'border-border'}`}
            >
              <Activity className="w-3.5 h-3.5" /> Heatmap View
            </Button>
          </div>

          <div className="flex-1 min-h-[500px] border border-border rounded-xl bg-secondary/20 relative overflow-hidden">
            <FloorMap 
              incidents={incidents} 
              activeFloor={activeFloor} 
              showHeatmap={showHeatmap} 
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
             <div className="bg-secondary/20 border border-border rounded-2xl p-6">
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-6">Incident Density (6h)</h3>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.timelineData}>
                      <XAxis dataKey="time" stroke="#4a5568" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(10, 14, 26, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                      />
                      <Bar dataKey="incidents" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
             </div>
             <div className="bg-secondary/20 border border-border rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Category Distribution</h3>
                </div>
                <div className="h-40 flex items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.byCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={65}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {stats.byCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#ef4444', '#10b981', '#3b82f6', '#f59e0b'][index % 4]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col gap-2 ml-4">
                    {stats.byCategory.map((cat, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full`} style={{ backgroundColor: ['#ef4444', '#10b981', '#3b82f6', '#f59e0b'][i % 4] }} />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{cat.name}: {cat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
             </div>
          </div>
        </section>

        {/* Right Sidebar: Active Incidents & Timeline */}
        <aside className="bg-background border-l border-border flex flex-col overflow-hidden">
          <div className="flex flex-col h-full">
            <div className="p-5 border-b border-border flex justify-between items-center bg-secondary/10">
              <h3 className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                <CircleDot className="w-3.5 h-3.5 text-destructive animate-pulse" /> LIVE INCIDENTS
                <span className="px-1.5 py-0.5 rounded bg-destructive text-white text-[9px] font-black">
                  {incidents.filter(i => i.status !== 'resolved').length}
                </span>
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {incidents.filter(inc => inc.status !== 'resolved').map((inc, index) => (
                <div 
                  key={inc.id} 
                  className={`p-5 border-b border-border transition-colors hover:bg-secondary/5 group ${index === 0 ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono text-muted-foreground">{inc.id}</span>
                    <Badge variant="outline" className={`text-[8px] uppercase px-1.5 py-0 ${inc.severity === 'critical' ? 'border-destructive text-destructive' : 'border-border text-muted-foreground'}`}>
                      {inc.severity}
                    </Badge>
                  </div>
                  <h4 className="font-bold text-sm tracking-tight mb-1">Room {inc.location.room} - {inc.category.toUpperCase()}</h4>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mb-3 leading-relaxed">{inc.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${inc.status === 'reported' ? 'bg-destructive' : 'bg-primary'} animate-pulse`} />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">{inc.status.replace('_', ' ')}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => generateBriefing(inc)}
                      className="h-7 px-2 text-[10px] font-bold text-muted-foreground hover:text-foreground hover:bg-secondary/20"
                    >
                      DETAILS
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-[35%] bg-secondary/10 border-t border-border flex flex-col overflow-hidden">
              <div className="p-4 border-b border-border">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <History className="w-3.5 h-3.5" /> GLOBAL ACTIVITY TIMELINE
                </h4>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-[10px] custom-scrollbar">
                {incidents.flatMap(i => i.timeline.map(t => ({ ...t, incidentId: i.id }))).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 15).map((log, i) => (
                  <div key={i} className="flex gap-4 border-l border-border pl-4 relative">
                    <div className="absolute left-[-4.5px] top-1 w-2 h-2 rounded-full bg-border" />
                    <span className="text-muted-foreground tabular-nums opacity-60">{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    <div className="flex-1">
                      <span className="text-primary font-bold mr-2">[{log.incidentId}]</span>
                      <span className="text-foreground/80">{log.action} by <span className="text-foreground font-bold">{log.actor}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

const Siren = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 11v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-8a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3Z"/><path d="M9 14h.01"/><path d="M7 6v2"/><path d="M12 3v3"/><path d="M19 11v8a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-8a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3Z"/><path d="M17 6v2"/><path d="M15 14h.01"/>
  </svg>
);
