import { useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, Phone, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIncidents } from '@/contexts/IncidentContext';

const StatusStep = ({ 
  label, 
  active, 
  completed 
}: { 
  label: string; 
  active: boolean; 
  completed: boolean 
}) => (
  <div className="flex items-center gap-4">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${completed ? 'bg-green-500' : active ? 'bg-primary ring-4 ring-primary/20 animate-pulse' : 'bg-white/10'}`}>
      {completed ? '✓' : ''}
    </div>
    <span className={`font-bold tracking-tight ${completed || active ? 'text-white' : 'text-gray-600'}`}>
      {label}
    </span>
  </div>
);

export default function GuestConfirmationPage() {
  const { id } = useParams();
  const { incidents } = useIncidents();
  const incident = incidents.find(inc => inc.id === id);

  if (!incident) return <div className="text-center p-20">Incident records synchronizing...</div>;

  const statuses = ['reported', 'claimed', 'en_route', 'on_scene', 'resolved'];
  const currentIndex = statuses.indexOf(incident.status);

  return (
    <div className="min-h-screen container max-w-2xl mx-auto px-6 py-20 flex flex-col items-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-24 h-24 rounded-3xl bg-green-500/20 flex items-center justify-center mb-8"
      >
        <ShieldCheck className="w-12 h-12 text-green-500" />
      </motion.div>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-black mb-4">HELP IS ON THE WAY</h1>
        <p className="text-xl text-gray-400">Response teams have been dispatched to your location.</p>
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
          <span className="text-xs font-mono text-gray-500 uppercase">Case ID</span>
          <span className="font-mono font-bold text-primary">{id}</span>
        </div>
      </div>

      <div className="w-full glass rounded-3xl p-8 mb-8 space-y-6">
        <div className="space-y-4">
          <StatusStep label="Reported" active={currentIndex === 0} completed={currentIndex > 0} />
          <div className="w-0.5 h-6 bg-white/10 ml-4"></div>
          <StatusStep label="Claimed" active={currentIndex === 1} completed={currentIndex > 1} />
          <div className="w-0.5 h-6 bg-white/10 ml-4"></div>
          <StatusStep label="En Route" active={currentIndex === 2} completed={currentIndex > 2} />
          <div className="w-0.5 h-6 bg-white/10 ml-4"></div>
          <StatusStep label="On Scene" active={currentIndex === 3} completed={currentIndex > 3} />
          <div className="w-0.5 h-6 bg-white/10 ml-4"></div>
          <StatusStep label="Resolved" active={currentIndex === 4} completed={currentIndex > 4} />
        </div>

        <div className="pt-6 mt-6 border-t border-white/10 grid grid-cols-2 gap-8">
          <div className="space-y-1">
            <span className="text-xs text-gray-500 uppercase font-black flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Location
            </span>
            <p className="text-xl font-bold">Room {incident.location.room}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-gray-500 uppercase font-black flex items-center gap-1">
              <Clock className="w-3 h-3" /> E.T.A
            </span>
            <p className="text-xl font-bold text-green-500">
              {currentIndex < 3 ? 'Calculated: 3m' : 'Arrival imminent'}
            </p>
          </div>
        </div>

        {incident.claimedBy && (
          <div className="p-4 bg-primary/10 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold">
              {incident.claimedBy[0]}
            </div>
            <div>
              <p className="text-xs text-primary font-black uppercase tracking-widest">Responder</p>
              <p className="font-bold">{incident.claimedBy}</p>
            </div>
          </div>
        )}
      </div>

      <div className="w-full space-y-4">
        <Button 
          variant="outline" 
          className="w-full h-14 rounded-2xl gap-3 border-white/10 font-bold"
          onClick={() => window.location.href = 'tel:+1234567890'}
        >
          <Phone className="w-5 h-5" /> CALL STAFF DESK
        </Button>
      </div>
    </div>
  );
}
