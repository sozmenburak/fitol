import { Button } from './ui/button';
import { Clock, X } from 'lucide-react';

export default function AlarmOverlay({ alarm, onDismiss, onSnooze }) {
  if (!alarm) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="alarm-pulse border border-border bg-card rounded-xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
        <div className="text-5xl mb-5">
          {alarm.type === 'wakeup' ? '⏰' : alarm.type === 'meal' ? '🍽' : alarm.type === 'workout' ? '💪' : alarm.type === 'sleep' ? '🌙' : '🔔'}
        </div>

        <p className="text-lg font-semibold text-foreground mb-1">{alarm.label}</p>
        <p className="text-sm text-muted-foreground mb-6">
          {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
        </p>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onSnooze}>
            <Clock size={16} /> 5dk Ertele
          </Button>
          <Button className="flex-1" onClick={onDismiss}>
            <X size={16} /> Kapat
          </Button>
        </div>

        {alarm.penalty && (
          <p className="text-xs text-muted-foreground mt-4">
            Bu alarmı kaçırırsan ceza alırsın.
          </p>
        )}
      </div>
    </div>
  );
}
