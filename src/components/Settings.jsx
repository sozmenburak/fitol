import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { Save, Volume2, RotateCcw, Target } from 'lucide-react';
import { playAlarmSound, stopAlarm, playClickSound } from '../utils/alarmSystem';

export default function Settings({ data, updateSettings, updateData }) {
  const [profile, setProfile] = useState(data.profile);
  const [targets, setTargets] = useState(data.dailyTargets);
  const [testing, setTesting] = useState(false);

  const handleSave = () => {
    updateData(prev => ({ ...prev, profile, dailyTargets: targets }));
    playClickSound();
  };

  const testSound = (type) => {
    if (testing) { stopAlarm(); setTesting(false); }
    else {
      playAlarmSound(type, data.settings.alarmVolume / 100);
      setTesting(true);
      setTimeout(() => { stopAlarm(); setTesting(false); }, 4000);
    }
  };

  const mealLabels = { breakfast: 'Kahvaltı', snack1: 'Ara Öğün 1', lunch: 'Öğle', snack2: 'Ara Öğün 2', dinner: 'Akşam', snack3: 'Gece' };

  return (
    <div className="space-y-4">
      {/* Profile */}
      <Card>
        <CardHeader><CardTitle>Profil</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">İsim</label>
              <Input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Boy (cm)</label>
                <Input type="number" value={profile.height} onChange={e => setProfile(p => ({ ...p, height: +e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Başlangıç Kilo (kg)</label>
                <Input type="number" value={profile.startWeight} onChange={e => setProfile(p => ({ ...p, startWeight: +e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Hedef Kilo (kg)</label>
              <Input type="number" value={profile.targetWeight} onChange={e => setProfile(p => ({ ...p, targetWeight: +e.target.value }))} />
            </div>
            <Button className="w-full" onClick={handleSave}><Save size={14} /> Kaydet</Button>
          </div>
        </CardContent>
      </Card>

      {/* Daily Targets */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-1.5"><Target size={14} /> Günlük Hedefler</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Kalori (kcal)</label>
              <Input type="number" value={targets.calories} onChange={e => setTargets(t => ({ ...t, calories: +e.target.value }))} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Protein (g)</label>
                <Input type="number" value={targets.protein} onChange={e => setTargets(t => ({ ...t, protein: +e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Karb. (g)</label>
                <Input type="number" value={targets.carbs} onChange={e => setTargets(t => ({ ...t, carbs: +e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Yağ (g)</label>
                <Input type="number" value={targets.fat} onChange={e => setTargets(t => ({ ...t, fat: +e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Su (ml)</label>
              <Input type="number" step={250} value={targets.water} onChange={e => setTargets(t => ({ ...t, water: +e.target.value }))} />
            </div>
            <Button className="w-full" onClick={handleSave}><Save size={14} /> Kaydet</Button>
          </div>
        </CardContent>
      </Card>

      {/* Schedule */}
      <Card>
        <CardHeader><CardTitle>Zamanlama</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Uyanma</label>
                <Input type="time" value={data.settings.wakeUpTime} onChange={e => updateSettings({ wakeUpTime: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Yatma</label>
                <Input type="time" value={data.settings.sleepTime} onChange={e => updateSettings({ sleepTime: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Antrenman</label>
              <Input type="time" value={data.settings.workoutTime} onChange={e => updateSettings({ workoutTime: e.target.value })} />
            </div>
            <Separator />
            <p className="text-xs text-muted-foreground">Öğün Saatleri</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(data.settings.mealTimes).map(([key, time]) => (
                <div key={key}>
                  <label className="text-[11px] text-muted-foreground mb-1 block">{mealLabels[key]}</label>
                  <Input
                    type="time" value={time}
                    onChange={e => updateSettings({ mealTimes: { ...data.settings.mealTimes, [key]: e.target.value } })}
                    className="text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sound */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-1.5"><Volume2 size={14} /> Ses</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Alarm Sesi</span>
              <button
                onClick={() => updateSettings({ alarmSound: !data.settings.alarmSound })}
                className={`w-10 h-5 rounded-full transition-colors cursor-pointer ${data.settings.alarmSound ? 'bg-foreground' : 'bg-secondary'}`}
              >
                <div className={`w-4 h-4 bg-background rounded-full transition-transform mx-0.5 ${data.settings.alarmSound ? 'translate-x-5' : ''}`} />
              </button>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Seviye</span>
                <span className="tabular-nums">{data.settings.alarmVolume}%</span>
              </div>
              <input
                type="range" min="0" max="100"
                value={data.settings.alarmVolume}
                onChange={e => updateSettings({ alarmVolume: +e.target.value })}
                className="w-full accent-foreground"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[{ t: 'wakeup', l: 'Uyanma' }, { t: 'meal', l: 'Öğün' }, { t: 'workout', l: 'Antrenman' }, { t: 'penalty', l: 'Ceza' }].map(s => (
                <Button key={s.t} variant="outline" size="sm" onClick={() => testSound(s.t)}>{s.l}</Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger */}
      <Card className="border-destructive/20">
        <CardHeader><CardTitle className="flex items-center gap-1.5 text-destructive"><RotateCcw size={14} /> Sıfırla</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">Tüm verileri siler. Bu işlem geri alınamaz.</p>
          <Button
            variant="destructive" size="sm"
            onClick={() => { if (confirm('Tüm veriler silinecek. Emin misin?')) { localStorage.clear(); location.reload(); } }}
          >
            Verileri Sil
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
