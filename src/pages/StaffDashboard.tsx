import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, ListFilter, Map, Shield, Activity, CheckCircle2, ChevronRight, MessageSquare, LogOut } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIncidents } from '@/contexts/IncidentContext';
import IncidentCard from '@/components/shared/IncidentCard';
import FloorMap from '@/components/shared/FloorMap';
import { useNavigate } from 'react-router-dom';
import { Incident, Staff } from '@/types';

export default function StaffDashboard() {
  const navigate = useNavigate();
  const { incidents, staff, updateIncident, loading } = useIncidents();
  const [filter, setFilter] = useState<'all' | 'unclaimed' | 'mine'>('all');
  const [activeFloor, setActiveFloor] = useState(1);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  // Mock staff login (for demo purposes)
  const currentStaff = (staff[0] as Staff) || ({ name: 'Officer Miller', id: 'STAFF-1' } as Staff);

  if (loading) return <div className="p-20 text-center">Initializing Dashboard...</div>;

  const filteredIncidents = incidents.filter(inc => {
    if (filter === 'unclaimed') return inc.status === 'reported';
    if (filter === 'mine') return inc.claimedBy === currentStaff.name;
    return true;
  });

  const selectedIncident = incidents.find(inc => inc.id === selectedIncidentId);

  const handleClaim = (id: string) => {
    updateIncident(id, { 
      status: 'claimed', 
      claimedBy: currentStaff.name 
    });
  };

  const handleStatusChange = (status: any) => {
    if (selectedIncidentId) {
      updateIncident(selectedIncidentId, { status });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="h-[72px] border-b border-border bg-background/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-black shadow-lg shadow-primary/20">
            S
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">SENTINEL STAFF</h1>
            <p className="text-[10px] text-muted-foreground font-mono flex items-center gap-1.5 leading-none">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              SYSTEM ACTIVE • {currentStaff.name.toUpperCase()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="hidden md:flex gap-8">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Open</span>
              <span className="text-xl font-mono font-bold leading-none">{incidents.filter(i => i.status !== 'resolved').length}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Claimed</span>
              <span className="text-xl font-mono font-bold text-primary leading-none">{incidents.filter(i => i.status === 'claimed' || i.status === 'en_route').length}</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="hover:text-destructive hover:bg-destructive/10">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 md:grid-cols-[400px_1fr] gap-[1px] bg-border overflow-hidden">
        {/* Left Feed */}
        <aside className="bg-background flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border bg-secondary/10">
            <Tabs defaultValue="all" className="w-full" onValueChange={(v) => setFilter(v as any)}>
              <TabsList className="grid grid-cols-3 bg-secondary p-1 rounded-lg">
                <TabsTrigger value="all" className="text-[10px] font-bold uppercase tracking-tight data-[state=active]:bg-background data-[state=active]:shadow-sm">Active</TabsTrigger>
                <TabsTrigger value="unclaimed" className="text-[10px] font-bold uppercase tracking-tight data-[state=active]:bg-background data-[state=active]:shadow-sm">New</TabsTrigger>
                <TabsTrigger value="mine" className="text-[10px] font-bold uppercase tracking-tight data-[state=active]:bg-background data-[state=active]:shadow-sm">My Tasks</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {filteredIncidents.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground text-xs italic">No incidents matching filter</div>
              ) : (
                filteredIncidents.map((inc: Incident) => (
                  <IncidentCard 
                    key={inc.id} 
                    incident={inc} 
                    onClaim={handleClaim}
                    onView={(id: string) => setSelectedIncidentId(id)}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </aside>

        {/* Main View */}
        <div className="hidden md:flex flex-col p-8 bg-background overflow-y-auto bg-grid-pattern custom-scrollbar">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8 h-full items-start">
            {/* Map Section */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                  <Map className="w-4 h-4 text-primary" /> VENUE NAVIGATION
                </h3>
                <div className="flex gap-1 bg-secondary p-1 rounded-lg">
                  {[1, 2, 3].map(f => (
                    <Button 
                      key={f}
                      variant={activeFloor === f ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveFloor(f)}
                      className={`h-7 px-4 text-[10px] font-bold ${activeFloor === f ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      FL 0{f}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="aspect-[4/3] border border-border rounded-2xl bg-secondary/10 relative overflow-hidden">
                <FloorMap incidents={incidents} activeFloor={activeFloor} />
              </div>
            </div>

            {/* Interaction Section */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" /> INCIDENT COMMAND
              </h3>
              
              {selectedIncident ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-secondary/20 border border-border rounded-2xl p-6 h-fit backdrop-blur-xl"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <Badge className={`mb-3 text-[9px] font-black uppercase tracking-widest ${selectedIncident.severity === 'critical' ? 'bg-destructive/20 text-destructive border-destructive/30' : 'bg-primary/20 text-primary border-primary/30'}`} variant="outline">
                        {selectedIncident.severity} Severity
                      </Badge>
                      <h2 className="text-3xl font-black tracking-tight mb-2">{selectedIncident.id}</h2>
                      <p className="text-muted-foreground text-sm italic leading-relaxed">"{selectedIncident.description}"</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-3">
                      {['claimed', 'en_route', 'on_scene', 'resolved'].map((s) => (
                        <Button
                          key={s}
                          variant={selectedIncident.status === s ? 'default' : 'outline'}
                          onClick={() => handleStatusChange(s)}
                          className={`h-11 font-bold uppercase text-[10px] tracking-widest rounded-lg ${selectedIncident.status === s ? 'bg-primary shadow-lg shadow-primary/20 text-white' : 'border-border text-muted-foreground hover:bg-secondary/20'}`}
                        >
                          {s.replace('_', ' ')}
                        </Button>
                      ))}
                    </div>

                    <div className="space-y-4 pt-6 border-t border-border">
                      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Update Log</h4>
                      <div className="space-y-4">
                        {selectedIncident.timeline.slice(-3).reverse().map((event, i) => (
                          <div key={i} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary mb-1 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                              <div className="w-px flex-1 bg-border" />
                            </div>
                            <div className="flex-1 pb-4">
                              <p className="font-bold text-xs uppercase tracking-tight">{event.action}</p>
                              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                                <span>{event.actor.toUpperCase()}</span>
                                <span className="font-mono tabular-nums">{new Date(event.timestamp).toLocaleTimeString([], { hour12: false })}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="relative">
                        <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input 
                          type="text" 
                          placeholder="Broadcast update note..."
                          className="w-full h-11 bg-background border border-border rounded-xl pl-12 pr-4 text-xs font-medium focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="aspect-square bg-secondary/10 border border-border rounded-2xl flex flex-col items-center justify-center text-center p-12">
                  <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center mb-6 border border-border">
                    <ListFilter className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                  <h4 className="text-lg font-bold mb-2 tracking-tight">No Incident Selected</h4>
                  <p className="text-muted-foreground text-xs max-w-[240px] leading-relaxed">Select an incident from the live feed to begin coordinate response efforts.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
