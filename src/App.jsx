import { useState, useEffect } from 'react';
import { cn } from './lib/utils';
import {
  LayoutDashboard, Utensils, Dumbbell, Scale, Moon,
  Skull, Settings as SettingsIcon, Menu, X
} from 'lucide-react';
import { useAppData } from './hooks/useAppData';
import { useAlarmScheduler } from './hooks/useAlarmScheduler';
import AlarmOverlay from './components/AlarmOverlay';
import SetupWizard from './components/SetupWizard';
import Dashboard from './components/Dashboard';
import MealTracker from './components/MealTracker';
import WorkoutTracker from './components/WorkoutTracker';
import WeightTracker from './components/WeightTracker';
import SleepManager from './components/SleepManager';
import PenaltySystem from './components/PenaltySystem';
import Settings from './components/Settings';

const nav = [
  { id: 'dashboard', label: 'Panel', icon: LayoutDashboard },
  { id: 'meals', label: 'Beslenme', icon: Utensils },
  { id: 'workout', label: 'Antrenman', icon: Dumbbell },
  { id: 'weight', label: 'Kilo', icon: Scale },
  { id: 'sleep', label: 'Uyku', icon: Moon },
  { id: 'penalty', label: 'Ceza', icon: Skull },
  { id: 'settings', label: 'Ayarlar', icon: SettingsIcon },
];

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [audioOk, setAudioOk] = useState(false);

  const appData = useAppData();
  const { data } = appData;

  const handleSetupComplete = (setupData) => {
    appData.updateData(prev => ({
      ...prev,
      setupComplete: true,
      profile: setupData.profile,
      dailyTargets: setupData.dailyTargets,
      settings: { ...prev.settings, ...setupData.settings },
    }));
  };

  const alarm = useAlarmScheduler(data.settings, appData.addPenalty);
  const scheduled = alarm.getScheduledAlarms();

  useEffect(() => {
    const init = () => {
      if (!audioOk) {
        const c = new (window.AudioContext || window.webkitAudioContext)();
        c.resume();
        setAudioOk(true);
      }
    };
    document.addEventListener('click', init, { once: true });
    return () => document.removeEventListener('click', init);
  }, [audioOk]);

  const penalties = data.penalties.filter(p => !p.resolved).length;

  const content = () => {
    switch (tab) {
      case 'dashboard': return <Dashboard data={data} scheduledAlarms={scheduled} dismissedAlarms={alarm.dismissedAlarms} />;
      case 'meals': return <MealTracker data={data} addMeal={appData.addMeal} removeMeal={appData.removeMeal} addWater={appData.addWater} />;
      case 'workout': return <WorkoutTracker data={data} completeExercise={appData.completeExercise} completeWorkout={appData.completeWorkout} />;
      case 'weight': return <WeightTracker data={data} logWeight={appData.logWeight} />;
      case 'sleep': return <SleepManager data={data} logSleep={appData.logSleep} updateSettings={appData.updateSettings} />;
      case 'penalty': return <PenaltySystem data={data} addPenalty={appData.addPenalty} resolvePenalty={appData.resolvePenalty} />;
      case 'settings': return <Settings data={data} updateSettings={appData.updateSettings} updateData={appData.updateData} />;
    }
  };

  if (!data.setupComplete) {
    return <SetupWizard onComplete={handleSetupComplete} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <AlarmOverlay alarm={alarm.activeAlarm} onDismiss={alarm.dismissAlarm} onSnooze={alarm.snoozeAlarm} />

      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-56 border-r border-sidebar-border bg-sidebar fixed h-full z-40">
        <div className="flex items-center gap-2.5 px-5 h-14 border-b border-sidebar-border">
          <span className="text-sm font-semibold tracking-tight">Fitol</span>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {nav.map(item => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm cursor-pointer transition-colors',
                  active
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                )}
              >
                <Icon size={16} />
                {item.label}
                {item.id === 'penalty' && penalties > 0 && (
                  <span className="ml-auto text-[10px] bg-destructive text-destructive-foreground w-4 h-4 rounded-full flex items-center justify-center font-medium">
                    {penalties}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-5 py-4 border-t border-sidebar-border">
          <p className="text-[11px] text-sidebar-muted leading-relaxed">
            Disiplin, motivasyonun bittiği yerde başlar.
          </p>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 inset-x-0 h-12 bg-sidebar border-b border-sidebar-border z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tracking-tight">Fitol</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="cursor-pointer p-1">
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden fixed top-12 inset-x-0 bg-sidebar border-b border-sidebar-border z-40 px-3 py-2">
          {nav.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => { setTab(item.id); setMobileOpen(false); }}
                className={cn(
                  'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm cursor-pointer',
                  tab === item.id ? 'bg-sidebar-accent font-medium' : 'text-sidebar-muted'
                )}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-sidebar border-t border-sidebar-border z-40 flex">
        {nav.slice(0, 5).map(item => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={cn(
                'flex-1 flex flex-col items-center gap-0.5 py-2 cursor-pointer transition-colors',
                active ? 'text-foreground' : 'text-sidebar-muted'
              )}
            >
              <Icon size={18} />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main */}
      <main className="flex-1 md:ml-56 mt-12 md:mt-0 mb-14 md:mb-0">
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-6">
          {content()}
        </div>
      </main>
    </div>
  );
}
