import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { Save, Volume2, RotateCcw, Target, Sparkles, Calculator } from 'lucide-react';
import { playAlarmSound, stopAlarm, playClickSound } from '../utils/alarmSystem';
import { getRecommendedTargets, getGoalLabel, ACTIVITY_LABELS } from '../utils/calorieCalculator';

export default function Settings({ data, updateSettings, updateData }) {
  const [profile, setProfile] = useState(data.profile);
  const [targets, setTargets] = useState(data.dailyTargets);
  const [testing, setTesting] = useState(false);

  const recommended = getRecommendedTargets(profile);

  const handleSave = () => {
    updateData(prev => ({ ...prev, profile, dailyTargets: targets }));
    playClickSound();
  };

  const applyRecommended = () => {
    if (!recommended) return;
    setTargets(t => ({
      ...t,
      calories: recommended.calories,
      protein: recommended.protein,
      carbs: recommended.carbs,
      fat: recommended.fat,
    }));
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

            {/* Gender */}
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Cinsiyet</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setProfile(p => ({ ...p, gender: 'male' }))}
                  className={`rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all ${
                    profile.gender === 'male'
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border text-muted-foreground hover:border-foreground/30'
                  }`}
                >
                  ♂ Erkek
                </button>
                <button
                  type="button"
                  onClick={() => setProfile(p => ({ ...p, gender: 'female' }))}
                  className={`rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all ${
                    profile.gender === 'female'
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border text-muted-foreground hover:border-foreground/30'
                  }`}
                >
                  ♀ Kadın
                </button>
              </div>
            </div>

            {/* Age */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Yaş</label>
              <Input type="number" min={10} max={100} value={profile.age} onChange={e => setProfile(p => ({ ...p, age: +e.target.value }))} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Boy (cm)</label>
                <Input type="number" value={profile.height} onChange={e => setProfile(p => ({ ...p, height: +e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Mevcut Kilo (kg)</label>
                <Input type="number" value={profile.startWeight} onChange={e => setProfile(p => ({ ...p, startWeight: +e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Hedef Kilo (kg)</label>
              <Input type="number" value={profile.targetWeight} onChange={e => setProfile(p => ({ ...p, targetWeight: +e.target.value }))} />
            </div>

            {/* Activity Level */}
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Aktivite Seviyesi</label>
              <select
                value={profile.activityLevel || 'moderate'}
                onChange={e => setProfile(p => ({ ...p, activityLevel: e.target.value }))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {Object.entries(ACTIVITY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <Button className="w-full" onClick={handleSave}><Save size={14} /> Kaydet</Button>
          </div>
        </CardContent>
      </Card>

      {/* Daily Targets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5"><Target size={14} /> Günlük Hedefler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Recommendation info */}
            {recommended && (
              <div className="rounded-lg border border-foreground/10 bg-foreground/5 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                    <Sparkles size={12} />
                    Önerilen Değerler
                  </div>
                  <button
                    type="button"
                    onClick={applyRecommended}
                    className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Calculator size={10} /> Önerileni uygula
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] text-muted-foreground">
                  <div>BMR: <span className="text-foreground font-medium">{recommended.bmr}</span> kcal</div>
                  <div>TDEE: <span className="text-foreground font-medium">{recommended.tdee}</span> kcal</div>
                  <div>Kalori: <span className="text-foreground font-medium">{recommended.calories}</span> kcal</div>
                  <div>Hedef: <span className="text-foreground font-medium">{getGoalLabel(profile.startWeight, profile.targetWeight)}</span></div>
                </div>
                <div className="flex gap-3 text-[11px] text-muted-foreground">
                  <span>P: <span className="text-foreground">{recommended.protein}g</span></span>
                  <span>K: <span className="text-foreground">{recommended.carbs}g</span></span>
                  <span>Y: <span className="text-foreground">{recommended.fat}g</span></span>
                </div>
              </div>
            )}

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
