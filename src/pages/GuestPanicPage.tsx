import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Activity, ShieldAlert, AlertTriangle, Mic, Send, Languages, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useIncidents } from '@/contexts/IncidentContext';
import { Category } from '@/types';

const translations = {
  en: {
    title: "EMERGENCY RESPONSE",
    sos: "SOS",
    sub: "Tap if you need immediate assistance",
    category: "Select Category",
    room: "Room Number",
    desc: "Describe the situation (optional)",
    voice: "Voice to text",
    send: "SEND REPORT",
    fire: "Fire",
    medical: "Medical",
    security: "Security",
    other: "Other"
  },
  es: {
    title: "RESPUESTA DE EMERGENCIA",
    sos: "S.O.S",
    sub: "Toque si necesita asistencia inmediata",
    category: "Seleccionar Categoría",
    room: "Número de Habitación",
    desc: "Describa la situación (opcional)",
    voice: "Voz a texto",
    send: "ENVIAR REPORTE",
    fire: "Fuego",
    medical: "Médico",
    security: "Seguridad",
    other: "Otro"
  },
  fr: {
    title: "AIDE D'URGENCE",
    sos: "SOS",
    sub: "Appuyez si vous avez besoin d'aide",
    category: "Sélectionner une catégorie",
    room: "Numéro de chambre",
    desc: "Décrire la situation (facultatif)",
    voice: "Voix en texte",
    send: "ENVOYER LE RAPPORT",
    fire: "Feu",
    medical: "Médical",
    security: "Sécurité",
    other: "Autre"
  }
};

export default function GuestPanicPage() {
  const navigate = useNavigate();
  const { addIncident } = useIncidents();
  const [lang, setLang] = useState<'en' | 'es' | 'fr'>('en');
  const [category, setCategory] = useState<Category | null>(null);
  const [room, setRoom] = useState('412');
  const [desc, setDesc] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const t = translations[lang];

  const handleVoice = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Speech recognition not supported in this browser");
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = lang === 'en' ? 'en-US' : lang === 'es' ? 'es-ES' : 'fr-FR';
    
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setDesc(prev => prev + ' ' + transcript);
    };

    recognition.start();
  };

  const handleSubmit = async () => {
    if (!category) return;

    const incidentData = {
      category,
      description: desc || `Emergency ${category} reported in room ${room}`,
      location: { room, floor: parseInt(room[0]), x: 20 + Math.random() * 60, y: 20 + Math.random() * 60 },
      reportedBy: 'Guest User'
    };

    const incident = await addIncident(incidentData);
    navigate(`/guest/confirmation/${incident.id}`);
  };

  return (
    <div className="min-h-screen bg-transparent px-6 py-12 flex flex-col items-center relative">
      <div className="absolute inset-0 bg-destructive/5 pointer-events-none" />
      
      <div className="w-full max-w-md flex justify-between items-center mb-12 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-destructive flex items-center justify-center text-white font-black shadow-lg shadow-destructive/20">S</div>
          <h2 className="text-sm font-bold tracking-widest text-destructive uppercase">{t.title}</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setLang(l => l === 'en' ? 'es' : l === 'es' ? 'fr' : 'en')} className="gap-2 text-muted-foreground hover:bg-white/5">
          <Languages className="w-3.5 h-3.5" />
          {lang.toUpperCase()}
        </Button>
      </div>

      <motion.div
        whileTap={{ scale: 0.95 }}
        onClick={() => { if(!category) setCategory('other'); }}
        className="relative mb-16 z-10"
      >
        <div className="absolute inset-0 bg-destructive blur-[100px] opacity-20 animate-pulse"></div>
        <div className="w-64 h-64 rounded-full bg-gradient-to-tr from-destructive via-red-500 to-red-400 flex flex-col items-center justify-center border-[12px] border-white/5 critical-pulse shadow-[0_0_50px_rgba(239,68,68,0.4)] relative cursor-pointer">
          <span className="text-7xl font-black text-white tracking-tighter drop-shadow-2xl">{t.sos}</span>
        </div>
      </motion.div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center">
          <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-[0.2em]">{t.sub}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'fire', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10', label: t.fire },
            { id: 'medical', icon: Activity, color: 'text-green-500', bg: 'bg-green-500/10', label: t.medical },
            { id: 'security', icon: ShieldAlert, color: 'text-blue-500', bg: 'bg-blue-500/10', label: t.security },
            { id: 'other', icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: t.other },
          ].map((cat) => (
            <motion.button
              key={cat.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCategory(cat.id as Category)}
              className={`flex flex-col items-center justify-center p-6 rounded-2xl transition-all border duration-200 ${category === cat.id ? 'bg-background border-primary shadow-lg shadow-primary/10' : 'bg-secondary/20 border-border hover:bg-secondary/30'}`}
            >
              <div className={`p-3 rounded-xl ${category === cat.id ? 'bg-primary/10' : 'bg-white/5'} mb-3`}>
                <cat.icon className={`w-6 h-6 ${category === cat.id ? 'text-primary' : cat.color}`} />
              </div>
              <span className={`font-bold text-xs uppercase tracking-wide ${category === cat.id ? 'text-foreground' : 'text-muted-foreground'}`}>{cat.label}</span>
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {category && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6 overflow-hidden bg-secondary/10 border border-border p-6 rounded-3xl backdrop-blur-xl"
            >
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" /> {t.room}
                </label>
                <Input 
                  value={room} 
                  onChange={(e) => setRoom(e.target.value)}
                  className="h-12 text-lg font-bold bg-background border-border focus:border-primary transition-colors text-center font-mono"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">{t.desc}</label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleVoice}
                    className={`gap-1.5 h-7 px-2 text-[10px] font-bold ${isRecording ? 'text-destructive animate-pulse' : 'text-primary'}`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    {t.voice}
                  </Button>
                </div>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl p-4 min-h-24 text-sm font-medium focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-muted-foreground/30"
                  placeholder="Smoking in bathroom, slipping on pool deck, etc."
                />
              </div>

              <Button 
                onClick={handleSubmit}
                className="w-full h-14 text-sm font-black rounded-xl bg-destructive hover:bg-destructive/90 text-white shadow-xl shadow-destructive/20 gap-2 uppercase tracking-[0.2em]"
              >
                <Send className="w-4 h-4" />
                {t.send}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
