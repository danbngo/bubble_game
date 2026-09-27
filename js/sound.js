// Sound effects and background ambience.
// Drop files at sounds/pop.mp3, sounds/background.mp3 and sounds/music.mp3 and they will be used;
// otherwise a pop, birdsong and a little tune are synthesized.
const Sound = {
  audioCtx: null,
  popFile: null,
  popFileReady: false,
  recentPops: [], // timestamps of pops that just played
  bgFile: null,
  bgFileReady: false,
  ambienceOn: false,
  birdTimer: null,
  musicFile: null,
  musicFileReady: false,
  musicOn: false,
  musicTimer: null,
  musicNotes: [], // synthesized notes scheduled to play, so they can be stopped

  init() {
    this.popFile = new Audio('sounds/pop.mp3');
    this.popFile.addEventListener('canplaythrough', () => { this.popFileReady = true; }, { once: true });
    this.popFile.load();

    this.bgFile = new Audio('sounds/background.mp3');
    this.bgFile.loop = true;
    this.bgFile.volume = 0.4;
    this.bgFile.addEventListener('canplaythrough', () => { this.bgFileReady = true; }, { once: true });
    this.bgFile.load();

    this.musicFile = new Audio('sounds/music.mp3');
    this.musicFile.loop = true;
    this.musicFile.volume = 0.6;
    this.musicFile.addEventListener('canplaythrough', () => { this.musicFileReady = true; }, { once: true });
    this.musicFile.load();
  },

  // The audio context can only start after the player clicks or presses a key
  context() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
    return this.audioCtx;
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
    const ac = this.context();
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

  startAmbience() {
    if (this.ambienceOn) return;
    this.ambienceOn = true;
    if (this.bgFileReady) {
      this.bgFile.play().catch(() => {});
    } else {
      this.scheduleBirdCall();
    }
  },

  stopAmbience() {
    this.ambienceOn = false;
    this.bgFile.pause();
    clearTimeout(this.birdTimer);
  },

  startMusic() {
    if (this.musicOn) return;
    this.musicOn = true;
    if (this.musicFileReady) {
      this.musicFile.currentTime = 0;
      this.musicFile.play().catch(() => {});
    } else {
      this.playTuneLoop();
    }
  },

  stopMusic() {
    this.musicOn = false;
    this.musicFile.pause();
    clearTimeout(this.musicTimer);
    for (const osc of this.musicNotes) {
      try { osc.stop(); } catch (e) { /* already finished */ }
    }
    this.musicNotes = [];
  },

  // A happy little tune that repeats until the music is stopped.
  // Each note is [MIDI note number, length in beats]; 0 is a rest.
  playTuneLoop() {
    const melody = [
      [72, 1], [76, 1], [79, 1], [76, 1], [77, 1], [81, 1], [79, 2],
      [76, 1], [79, 1], [84, 1], [79, 1], [77, 1], [74, 1], [72, 2],
      [74, 1], [77, 1], [81, 1], [77, 1], [76, 1], [79, 1], [84, 2],
      [83, 1], [81, 1], [79, 1], [77, 1], [76, 1], [74, 1], [72, 2],
    ];
    const bass = [48, 53, 55, 48]; // one bass note per 8-beat bar
    const beat = 0.22; // seconds per beat

    const ac = this.context();
    const start = ac.currentTime + 0.05;
    this.musicNotes = [];

    let t = start;
    for (const [note, beats] of melody) {
      if (note) this.playNote(note, t, beats * beat * 0.9, 'triangle', 0.12);
      t += beats * beat;
    }
    bass.forEach((note, i) => {
      this.playNote(note, start + i * 8 * beat, 8 * beat * 0.95, 'sine', 0.15);
    });

    // Queue up the next time through just as this one ends
    const loopLength = t - start;
    this.musicTimer = setTimeout(() => {
      if (this.musicOn) this.playTuneLoop();
    }, loopLength * 1000);
  },

  playNote(midi, time, length, type, volume) {
    const ac = this.context();
    const osc = ac.createOscillator();
    osc.type = type;
    osc.frequency.value = 440 * Math.pow(2, (midi - 69) / 12);

    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(volume, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + length);

    osc.connect(gain).connect(ac.destination);
    osc.start(time);
    osc.stop(time + length + 0.02);
    this.musicNotes.push(osc);
  },

  // Synthesized birdsong: a random bird calls every second or few
  scheduleBirdCall() {
    this.birdTimer = setTimeout(() => {
      if (!this.ambienceOn) return;
      this.birdCall();
      this.scheduleBirdCall();
    }, 700 + Math.random() * 2500);
  },

  birdCall() {
    const ac = this.context();
    let t = ac.currentTime;

    // Each call is a few quick chirps from one "bird" with its own pitch
    const pitch = 2200 + Math.random() * 1800;
    const chirps = 2 + Math.floor(Math.random() * 5);
    const rising = Math.random() < 0.5;
    const volume = 0.03 + Math.random() * 0.05; // some birds sound farther away

    for (let i = 0; i < chirps; i++) {
      const length = 0.05 + Math.random() * 0.06;
      const from = pitch * (rising ? 0.8 : 1.3);
      const to = pitch * (rising ? 1.3 : 0.8);

      const osc = ac.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(from, t);
      osc.frequency.exponentialRampToValueAtTime(to, t + length);

      const gain = ac.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(volume, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + length);

      osc.connect(gain).connect(ac.destination);
      osc.start(t);
      osc.stop(t + length + 0.02);

      t += length + 0.03 + Math.random() * 0.05;
    }
  },
};
