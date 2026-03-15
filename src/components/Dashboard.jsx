import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import {
  Flame, Droplets, Dumbbell, Scale, TrendingDown,
  AlertTriangle, Target, Clock, ArrowRight, Waves
} from 'lucide-react';
import { getToday } from '../utils/storage';
import { getTodayExercises, weeklyPlan } from '../data/exercises';

export default function Dashboard({ data, scheduledAlarms, dismissedAlarms }) {
  const [time, setTime] = useState(new Date());
  const today = getToday();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayMeals = data.mealLog[today] || [];
  const totalCalories = todayMeals.reduce((sum, m) => sum + (m.calories * (m.quantity || 1)), 0);
  const totalProtein = todayMeals.reduce((sum, m) => sum + (m.protein * (m.quantity || 1)), 0);
  const totalCarbs = todayMeals.reduce((sum, m) => sum + (m.carbs * (m.quantity || 1)), 0);
  const totalFat = todayMeals.reduce((sum, m) => sum + (m.fat * (m.quantity || 1)), 0);
  const waterToday = data.waterLog[today] || 0;
  const todayWorkout = data.workoutLog[today] || { completed: false, exercises: [] };
  const { plan } = getTodayExercises();
  const latestWeight = data.weightLog.length > 0 ? data.weightLog[data.weightLog.length - 1].weight : data.profile.startWeight;
  const weightLost = data.profile.startWeight - latestWeight;
  const activePenalties = data.penalties.filter(p => !p.resolved);

  const nextAlarm = scheduledAlarms
    .filter(a => !dismissedAlarms.has(a.id))
    .filter(a => {
      const now = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
      return a.time > now;
    })
    .sort((a, b) => a.time.localeCompare(b.time))[0];

  const bmi = (latestWeight / ((data.profile.height / 100) ** 2)).toFixed(1);
  const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

  return (
    <div className="space-y-4">
      {/* Time & Greeting */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {dayNames[time.getDay()]}, {time.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight mt-0.5">
            Merhaba, {data.profile.name}
          </h1>
        </div>
        <div className="text-right">
          <p className="text-3xl font-mono font-light tabular-nums tracking-tighter text-foreground">
            {time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Swimming Day Banner */}
      {plan.swimTime && (
        <div className="flex items-center gap-3 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3">
          <Waves size={16} className="text-blue-400 shrink-0" />
          <div className="flex-1 text-sm">
            <span className="font-medium text-blue-300">Bugün yüzme günü!</span>
            <span className="text-blue-400/70"> — {plan.swimTime} havuzda ol</span>
          </div>
        </div>
      )}

      {/* Penalties Warning */}
      {activePenalties.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <AlertTriangle size={16} className="text-destructive shrink-0" />
          <div className="flex-1 text-sm">
            <span className="font-medium text-destructive">{activePenalties.length} aktif ceza</span>
            <span className="text-muted-foreground"> — {activePenalties[0]?.punishment}</span>
          </div>
        </div>
      )}

      {/* Next Alarm */}
      {nextAlarm && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
          <Clock size={15} className="text-muted-foreground shrink-0" />
          <span className="text-sm text-muted-foreground">Sonraki:</span>
          <span className="text-sm font-medium">{nextAlarm.time}</span>
          <span className="text-sm text-muted-foreground truncate">{nextAlarm.label}</span>
        </div>
      )}

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <Flame size={14} /> Kalori
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-semibold tabular-nums">{totalCalories}</span>
              <span className="text-sm text-muted-foreground">/ {data.dailyTargets.calories}</span>
            </div>
            <Progress value={totalCalories} max={data.dailyTargets.calories} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <Droplets size={14} /> Su
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-semibold tabular-nums">{(waterToday / 1000).toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">/ {(data.dailyTargets.water / 1000)}L</span>
            </div>
            <Progress value={waterToday} max={data.dailyTargets.water} className="mt-3" indicatorClassName="bg-chart-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <Dumbbell size={14} /> Antrenman
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-semibold">
                {todayWorkout.completed ? 'Tamam' : `${todayWorkout.exercises.length} yapıldı`}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate">{plan.focus}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <Scale size={14} /> Kilo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-semibold tabular-nums">{latestWeight}</span>
              <span className="text-sm text-muted-foreground">kg</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {weightLost > 0 ? `${weightLost.toFixed(1)} kg verildi` : 'Başlangıç'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Macros */}
      <Card>
        <CardHeader>
          <CardTitle>Makrolar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { label: 'Protein', value: totalProtein, max: data.dailyTargets.protein, color: 'bg-chart-1' },
              { label: 'Karbonhidrat', value: totalCarbs, max: data.dailyTargets.carbs, color: 'bg-chart-2' },
              { label: 'Yağ', value: totalFat, max: data.dailyTargets.fat, color: 'bg-chart-5' },
            ].map(m => (
              <div key={m.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">{m.label}</span>
                  <span className="tabular-nums font-medium">{Math.round(m.value)}<span className="text-muted-foreground font-normal">/{m.max}g</span></span>
                </div>
                <Progress value={m.value} max={m.max} indicatorClassName={m.color} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Body Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Mevcut', value: `${latestWeight}kg` },
          { label: 'Hedef', value: `${data.profile.targetWeight}kg` },
          { label: 'Verilen', value: `${weightLost.toFixed(1)}kg` },
          { label: 'BMI', value: bmi },
        ].map(s => (
          <Card key={s.label} className="text-center">
            <CardContent className="p-3">
              <p className="text-lg font-semibold tabular-nums">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Weekly Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Haftalık Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1.5">
            {[1, 2, 3, 4, 5, 6, 0].map(day => {
              const p = weeklyPlan[day];
              const isToday = day === time.getDay();
              const dayWorkout = data.workoutLog[getDateForDay(day)] || {};
              return (
                <div
                  key={day}
                  className={`rounded-lg p-2 text-center text-xs transition-colors ${
                    isToday
                      ? 'bg-foreground text-background font-semibold'
                      : dayWorkout.completed
                      ? 'bg-chart-1/10 text-chart-1'
                      : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  <div className="font-medium">{p.name.slice(0, 3)}</div>
                  {dayWorkout.completed && <span className="text-[10px]">✓</span>}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Bugünkü Program</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {scheduledAlarms
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((alarm, i) => {
                const now = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
                const isPast = alarm.time < now;
                const isDismissed = dismissedAlarms.has(alarm.id);
                return (
                  <div key={alarm.id}>
                    <div className={`flex items-center gap-3 py-2 ${isPast ? 'opacity-40' : ''}`}>
                      <span className="font-mono text-xs tabular-nums w-10 text-muted-foreground">{alarm.time}</span>
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isPast && isDismissed ? 'bg-chart-1' : isPast ? 'bg-destructive' : 'bg-muted-foreground'}`} />
                      <span className="text-sm truncate">{alarm.label}</span>
                    </div>
                    {i < scheduledAlarms.length - 1 && <Separator />}
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Quote */}
      <div className="py-6 text-center">
        <p className="text-sm text-muted-foreground italic">"{getQuote()}"</p>
      </div>
    </div>
  );
}

function getDateForDay(targetDay) {
  const today = new Date();
  const diff = targetDay - today.getDay();
  const date = new Date(today);
  date.setDate(date.getDate() + diff);
  return date.toISOString().split('T')[0];
}

function getQuote() {
  const quotes = [
    'Acı geçicidir, bırakmak sonsuzdur.',
    'Bugünkü ter, yarının gücüdür.',
    'Disiplin, motivasyonun bittiği yerde başlar.',
    'Kolay olsaydı, herkes yapardı.',
    'Tek rakibin dünkü kendin.',
    'Rahat bölgenden çık, büyüme orada başlıyor.',
  ];
  const d = new Date();
  return quotes[(d.getDate() + d.getMonth()) % quotes.length];
}
