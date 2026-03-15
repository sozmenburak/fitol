import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Check, Timer, Trophy, ChevronRight, X, Info, Waves, Dumbbell } from 'lucide-react';
import { getTodayExercises, weeklyPlan } from '../data/exercises';
import { getToday } from '../utils/storage';
import { playSuccessSound, playClickSound } from '../utils/alarmSystem';

export default function WorkoutTracker({ data, completeExercise, completeWorkout }) {
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [restTimer, setRestTimer] = useState(null);
  const [restSeconds, setRestSeconds] = useState(0);
  const [timerRef, setTimerRef] = useState(null);
  const [imgErrors, setImgErrors] = useState({});

  const today = getToday();
  const todayWorkout = data.workoutLog[today] || { completed: false, exercises: [] };
  const { plan, exercises: todayExercises } = getTodayExercises();

  const done = todayWorkout.exercises.length;
  const total = todayExercises.length;
  const allDone = done >= total;
  const burnedCal = todayExercises.reduce((s, ex) => {
    if (!todayWorkout.exercises.includes(ex.id)) return s;
    return s + (isDurationBased(ex) ? ex.calories : ex.calories * ex.sets);
  }, 0);

  const startTimer = (secs) => {
    if (timerRef) clearInterval(timerRef);
    setRestSeconds(secs);
    setRestTimer(true);
    const ref = setInterval(() => {
      setRestSeconds(p => {
        if (p <= 1) { clearInterval(ref); setRestTimer(null); playSuccessSound(); return 0; }
        return p - 1;
      });
    }, 1000);
    setTimerRef(ref);
  };

  const selected = todayExercises.find(e => e.id === selectedExercise);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <p className="text-sm text-muted-foreground">{plan.name}</p>
        <h2 className="text-xl font-semibold tracking-tight">{plan.focus}</h2>
      </div>

      {/* Swimming Banner */}
      {plan.swimTime && (
        <div className="flex items-center gap-3 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3">
          <Waves size={20} className="text-blue-400 shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-300">Yüzme Antrenmanı</p>
            <p className="text-xs text-blue-400/80">{plan.swimTime} arası havuzda ol</p>
          </div>
          <Badge className="ml-auto bg-blue-500/20 text-blue-300 border-blue-500/30">{plan.swimTime}</Badge>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-semibold tabular-nums">{done}<span className="text-sm text-muted-foreground font-normal">/{total}</span></p>
            <p className="text-[11px] text-muted-foreground">Egzersiz</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-semibold tabular-nums">~{burnedCal}</p>
            <p className="text-[11px] text-muted-foreground">kcal yakıldı</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-semibold tabular-nums">{todayWorkout.completed ? '✓' : `${total - done}`}</p>
            <p className="text-[11px] text-muted-foreground">{todayWorkout.completed ? 'Bitti' : 'Kalan'}</p>
          </CardContent>
        </Card>
      </div>

      <Progress value={done} max={total} />

      {/* Warmup */}
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3">
        <Info size={14} className="text-muted-foreground shrink-0" />
        <div className="text-sm">
          <span className="text-muted-foreground">Isınma: </span>
          <span>{plan.warmup}</span>
        </div>
      </div>

      {/* Rest Timer */}
      {restTimer && (
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Timer size={16} className="text-muted-foreground animate-pulse" />
              <span className="text-sm text-muted-foreground">Dinlenme süresi</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-mono font-semibold tabular-nums">{restSeconds}<span className="text-sm text-muted-foreground">s</span></span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { if (timerRef) clearInterval(timerRef); setRestTimer(null); }}>
                <X size={14} />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Complete All */}
      {allDone && !todayWorkout.completed && (
        <Button className="w-full h-12 text-base" onClick={() => { completeWorkout(); playSuccessSound(); }}>
          <Trophy size={18} /> Antrenmanı Tamamla
        </Button>
      )}

      {todayWorkout.completed && (
        <div className="rounded-lg border border-chart-1/30 bg-chart-1/5 px-4 py-4 text-center">
          <p className="text-sm font-medium text-chart-1">Bugünkü antrenman tamamlandı. Aferin.</p>
        </div>
      )}

      {/* Exercise Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm overflow-y-auto">
          <div className="max-w-lg mx-auto px-4 py-6">
            {/* Close */}
            <div className="flex justify-end mb-3">
              <Button variant="ghost" size="icon" onClick={() => setSelectedExercise(null)}>
                <X size={18} />
              </Button>
            </div>

            {/* Image */}
            {!imgErrors[selected.id] && (
              <div className="rounded-xl overflow-hidden mb-4 aspect-video bg-secondary">
                <img
                  src={selected.image}
                  alt={selected.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={() => setImgErrors(p => ({ ...p, [selected.id]: true }))}
                />
              </div>
            )}

            {/* Info */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-semibold">{selected.name}</h3>
                <Badge variant={selected.difficulty === 'Kolay' ? 'success' : selected.difficulty === 'Orta' ? 'warning' : 'destructive'}>
                  {selected.difficulty}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{selected.muscle}</p>
            </div>

            {/* Stats */}
            <Card className="mb-4">
              <CardContent className="p-4">
                {isDurationBased(selected) ? (
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-semibold">{selected.reps}</p>
                      <p className="text-xs text-muted-foreground">{isSwimming(selected) ? 'Seans' : 'Süre'}</p>
                    </div>
                    <div>
                      <p className="text-2xl font-semibold">~{selected.calories}</p>
                      <p className="text-xs text-muted-foreground">kcal</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-semibold">{selected.sets}</p>
                      <p className="text-xs text-muted-foreground">Set</p>
                    </div>
                    <div>
                      <p className="text-2xl font-semibold">{selected.reps}</p>
                      <p className="text-xs text-muted-foreground">Tekrar</p>
                    </div>
                    <div>
                      <p className="text-2xl font-semibold">{selected.rest}<span className="text-sm">s</span></p>
                      <p className="text-xs text-muted-foreground">Dinlenme</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Set Tracker (only for multi-set exercises) */}
            {!isDurationBased(selected) && (
              <div className="flex gap-2 mb-4 flex-wrap">
                {Array.from({ length: selected.sets }).map((_, i) => (
                  <div key={i} className="flex-1 min-w-[60px] rounded-lg bg-secondary py-3 text-center">
                    <p className="text-sm font-medium">Set {i + 1}</p>
                    <p className="text-xs text-muted-foreground">{selected.reps}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Form Tips */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Doğru Form</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {selected.form.map((tip, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="text-muted-foreground tabular-nums shrink-0 w-4 text-right">{i + 1}.</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2">
              {!todayWorkout.exercises.includes(selected.id) && (
                <Button className="flex-1 h-11" onClick={() => { completeExercise(selected.id); playSuccessSound(); }}>
                  <Check size={16} /> Tamamla
                </Button>
              )}
              {selected.rest > 0 && (
                <Button variant="outline" className="flex-1 h-11" onClick={() => { startTimer(selected.rest); playClickSound(); }}>
                  <Timer size={16} /> {selected.rest}s Dinlen
                </Button>
              )}
            </div>

            {todayWorkout.exercises.includes(selected.id) && (
              <p className="text-center text-sm text-chart-1 mt-3 font-medium">Bu egzersiz tamamlandı ✓</p>
            )}
          </div>
        </div>
      )}

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 gap-2">
        {todayExercises.map((ex, idx) => {
          const isDone = todayWorkout.exercises.includes(ex.id);
          return (
            <div
              key={ex.id}
              onClick={() => setSelectedExercise(ex.id)}
              className={`group flex items-center gap-3 rounded-xl border p-2 pr-4 cursor-pointer transition-colors ${
                isDone
                  ? 'border-chart-1/20 bg-chart-1/3'
                  : 'border-border bg-card hover:bg-accent'
              }`}
            >
              {/* Thumbnail */}
              <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-secondary shrink-0">
                {!imgErrors[ex.id] ? (
                  <img
                    src={ex.image}
                    alt={ex.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={() => setImgErrors(p => ({ ...p, [ex.id]: true }))}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-lg">
                    💪
                  </div>
                )}
                {isDone && (
                  <div className="absolute inset-0 bg-chart-1/60 flex items-center justify-center">
                    <Check size={20} className="text-background" strokeWidth={3} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`text-sm font-medium ${isDone ? 'text-muted-foreground line-through' : ''}`}>
                    {ex.name}
                  </span>
                  <Badge
                    variant={ex.difficulty === 'Kolay' ? 'success' : ex.difficulty === 'Orta' ? 'warning' : 'destructive'}
                    className="text-[10px] px-1.5 py-0"
                  >
                    {ex.difficulty}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {isDurationBased(ex) ? ex.reps : `${ex.sets}×${ex.reps}`} · {ex.muscle}
                </p>
              </div>

              <ChevronRight size={16} className="text-muted-foreground shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </div>
          );
        })}
      </div>

      {/* Weekly Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Haftalık Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {[1, 2, 3, 4, 5, 6, 0].map((day, i, arr) => {
              const p = weeklyPlan[day];
              const isToday = day === new Date().getDay();
              return (
                <div key={day}>
                  <div className={`flex items-center gap-2 py-2.5 ${isToday ? '' : 'text-muted-foreground'}`}>
                    <span className={`text-sm w-10 font-mono tabular-nums shrink-0 ${isToday ? 'font-semibold text-foreground' : ''}`}>
                      {p.name.slice(0, 3)}
                    </span>
                    <Separator orientation="vertical" className="h-4" />
                    {p.swimTime && <Waves size={13} className="text-blue-400 shrink-0" />}
                    <span className={`text-sm flex-1 truncate ${p.isRest ? 'italic' : ''} ${isToday ? 'text-foreground font-medium' : ''}`}>
                      {p.focus}
                    </span>
                    {isToday && <Badge className="text-[10px] shrink-0">Bugün</Badge>}
                  </div>
                  {i < arr.length - 1 && <Separator />}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function isSwimming(ex) {
  return ex.id.startsWith('swim_');
}

function isDurationBased(ex) {
  return ex.sets === 1 && ex.rest === 0;
}
