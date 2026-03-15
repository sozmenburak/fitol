import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Plus, TrendingDown, TrendingUp, ArrowDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { playSuccessSound } from '../utils/alarmSystem';

export default function WeightTracker({ data, logWeight }) {
  const [newWeight, setNewWeight] = useState('');

  const weightLog = [...data.weightLog].sort((a, b) => a.date.localeCompare(b.date));
  const latest = weightLog.length > 0 ? weightLog[weightLog.length - 1].weight : data.profile.startWeight;
  const lost = data.profile.startWeight - latest;
  const remaining = latest - data.profile.targetWeight;
  const progress = lost / (data.profile.startWeight - data.profile.targetWeight) * 100;

  const heightM = data.profile.height / 100;
  const heightSq = heightM * heightM;
  const bmi = latest / heightSq;
  const bmiDisplay = bmi.toFixed(1);

  const bmiRanges = getBmiRanges(heightSq);
  const bmiCategory = bmi < 18.5 ? 0 : bmi < 25 ? 1 : bmi < 30 ? 2 : 3;
  const bmiLabels = ['Zayıf', 'Normal', 'Kilolu', 'Obez'];
  const bmiColors = ['text-blue-400', 'text-emerald-400', 'text-yellow-400', 'text-red-400'];

  const chartData = weightLog.map(w => ({
    date: new Date(w.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
    kg: w.weight,
  }));

  const weeklyChange = weightLog.length >= 2
    ? (weightLog[weightLog.length - 1].weight - weightLog[Math.max(0, weightLog.length - 7)].weight).toFixed(1)
    : '0';

  const handleLog = () => {
    const w = parseFloat(newWeight);
    if (w > 40 && w < 200) { logWeight(w); setNewWeight(''); playSuccessSound(); }
  };

  const bmiBarMin = 15;
  const bmiBarMax = 40;
  const bmiBarRange = bmiBarMax - bmiBarMin;
  const indicatorPos = Math.max(0, Math.min(100, ((bmi - bmiBarMin) / bmiBarRange) * 100));

  const segmentWidths = [
    ((18.5 - bmiBarMin) / bmiBarRange) * 100,
    ((25 - 18.5) / bmiBarRange) * 100,
    ((30 - 25) / bmiBarRange) * 100,
    ((bmiBarMax - 30) / bmiBarRange) * 100,
  ];

  return (
    <div className="space-y-4">
      {/* Input */}
      <Card>
        <CardHeader>
          <CardTitle>Kilo Kaydet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="number" value={newWeight} onChange={e => setNewWeight(e.target.value)}
              placeholder="Örn: 92.5" step="0.1" min="40" max="200"
              className="flex-1"
              onKeyDown={e => e.key === 'Enter' && handleLog()}
            />
            <Button onClick={handleLog}><Plus size={16} /> Kaydet</Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Her sabah aç karnına aynı saatte tartıl.</p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Mevcut', value: `${latest} kg` },
          { label: 'Hedef', value: `${data.profile.targetWeight} kg` },
          { label: 'Verilen', value: `${lost.toFixed(1)} kg` },
          { label: 'Haftalık', value: `${weeklyChange > 0 ? '+' : ''}${weeklyChange} kg` },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-xl font-semibold tabular-nums mt-0.5">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Hedefe İlerleme</CardTitle>
            <span className="text-sm font-medium tabular-nums">{Math.max(0, Math.min(100, progress)).toFixed(0)}%</span>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={Math.max(0, progress)} max={100} className="mb-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{data.profile.startWeight} kg</span>
            <span>{remaining.toFixed(1)} kg kaldı</span>
            <span>{data.profile.targetWeight} kg</span>
          </div>
        </CardContent>
      </Card>

      {/* BMI */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Vücut Kitle İndeksi (BMI)</CardTitle>
            <Badge variant="outline" className="text-xs">{data.profile.height} cm</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-4xl font-semibold tabular-nums">{bmiDisplay}</span>
            <span className={`text-sm font-medium ${bmiColors[bmiCategory]}`}>{bmiLabels[bmiCategory]}</span>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            {bmiCategory === 1
              ? 'Normal aralıktasın, hedefine devam et!'
              : bmiCategory === 2
              ? `Normal BMI için ${(latest - bmiRanges[1].maxKg).toFixed(1)} kg vermen gerekiyor`
              : bmiCategory === 0
              ? 'Dikkat: Çok düşük kilodasın'
              : `Normal BMI için ${(latest - bmiRanges[1].maxKg).toFixed(1)} kg vermen gerekiyor`
            }
          </p>

          {/* BMI Bar */}
          <div className="relative mb-1">
            <div
              className="absolute -top-5 flex flex-col items-center transition-all duration-300"
              style={{ left: `${indicatorPos}%`, transform: 'translateX(-50%)' }}
            >
              <span className="text-[10px] font-medium tabular-nums">{bmiDisplay}</span>
              <ArrowDown size={10} className={bmiColors[bmiCategory]} />
            </div>
          </div>

          <div className="h-3 rounded-full overflow-hidden flex">
            <div className="bg-blue-500/70 h-full" style={{ width: `${segmentWidths[0]}%` }} />
            <div className="bg-emerald-500/70 h-full" style={{ width: `${segmentWidths[1]}%` }} />
            <div className="bg-yellow-500/70 h-full" style={{ width: `${segmentWidths[2]}%` }} />
            <div className="bg-red-500/70 h-full" style={{ width: `${segmentWidths[3]}%` }} />
          </div>

          <div className="flex text-[10px] text-muted-foreground mt-1.5">
            <span style={{ width: `${segmentWidths[0]}%` }} className="text-center">Zayıf</span>
            <span style={{ width: `${segmentWidths[1]}%` }} className="text-center">Normal</span>
            <span style={{ width: `${segmentWidths[2]}%` }} className="text-center">Kilolu</span>
            <span style={{ width: `${segmentWidths[3]}%` }} className="text-center">Obez</span>
          </div>

          {/* Weight Ranges Table */}
          <Separator className="my-4" />
          <p className="text-xs font-medium text-muted-foreground mb-3">
            {data.profile.height} cm boy için kilo aralıkları
          </p>

          <div className="space-y-2">
            {bmiRanges.map((range, i) => (
              <div
                key={range.label}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                  bmiCategory === i
                    ? 'bg-foreground/10 border border-foreground/20'
                    : 'bg-secondary/50'
                }`}
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${range.dotColor}`} />
                <span className={`w-16 font-medium ${bmiCategory === i ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {range.label}
                </span>
                <span className="text-xs text-muted-foreground">BMI {range.bmiRange}</span>
                <span className={`ml-auto tabular-nums font-medium ${bmiCategory === i ? '' : 'text-muted-foreground'}`}>
                  {range.weightRange}
                </span>
                {bmiCategory === i && (
                  <Badge className="text-[10px] px-1.5 py-0 ml-1">Sen</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      {chartData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Grafik</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="currentColor" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="currentColor" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11 }} domain={[data.profile.targetWeight - 2, 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: 12 }} />
                <ReferenceLine y={data.profile.targetWeight} stroke="var(--color-chart-1)" strokeDasharray="5 5" />
                <Area type="monotone" dataKey="kg" stroke="var(--color-foreground)" fill="url(#wg)" strokeWidth={2} dot={{ fill: 'var(--color-foreground)', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* History */}
      {weightLog.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Geçmiş</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0 max-h-52 overflow-y-auto">
              {[...weightLog].reverse().map((entry, i, arr) => {
                const prev = i < arr.length - 1 ? arr[i + 1] : null;
                const diff = prev ? (entry.weight - prev.weight).toFixed(1) : null;
                return (
                  <div key={entry.date}>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', weekday: 'short' })}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium tabular-nums">{entry.weight} kg</span>
                        {diff && diff != 0 && (
                          <span className={`text-xs tabular-nums flex items-center gap-0.5 ${diff < 0 ? 'text-chart-1' : 'text-destructive'}`}>
                            {diff < 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                            {diff > 0 ? '+' : ''}{diff}
                          </span>
                        )}
                      </div>
                    </div>
                    {i < arr.length - 1 && <Separator />}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function getBmiRanges(heightSq) {
  const underMax = Math.floor(18.5 * heightSq * 10) / 10;
  const normalMax = Math.floor(24.9 * heightSq * 10) / 10;
  const overMax = Math.floor(29.9 * heightSq * 10) / 10;

  return [
    {
      label: 'Zayıf',
      bmiRange: '< 18.5',
      weightRange: `< ${underMax} kg`,
      maxKg: underMax,
      dotColor: 'bg-blue-500',
    },
    {
      label: 'Normal',
      bmiRange: '18.5 – 24.9',
      weightRange: `${underMax} – ${normalMax} kg`,
      maxKg: normalMax,
      dotColor: 'bg-emerald-500',
    },
    {
      label: 'Kilolu',
      bmiRange: '25.0 – 29.9',
      weightRange: `${(normalMax + 0.1).toFixed(1)} – ${overMax} kg`,
      maxKg: overMax,
      dotColor: 'bg-yellow-500',
    },
    {
      label: 'Obez',
      bmiRange: '≥ 30.0',
      weightRange: `> ${overMax} kg`,
      maxKg: 999,
      dotColor: 'bg-red-500',
    },
  ];
}
