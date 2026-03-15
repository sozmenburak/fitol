import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import {
  User, Target, Clock, ChevronRight, ChevronLeft,
  Check, Dumbbell, Droplets, Flame, Wheat, Beef
} from 'lucide-react';

const STEPS = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'targets', label: 'Hedefler', icon: Target },
  { id: 'schedule', label: 'Zamanlama', icon: Clock },
];

export default function SetupWizard({ onComplete }) {
  const [step, setStep] = useState(0);

  const [profile, setProfile] = useState({
    name: '',
    height: 175,
    startWeight: 80,
    targetWeight: 70,
  });

  const [targets, setTargets] = useState({
    calories: 2400,
    protein: 180,
    carbs: 250,
    fat: 70,
    water: 3000,
  });

  const [settings, setSettings] = useState({
    wakeUpTime: '07:00',
    sleepTime: '23:00',
    workoutTime: '09:00',
    mealTimes: {
      breakfast: '08:00',
      snack1: '10:30',
      lunch: '12:30',
      snack2: '15:30',
      dinner: '18:30',
      snack3: '20:30',
    },
  });

  const canNext = () => {
    if (step === 0) return profile.name.trim().length > 0 && profile.height > 0;
    return true;
  };

  const handleFinish = () => {
    onComplete({
      profile: {
        ...profile,
        startDate: new Date().toISOString().split('T')[0],
      },
      dailyTargets: targets,
      settings: {
        ...settings,
        alarmSound: true,
        alarmVolume: 100,
      },
    });
  };

  const mealLabels = {
    breakfast: 'Kahvaltı',
    snack1: 'Ara Öğün 1',
    lunch: 'Öğle',
    snack2: 'Ara Öğün 2',
    dinner: 'Akşam',
    snack3: 'Gece',
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-1">Fitol</h1>
          <p className="text-sm text-muted-foreground">Kişisel fitness takip asistanın</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = i < step;
            const active = i === step;
            return (
              <div key={s.id} className="flex items-center gap-2">
                {i > 0 && (
                  <div className={`w-8 h-px ${done ? 'bg-foreground' : 'bg-border'}`} />
                )}
                <button
                  onClick={() => i < step && setStep(i)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    active
                      ? 'bg-foreground text-background'
                      : done
                        ? 'bg-secondary text-foreground cursor-pointer'
                        : 'bg-secondary/50 text-muted-foreground'
                  }`}
                >
                  {done ? <Check size={12} /> : <Icon size={12} />}
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Step content */}
        {step === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={16} />
                Profil Bilgilerin
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">İsim</label>
                  <Input
                    placeholder="Adını gir"
                    value={profile.name}
                    onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Boy (cm)</label>
                  <Input
                    type="number"
                    value={profile.height}
                    onChange={e => setProfile(p => ({ ...p, height: +e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Mevcut Kilo (kg)</label>
                    <Input
                      type="number"
                      value={profile.startWeight}
                      onChange={e => setProfile(p => ({ ...p, startWeight: +e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Hedef Kilo (kg)</label>
                    <Input
                      type="number"
                      value={profile.targetWeight}
                      onChange={e => setProfile(p => ({ ...p, targetWeight: +e.target.value }))}
                    />
                  </div>
                </div>

                <div className="rounded-lg bg-secondary/50 p-3 mt-2">
                  <p className="text-xs text-muted-foreground">
                    BMI: <span className="text-foreground font-medium">
                      {profile.height > 0
                        ? (profile.startWeight / ((profile.height / 100) ** 2)).toFixed(1)
                        : '—'}
                    </span>
                    {profile.height > 0 && profile.startWeight > profile.targetWeight && (
                      <span className="ml-2">
                        · Hedef: {(profile.startWeight - profile.targetWeight).toFixed(1)} kg vermek
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target size={16} />
                Günlük Hedefler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    <Flame size={12} /> Kalori (kcal)
                  </label>
                  <Input
                    type="number"
                    value={targets.calories}
                    onChange={e => setTargets(t => ({ ...t, calories: +e.target.value }))}
                  />
                </div>
                <Separator />
                <p className="text-xs text-muted-foreground">Makrolar</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                      <Beef size={11} /> Protein (g)
                    </label>
                    <Input
                      type="number"
                      value={targets.protein}
                      onChange={e => setTargets(t => ({ ...t, protein: +e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                      <Wheat size={11} /> Karb. (g)
                    </label>
                    <Input
                      type="number"
                      value={targets.carbs}
                      onChange={e => setTargets(t => ({ ...t, carbs: +e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                      <Droplets size={11} /> Yağ (g)
                    </label>
                    <Input
                      type="number"
                      value={targets.fat}
                      onChange={e => setTargets(t => ({ ...t, fat: +e.target.value }))}
                    />
                  </div>
                </div>
                <Separator />
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    <Droplets size={12} /> Günlük Su (ml)
                  </label>
                  <Input
                    type="number"
                    step={250}
                    value={targets.water}
                    onChange={e => setTargets(t => ({ ...t, water: +e.target.value }))}
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {(targets.water / 250).toFixed(0)} bardak · {(targets.water / 1000).toFixed(1)}L
                  </p>
                </div>

                <div className="rounded-lg bg-secondary/50 p-3">
                  <p className="text-xs text-muted-foreground">
                    Toplam makro kalori:{' '}
                    <span className="text-foreground font-medium">
                      {targets.protein * 4 + targets.carbs * 4 + targets.fat * 9} kcal
                    </span>
                    <span className="ml-1">
                      ({targets.calories > 0
                        ? Math.round(((targets.protein * 4 + targets.carbs * 4 + targets.fat * 9) / targets.calories) * 100)
                        : 0}% hedef)
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock size={16} />
                Zamanlama
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Uyanma Saati</label>
                    <Input
                      type="time"
                      value={settings.wakeUpTime}
                      onChange={e => setSettings(s => ({ ...s, wakeUpTime: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Yatma Saati</label>
                    <Input
                      type="time"
                      value={settings.sleepTime}
                      onChange={e => setSettings(s => ({ ...s, sleepTime: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    <Dumbbell size={12} /> Antrenman Saati
                  </label>
                  <Input
                    type="time"
                    value={settings.workoutTime}
                    onChange={e => setSettings(s => ({ ...s, workoutTime: e.target.value }))}
                  />
                </div>
                <Separator />
                <p className="text-xs text-muted-foreground">Öğün Saatleri</p>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(settings.mealTimes).map(([key, time]) => (
                    <div key={key}>
                      <label className="text-[11px] text-muted-foreground mb-1 block">{mealLabels[key]}</label>
                      <Input
                        type="time"
                        value={time}
                        onChange={e => setSettings(s => ({
                          ...s,
                          mealTimes: { ...s.mealTimes, [key]: e.target.value },
                        }))}
                        className="text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-4">
          {step > 0 ? (
            <Button variant="outline" onClick={() => setStep(s => s - 1)}>
              <ChevronLeft size={14} /> Geri
            </Button>
          ) : (
            <div />
          )}

          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(s => s + 1)} disabled={!canNext()}>
              İleri <ChevronRight size={14} />
            </Button>
          ) : (
            <Button onClick={handleFinish}>
              <Check size={14} /> Başla
            </Button>
          )}
        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-6">
          Tüm veriler cihazında localStorage'da saklanır.
        </p>
      </div>
    </div>
  );
}
