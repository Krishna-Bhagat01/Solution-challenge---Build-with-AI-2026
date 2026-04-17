import React, { FC } from 'react';
import { motion } from 'motion/react';
import { Clock, MapPin, User, ChevronRight, AlertCircle, CheckCircle2, Siren, Activity, Flame, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Incident, Severity, Status, Category } from '@/types';
import { formatDistanceToNow } from 'date-fns';

const severityColors: Record<Severity, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-blue-500'
};

const categoryIcons: Record<Category, any> = {
  fire: Flame,
  medical: Activity,
  security: ShieldAlert,
  other: AlertCircle
};

interface IncidentCardProps {
  incident: Incident;
  onClaim?: (id: string) => void;
  onView?: (id: string) => void;
  isCompact?: boolean;
}

const IncidentCard: FC<IncidentCardProps> = ({ incident, onClaim, onView, isCompact }) => {
  const Icon = categoryIcons[incident.category];
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`relative overflow-hidden transition-all duration-300 border border-border rounded-xl ${incident.status === 'resolved' ? 'opacity-50 grayscale' : 'bg-secondary/20 hover:bg-secondary/30 shadow-sm shadow-black/40'}`}
    >
      <div className={`absolute top-0 left-0 bottom-0 w-1 ${incident.severity === 'critical' ? 'bg-destructive' : incident.severity === 'high' ? 'bg-warning' : 'bg-primary'}`} />
      
      <div className="p-4 pl-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-lg ${incident.severity === 'critical' ? 'bg-destructive/10 text-destructive' : incident.severity === 'high' ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] font-bold text-muted-foreground">{incident.id}</span>
                {incident.severity === 'critical' && (
                  <span className="text-[8px] font-black bg-destructive text-white px-1.5 py-0.5 rounded animate-pulse">CRITICAL</span>
                )}
              </div>
              <h4 className="font-bold text-sm leading-tight uppercase tracking-tight">{incident.category} EMERGENCY</h4>
            </div>
          </div>
          <span className="text-[9px] font-mono text-muted-foreground flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            {formatDistanceToNow(new Date(incident.reportedAt), { addSuffix: true }).toUpperCase()}
          </span>
        </div>

        {!isCompact && (
          <p className="text-muted-foreground text-[11px] mb-4 line-clamp-2 leading-relaxed italic">"{incident.description}"</p>
        )}

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
            <MapPin className="w-3 h-3 text-primary/70" />
            ROOM {incident.location.room}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
            <User className="w-3 h-3 text-primary/70" />
            {incident.reportedBy.toUpperCase()}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${incident.status === 'resolved' ? 'bg-success' : 'bg-primary animate-pulse'}`} />
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              {incident.status.replace('_', ' ')}
            </span>
          </div>
          
          <div className="flex gap-2">
            {incident.status === 'reported' && onClaim && (
              <Button 
                size="sm" 
                onClick={() => onClaim(incident.id)}
                className="h-7 px-3 font-bold text-[9px] bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
              >
                CLAIM RESPONSE
              </Button>
            )}
            {onView && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onView(incident.id)}
                className="h-7 w-7 p-0 hover:bg-white/5 border border-transparent hover:border-border duration-200"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default IncidentCard;

