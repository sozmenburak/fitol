import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import {
  User, Target, Clock, ChevronRight, ChevronLeft,
  Check, Dumbbell, Droplets, Flame, Wheat, Beef,
  Sparkles, RotateCcw,
} from 'lucide-react';
import {
  getRecommendedTargets, getGoalLabel, ACTIVITY_LABELS,
} from '../utils/calorieCalculator';

const STEPS = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'targets', label: 'Hedefler', icon: Target },
  { id: 'schedule', label: 'Zamanlama', icon: Clock },
];

export default function SetupWizard({ onComplete }) {
  const [step, setStep] = useState(0);

  const [profile, setProfile] = useState({
    name: '',
    gender: '',
    age: 25,
    height: 175,
    startWeight: 80,
    targetWeight: 70,
    activityLevel: 'moderate',
  });

  const [targets, setTargets] = useState({
    calories: 2400,
    protein: 180,
    carbs: 250,
    fat: 70,
    water: 3000,
  });

  const [recommended, setRecommended] = useState(null);
  const [customized, setCustomized] = useState(false);

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

  useEffect(() => {
    const rec = getRecommendedTargets(profile);
    if (rec) {
      setRecommended(rec);
      if (!customized) {
        setTargets(t => ({
          ...t,
          calories: rec.calories,
          protein: rec.protein,
          carbs: rec.carbs,
          fat: rec.fat,
        }));
      }
    }
  }, [profile, customized]);

  const canNext = () => {
    if (step === 0) {
      return profile.name.trim().length > 0
        && profile.gender !== ''
        && profile.age > 0
        && profile.height > 0
        && profile.startWeight > 0;
    }
    return true;
  };

  const handleTargetChange = (field, value) => {
    setCustomized(true);
    setTargets(t => ({ ...t, [field]: value }));
  };

  const resetToRecommended = () => {
    if (!recommended) return;
    setCustomized(false);
    setTargets(t => ({
      ...t,
      calories: recommended.calories,
      protein: recommended.protein,
      carbs: recommended.carbs,
      fat: recommended.fat,
    }));
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

        {/* Step 0: Profile */}
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

                {/* Gender */}
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Cinsiyet</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setProfile(p => ({ ...p, gender: 'male' }))}
                      className={`flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${
                        profile.gender === 'male'
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border bg-secondary/30 text-muted-foreground hover:border-foreground/30'
                      }`}
                    >
                      <span className="text-base">♂</span> Erkek
                    </button>
                    <button
                      type="button"
                      onClick={() => setProfile(p => ({ ...p, gender: 'female' }))}
                      className={`flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${
                        profile.gender === 'female'
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border bg-secondary/30 text-muted-foreground hover:border-foreground/30'
                      }`}
                    >
                      <span className="text-base">♀</span> Kadın
                    </button>
                  </div>
                </div>

                {/* Age */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Yaş</label>
                  <Input
                    type="number"
                    min={10}
                    max={100}
                    value={profile.age}
                    onChange={e => setProfile(p => ({ ...p, age: +e.target.value }))}
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

                {/* Activity Level */}
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Aktivite Seviyesi</label>
                  <div className="space-y-2">
                    {Object.entries(ACTIVITY_LABELS).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setProfile(p => ({ ...p, activityLevel: key }))}
                        className={`w-full text-left rounded-lg border px-3 py-2.5 text-sm transition-all ${
                          profile.activityLevel === key
                            ? 'border-foreground bg-foreground/5 font-medium text-foreground'
                            : 'border-border text-muted-foreground hover:border-foreground/30'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
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
                    {profile.height > 0 && profile.startWeight < profile.targetWeight && (
                      <span className="ml-2">
                        · Hedef: {(profile.targetWeight - profile.startWeight).toFixed(1)} kg almak
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Targets */}
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
                {/* Recommended banner */}
                {recommended && (
                  <div className="rounded-lg border border-foreground/10 bg-foreground/5 p-3 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                      <Sparkles size={12} />
                      Sana Özel Hesaplama
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[11px] text-muted-foreground">
                      <div>
                        BMR: <span className="text-foreground font-medium">{recommended.bmr}</span> kcal
                      </div>
                      <div>
                        TDEE: <span className="text-foreground font-medium">{recommended.tdee}</span> kcal
                      </div>
                      <div>
                        Hedef: <span className="text-foreground font-medium">
                          {getGoalLabel(profile.startWeight, profile.targetWeight)}
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Mifflin-St Jeor formülüne göre {profile.gender === 'male' ? 'erkek' : 'kadın'}, {profile.age} yaş,
                      {' '}{profile.height}cm, {profile.startWeight}kg profili için hesaplandı.
                    </p>
                  </div>
                )}

                {/* Calories */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Flame size={12} /> Kalori (kcal)
                    </label>
                    {recommended && (
                      <span className="text-[10px] text-muted-foreground/70">
                        Önerilen: {recommended.calories}
                      </span>
                    )}
                  </div>
                  <Input
                    type="number"
                    value={targets.calories}
                    onChange={e => handleTargetChange('calories', +e.target.value)}
                  />
                </div>

                <Separator />

                {/* Macros header with reset */}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Makrolar</p>
                  {customized && recommended && (
                    <button
                      type="button"
                      onClick={resetToRecommended}
                      className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <RotateCcw size={10} /> Önerilene dön
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs text-muted-foreground flex items-center gap-1">
                        <Beef size={11} /> Protein (g)
                      </label>
                    </div>
                    <Input
                      type="number"
                      value={targets.protein}
                      onChange={e => handleTargetChange('protein', +e.target.value)}
                    />
                    {recommended && (
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">Ön: {recommended.protein}g</p>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs text-muted-foreground flex items-center gap-1">
                        <Wheat size={11} /> Karb. (g)
                      </label>
                    </div>
                    <Input
                      type="number"
                      value={targets.carbs}
                      onChange={e => handleTargetChange('carbs', +e.target.value)}
                    />
                    {recommended && (
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">Ön: {recommended.carbs}g</p>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs text-muted-foreground flex items-center gap-1">
                        <Droplets size={11} /> Yağ (g)
                      </label>
                    </div>
                    <Input
                      type="number"
                      value={targets.fat}
                      onChange={e => handleTargetChange('fat', +e.target.value)}
                    />
                    {recommended && (
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">Ön: {recommended.fat}g</p>
                    )}
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

        {/* Step 2: Schedule */}
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
