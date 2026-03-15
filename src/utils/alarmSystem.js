let audioContext = null;
let currentOscillator = null;
let currentGain = null;
let alarmInterval = null;

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

export function playAlarmSound(type = 'default', volume = 1.0) {
  stopAlarm();
  const ctx = getAudioContext();

  const patterns = {
    default: { freqs: [800, 1000, 800, 1000], duration: 0.2, gap: 0.1 },
    wakeup: { freqs: [523, 659, 784, 1047, 784, 659, 523], duration: 0.15, gap: 0.05 },
    meal: { freqs: [600, 800, 600], duration: 0.3, gap: 0.15 },
    workout: { freqs: [400, 500, 600, 700, 800, 900, 1000], duration: 0.1, gap: 0.05 },
    warning: { freqs: [200, 400, 200, 400, 200], duration: 0.25, gap: 0.1 },
    penalty: { freqs: [150, 300, 150, 300, 150, 300], duration: 0.3, gap: 0.05 },
    sleep: { freqs: [500, 400, 300, 200], duration: 0.4, gap: 0.2 },
  };

  const pattern = patterns[type] || patterns.default;
  let repeatCount = 0;
  const maxRepeats = 30;

  function playSequence() {
    if (repeatCount >= maxRepeats) {
      stopAlarm();
      return;
    }
    repeatCount++;

    let time = ctx.currentTime;
    pattern.freqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.value = freq;
      osc.type = type === 'wakeup' ? 'square' : 'sawtooth';
      gain.gain.value = volume;
      gain.gain.exponentialRampToValueAtTime(0.01, time + pattern.duration);

      osc.start(time);
      osc.stop(time + pattern.duration);
      time += pattern.duration + pattern.gap;
    });
  }

  playSequence();
  const totalDuration = pattern.freqs.length * (pattern.duration + pattern.gap);
  alarmInterval = setInterval(playSequence, totalDuration * 1000 + 500);
}

export function stopAlarm() {
  if (alarmInterval) {
    clearInterval(alarmInterval);
    alarmInterval = null;
  }
  if (currentOscillator) {
    try { currentOscillator.stop(); } catch {}
    currentOscillator = null;
  }
}

export function playClickSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 1200;
    osc.type = 'sine';
    gain.gain.value = 0.1;
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch {}
}

export function playSuccessSound() {
  try {
    const ctx = getAudioContext();
    [523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.value = 0.2;
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.15);
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.15);
    });
  } catch {}
}
