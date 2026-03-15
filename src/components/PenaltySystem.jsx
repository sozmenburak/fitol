import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { AlertTriangle, Check, X } from 'lucide-react';
import { playAlarmSound, playSuccessSound, stopAlarm } from '../utils/alarmSystem';

const penaltyTypes = [
  { id: 'missed_meal', label: 'Öğün atladım', punishment: '50 burpee', severity: 'high' },
  { id: 'missed_workout', label: 'Antrenman kaçırdım', punishment: 'Yarın 2x antrenman + 100 şınav', severity: 'critical' },
  { id: 'late_sleep', label: 'Geç yattım', punishment: 'Yarın 30dk erken uyanma + 200 mekik', severity: 'high' },
  { id: 'missed_water', label: 'Su içmedim', punishment: '1L ekstra su + 50 squat', severity: 'medium' },
  { id: 'junk_food', label: 'Abur cubur yedim', punishment: '30dk ekstra kardiyo, yarın -300 kcal', severity: 'critical' },
  { id: 'missed_wakeup', label: 'Geç uyandım', punishment: '100 jumping jack + soğuk duş', severity: 'high' },
  { id: 'skip_stretch', label: 'Esneme yapmadım', punishment: '10dk esneme + 30s plank', severity: 'low' },
  { id: 'sugar', label: 'Şeker yedim', punishment: '50 mountain climber', severity: 'medium' },
];

export default function PenaltySystem({ data, addPenalty, resolvePenalty }) {
  const [confirm, setConfirm] = useState(null);
  const active = data.penalties.filter(p => !p.resolved);
  const resolved = data.penalties.filter(p => p.resolved);

  const handleAdd = (type) => {
    addPenalty(type.label, type.punishment);
    playAlarmSound('penalty', 0.8);
    setConfirm(null);
    setTimeout(stopAlarm, 3000);
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-semibold tabular-nums">{active.length}</p><p className="text-xs text-muted-foreground">Aktif</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-semibold tabular-nums">{resolved.length}</p><p className="text-xs text-muted-foreground">Tamamlanan</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-semibold tabular-nums">{data.penalties.length}</p><p className="text-xs text-muted-foreground">Toplam</p></CardContent></Card>
      </div>

      {/* Active */}
      {active.length > 0 ? (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-1.5">
              <AlertTriangle size={14} /> Aktif Cezalar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {active.map((p, i) => (
                <div key={p.id}>
                  <div className="flex items-center justify-between py-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{p.reason}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{p.punishment}</p>
                    </div>
                    <Button size="sm" onClick={() => { resolvePenalty(p.id); playSuccessSound(); }}>
                      <Check size={14} /> Yaptım
                    </Button>
                  </div>
                  {i < active.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border border-chart-1/30 bg-chart-1/5 px-4 py-4 text-center">
          <p className="text-sm text-chart-1 font-medium">Aktif cezan yok. Böyle devam et.</p>
        </div>
      )}

      {/* Add Penalty */}
      <Card>
        <CardHeader>
          <CardTitle>İtiraf Et</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">Kural çiğnediysen itiraf et, cezanı çek.</p>
          <div className="grid grid-cols-2 gap-2">
            {penaltyTypes.map(type => (
              <button
                key={type.id}
                onClick={() => setConfirm(type)}
                className="rounded-lg border border-border bg-card p-3 text-left cursor-pointer transition-colors hover:bg-accent"
              >
                <p className="text-sm font-medium">{type.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{type.punishment}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Card className="max-w-sm w-full mx-4">
            <CardHeader>
              <CardTitle className="text-foreground text-base">Emin misin?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-1">"{confirm.label}" cezası:</p>
              <p className="text-sm font-medium mb-4">{confirm.punishment}</p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setConfirm(null)}>Vazgeç</Button>
                <Button variant="destructive" className="flex-1" onClick={() => handleAdd(confirm)}>Ceza Al</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Kurallar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {[
              'Belirlenen saatte uyan, ertele yok',
              'Hiçbir öğünü atlama, zamanında ye',
              'Antrenmanı her gün yap, mazeret yok',
              'Günde en az 3 litre su iç',
              'Abur cubur, fast food, şekerli içecek yasak',
              'Belirlenen saatte yat, ekranları kapat',
              'Yatmadan 1 saat önce telefon yasak',
              'Her sabah tartıl ve kaydet',
            ].map((rule, i, arr) => (
              <div key={i}>
                <div className="flex items-center gap-3 py-2">
                  <span className="text-xs text-muted-foreground tabular-nums w-4">{i + 1}</span>
                  <span className="text-sm">{rule}</span>
                </div>
                {i < arr.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* History */}
      {resolved.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tamamlanan Cezalar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0 max-h-40 overflow-y-auto">
              {resolved.slice(-10).reverse().map((p, i, arr) => (
                <div key={p.id}>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground">{p.reason}</span>
                    <span className="text-xs text-muted-foreground">{new Date(p.date).toLocaleDateString('tr-TR')}</span>
                  </div>
                  {i < arr.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
