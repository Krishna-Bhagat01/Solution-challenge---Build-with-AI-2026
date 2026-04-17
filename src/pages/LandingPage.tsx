import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Shield, Users, Monitor, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIncidents } from '@/contexts/IncidentContext';

const RoleCard = ({ 
  title, 
  icon: Icon, 
  description, 
  onClick, 
  color 
}: { 
  title: string; 
  icon: any; 
  description: string; 
  onClick: () => void;
  color: string;
}) => (
  <motion.div
    whileHover={{ y: -5 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="bg-secondary/20 border border-border p-8 rounded-2xl cursor-pointer group transition-all duration-300 hover:bg-secondary/40 hover:border-primary/50 relative overflow-hidden"
  >
    <div className={`w-14 h-14 rounded-xl ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative z-10`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <h3 className="text-xl font-bold mb-3 relative z-10 tracking-tight">{title}</h3>
    <p className="text-muted-foreground text-sm leading-relaxed relative z-10">{description}</p>
    <div className="absolute right-[-20px] bottom-[-20px] w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
  </motion.div>
);

export default function LandingPage() {
  const navigate = useNavigate();
  const { seedDemo } = useIncidents();

  const handleDemo = async () => {
    await seedDemo();
    navigate('/command');
  };

  return (
    <div className="container mx-auto px-4 py-20 min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16 relative z-10"
      >
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-primary/20">S</div>
          <h1 className="text-5xl font-black tracking-tighter uppercase">SENTINEL</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium">
          CRITICAL RESPONSE & CRISIS MANAGEMENT PLATFORM
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mb-16 relative z-10">
        <RoleCard
          title="I'm a Guest"
          icon={Users}
          color="bg-destructive"
          description="Access the one-tap emergency terminal to report incidents and track response in real-time."
          onClick={() => navigate('/guest')}
        />
        <RoleCard
          title="I'm Staff"
          icon={Shield}
          color="bg-primary"
          description="Monitor high-priority incidents, coordinate with team members, and navigate the crisis map."
          onClick={() => navigate('/staff')}
        />
        <RoleCard
          title="Command Center"
          icon={Monitor}
          color="bg-indigo-600"
          description="Full operational overview, heatmap triage, facility broadcasts, and emergency service briefing."
          onClick={() => navigate('/command')}
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative z-10"
      >
        <Button 
          size="lg" 
          className="gap-2 px-10 h-14 text-sm font-bold rounded-xl bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 uppercase tracking-widest"
          onClick={handleDemo}
        >
          <Play className="w-4 h-4 fill-current" />
          Launch Demo Suite
        </Button>
      </motion.div>

      {/* Background accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-destructive/10 rounded-full blur-[120px] pointer-events-none" />
    </div>
  );
}
