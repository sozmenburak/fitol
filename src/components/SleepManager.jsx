import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Moon, Sun } from 'lucide-react';
import { getToday } from '../utils/storage';
import { playClickSound } from '../utils/alarmSystem';

export default function SleepManager({ data, logSleep, updateSettings }) {
  const [time, setTime] = useState(new Date());
  const today = getToday();
  const todaySleep = data.sleepLog[today] || null;

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const currentHour = time.getHours();
  const sleepHour = parseInt(data.settings.sleepTime.split(':')[0]);
  const wakeHour = parseInt(data.settings.wakeUpTime.split(':')[0]);
  const isPastBedtime = currentHour >= sleepHour || currentHour < wakeHour;

  const sleepGoal = (() => {
    let s = sleepHour, w = wakeHour;
    if (w <= s) w += 24;
    return w - s;
  })();

  const recentLogs = Object.entries(data.sleepLog)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 7);

  const avgHours = recentLogs.length > 0
    ? recentLogs.reduce((sum, [, l]) => {
        const s = toMins(l.sleepTime);
        let w = toMins(l.wakeTime);
        if (w <= s) w += 1440;
        return sum + (w - s) / 60;
      }, 0) / recentLogs.length
    : 0;

  const handleLog = () => {
    const s = document.getElementById('sl-sleep')?.value;
    const w = document.getElementById('sl-wake')?.value;
    if (s && w) { logSleep(s, w); playClickSound(); }
  };

  return (
    <div className="space-y-4">
      {/* Status */}
      {isPastBedtime && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <div className="flex items-center gap-2">
            <Moon size={15} className="text-destructive shrink-0" />
            <div>
              <p className="text-sm font-medium text-destructive">Yatma vakti geçti</p>
              <p className="text-xs text-muted-foreground mt-0.5">Yetersiz uyku kas kaybına ve yağ birikimine neden olur. Hemen yat.</p>
            </div>
          </div>
        </div>
      )}

      {/* Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Uyku Programı</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Yatış</label>
              <Input type="time" value={data.settings.sleepTime} onChange={e => { updateSettings({ sleepTime: e.target.value }); playClickSound(); }} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Uyanış</label>
              <Input type="time" value={data.settings.wakeUpTime} onChange={e => { updateSettings({ wakeUpTime: e.target.value }); playClickSound(); }} />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 px-1">
            <span className="text-sm text-muted-foreground">Hedef uyku</span>
            <span className="text-sm font-medium tabular-nums">{sleepGoal} saat</span>
          </div>
        </CardContent>
      </Card>

      {/* Log */}
      <Card>
        <CardHeader>
          <CardTitle>Bugünkü Kayıt</CardTitle>
        </CardHeader>
        <CardContent>
          {todaySleep ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                <div><span className="text-muted-foreground">Yattın:</span> <span className="font-medium font-mono">{todaySleep.sleepTime}</span></div>
                <div><span className="text-muted-foreground">Uyandın:</span> <span className="font-medium font-mono">{todaySleep.wakeTime}</span></div>
              </div>
              <Badge variant="success">Kaydedildi</Badge>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Dün gece kaçta yattın, bugün kaçta uyandın?</p>
              <div className="grid grid-cols-2 gap-2">
                <Input type="time" id="sl-sleep" defaultValue={data.settings.sleepTime} />
                <Input type="time" id="sl-wake" defaultValue={data.settings.wakeUpTime} />
              </div>
              <Button className="w-full" onClick={handleLog}>Kaydet</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Ort. Uyku</p>
            <p className="text-xl font-semibold tabular-nums mt-0.5">{avgHours.toFixed(1)} saat</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Kalite</p>
            <p className={`text-xl font-semibold mt-0.5 ${avgHours >= 7 ? 'text-chart-1' : 'text-destructive'}`}>
              {avgHours >= 7 ? 'İyi' : 'Yetersiz'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Uyku İpuçları</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {[
              'Yatmadan 1 saat önce ekranları kapat',
              'Oda sıcaklığı 18-20°C olmalı',
              '14:00\'den sonra kafein alma',
              'Her gün aynı saatte yat, aynı saatte kalk',
              '7-9 saat uyku = maksimum kas gelişimi',
              'Yatmadan önce 5 dk derin nefes yap',
            ].map((tip, i, arr) => (
              <div key={i}>
                <p className="text-sm text-muted-foreground py-2">{tip}</p>
                {i < arr.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* History */}
      {recentLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Son 7 Gün</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {recentLogs.map(([date, log], i) => {
                const s = toMins(log.sleepTime);
                let w = toMins(log.wakeTime);
                if (w <= s) w += 1440;
                const h = ((w - s) / 60).toFixed(1);
                return (
                  <div key={date}>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground">
                        {new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', weekday: 'short' })}
                      </span>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="font-mono text-muted-foreground">{log.sleepTime} → {log.wakeTime}</span>
                        <span className={`font-medium tabular-nums ${parseFloat(h) >= 7 ? 'text-chart-1' : 'text-destructive'}`}>{h}h</span>
                      </div>
                    </div>
                    {i < recentLogs.length - 1 && <Separator />}
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

function toMins(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}
