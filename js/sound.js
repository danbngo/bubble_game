// Pop sound effect.
// Drop a file at sounds/pop.mp3 and it will be used; otherwise a pop is synthesized.
const Sound = {
  audioCtx: null,
  popFile: null,
  popFileReady: false,
  recentPops: [], // timestamps of pops that just played

  init() {
    const audio = new Audio('sounds/pop.mp3');
    audio.addEventListener('canplaythrough', () => { this.popFileReady = true; }, { once: true });
    audio.load();
    this.popFile = audio;
  },

  pop(radius) {
    // When lots of bubbles pop at once (spike walls), only play a few sounds so it doesn't get deafening
    const now = performance.now();
    this.recentPops = this.recentPops.filter(t => now - t < 80);
    if (this.recentPops.length >= 4) return;
    this.recentPops.push(now);

    if (this.popFileReady) {
      const a = this.popFile.cloneNode();
      a.volume = 0.7;
      a.play().catch(() => {});
    } else {
      this.synthPop(radius);
    }
  },

  // A quick downward pitch sweep sounds like a bubble pop. Smaller bubbles pop higher.
  synthPop(radius) {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ac = this.audioCtx;
    if (ac.state === 'suspended') ac.resume();

    const now = ac.currentTime;
    const startFreq = 1500 - radius * 12 + Math.random() * 200;

    const osc = ac.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 0.3, now + 0.07);

    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.4, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

    osc.connect(gain).connect(ac.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  },
};
