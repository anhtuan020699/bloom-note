// Web Audio synthesizer: tracks are composed as chord progressions + melodies
// and scheduled bar-by-bar with a lookahead clock.

const NOTE_INDEX = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const toMidi = (name) => {
  const m = /^([A-G])(#|b)?(\d)$/.exec(name);
  if (!m) throw new Error(`Bad note ${name}`);
  return (Number(m[3]) + 1) * 12 + NOTE_INDEX[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
};
const freq = (midi) => 440 * 2 ** ((midi - 69) / 12);

const parseMelody = (str) => {
  let t = 0;
  const events = [];
  for (const token of str.trim().split(/\s+/)) {
    const [n, d] = token.split(':');
    const dur = Number(d);
    if (n !== '-') events.push({ beat: t, midi: toMidi(n), dur });
    t += dur;
  }
  return events;
};

// chord = [bass, tone1, tone2, tone3]
const TRACKS = {
  'piano-youth': {
    bpm: 84,
    beatsPerBar: 4,
    chords: [
      [36, 55, 60, 64], [35, 55, 59, 62], [33, 57, 60, 64], [31, 55, 59, 64],
      [29, 57, 60, 65], [28, 55, 60, 64], [26, 57, 62, 65], [31, 55, 59, 62],
    ],
    melody: parseMelody(`
      E5:1.5 D5:0.5 C5:1 G4:1   D5:1.5 C5:0.5 B4:1 G4:1
      C5:1.5 B4:0.5 A4:1 E5:1   B4:3 -:1
      A4:1 C5:1 F5:1.5 E5:0.5   E5:1 G5:1 E5:1 C5:1
      D5:1 F5:1 A5:1.5 G5:0.5   G5:2 F5:0.5 E5:0.5 D5:1`),
    melodyInst: 'piano',
    melodyVel: 0.5,
    arrange(chord, _bar, note) {
      const [bass, a, b, c] = chord;
      note('piano', bass, 0, 3, 0.36);
      [a, b, c, b, a + 12, c, b, a].forEach((m, i) => i && note('piano', m, i * 0.5, 1.2, 0.17));
      note('pad', a, 0, 4, 0.05);
      note('pad', c, 0, 4, 0.04);
    },
    reverb: 0.32,
  },
  'music-box': {
    bpm: 96,
    beatsPerBar: 4,
    chords: [
      [41, 65, 69, 72], [45, 64, 69, 72], [46, 65, 70, 74], [48, 64, 67, 72],
      [41, 65, 69, 72], [38, 65, 69, 74], [46, 65, 70, 74], [48, 64, 67, 72],
    ],
    melody: parseMelody(`
      C6:1 A5:1 F5:1 A5:1        C6:1.5 E6:0.5 C6:1 A5:1
      D6:1 C6:0.5 Bb5:0.5 A5:1 G5:1   G5:2 E5:1 G5:1
      A5:1 C6:1 F6:1.5 E6:0.5    D6:1 C6:1 A5:2
      Bb5:1 D6:1 C6:1 Bb5:1      A5:2 G5:1 F5:1`),
    melodyInst: 'bell',
    melodyVel: 0.42,
    arrange(chord, _bar, note) {
      const [bass, a, b, c] = chord;
      note('soft-bass', bass, 0, 1.8, 0.26);
      note('soft-bass', bass + 7, 2, 1.8, 0.18);
      [a, b, c, b + 12, c, b, a, b].forEach((m, i) => note('bell', m, i * 0.5, 0.8, 0.12));
    },
    reverb: 0.45,
  },
  'waltz-bloom': {
    bpm: 138,
    beatsPerBar: 3,
    chords: [
      [38, 62, 66, 69], [42, 61, 66, 69], [35, 62, 66, 71], [43, 62, 67, 71],
      [40, 64, 67, 71], [33, 61, 64, 69], [38, 62, 66, 69], [33, 61, 67, 69],
    ],
    melody: parseMelody(`
      A4:1 D5:1 F#5:1   A5:2 F#5:1   F#5:1.5 E5:0.5 D5:1   B4:3
      G5:1 F#5:1 E5:1   C#5:1 E5:1 A5:1   F#5:1.5 E5:0.5 D5:1   E5:2 C#5:1`),
    melodyInst: 'strings',
    melodyVel: 0.3,
    doubleMelody: { inst: 'piano', vel: 0.28, octave: 12 },
    arrange(chord, _bar, note) {
      const [bass, a, b, c] = chord;
      note('piano', bass, 0, 1.2, 0.34);
      for (const beat of [1, 2]) [a, b, c].forEach((m) => note('piano', m, beat, 0.6, 0.11));
      note('pad', b - 12, 0, 3, 0.05);
    },
    reverb: 0.4,
  },
  'lofi-chill': {
    bpm: 76,
    beatsPerBar: 4,
    swing: 0.08,
    chords: [
      [41, 57, 60, 64], [40, 55, 59, 62], [38, 53, 57, 60], [36, 52, 55, 59],
      [41, 57, 60, 64], [40, 55, 59, 62], [38, 53, 57, 60], [36, 52, 55, 59],
    ],
    melody: parseMelody(`
      -:1 E5:0.5 G5:0.5 A5:1 G5:1   -:0.5 D5:0.5 E5:1 B4:2
      -:1 F5:0.5 E5:0.5 C5:1 A4:1   G4:3 -:1
      -:1 C5:0.5 E5:0.5 G5:1.5 A5:0.5   G5:1 E5:1 D5:2
      -:0.5 C5:0.5 D5:0.5 E5:0.5 F5:1 E5:1   B4:2 -:2`),
    melodyInst: 'epiano',
    melodyVel: 0.36,
    arrange(chord, _bar, note) {
      const [bass, a, b, c] = chord;
      [a, b, c].forEach((m) => { note('epiano', m, 0, 1.8, 0.16); note('epiano', m, 2.5, 1.2, 0.12); });
      note('sub', bass, 0, 1.6, 0.42);
      note('sub', bass, 2.5, 1.2, 0.34);
      note('kick', 0, 0, 0.5, 0.8);
      note('kick', 0, 2.5, 0.5, 0.6);
      note('snare', 0, 1, 0.3, 0.32);
      note('snare', 0, 3, 0.3, 0.32);
      for (let i = 0; i < 8; i++) note('hat', 0, i * 0.5, 0.05, i % 2 ? 0.07 : 0.11);
    },
    crackle: true,
    reverb: 0.25,
  },
};

const makeImpulse = (ctx, seconds = 2.6, decay = 3) => {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** decay;
  }
  return buf;
};

const makeNoise = (ctx, seconds = 1) => {
  const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buf;
};

const makeCrackle = (ctx, seconds = 4) => {
  const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.012;
    if (Math.random() < 0.00035) data[i] = (Math.random() * 2 - 1) * 0.6;
  }
  return buf;
};

export class SynthEngine {
  constructor(ctx, destination) {
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0.7;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.ratio.value = 3;
    this.master.connect(comp).connect(destination);

    this.reverb = ctx.createConvolver();
    this.reverb.buffer = makeImpulse(ctx);
    this.reverbSend = ctx.createGain();
    this.reverbSend.connect(this.reverb).connect(this.master);

    this.noise = makeNoise(ctx);
    this.crackleBuf = makeCrackle(ctx);
    this.timer = null;
    this.bus = null;
  }

  get playing() { return !!this.timer; }

  start(trackId) {
    this.stop();
    const track = TRACKS[trackId] || TRACKS['piano-youth'];
    const { ctx } = this;
    const bus = ctx.createGain();
    bus.gain.setValueAtTime(0, ctx.currentTime);
    bus.gain.linearRampToValueAtTime(1, ctx.currentTime + 1.2);
    const dry = ctx.createGain();
    const wet = ctx.createGain();
    wet.gain.value = track.reverb;
    bus.connect(dry).connect(this.master);
    bus.connect(wet).connect(this.reverbSend);
    this.bus = { bus, dry, wet, sources: new Set() };

    if (track.crackle) {
      const src = ctx.createBufferSource();
      src.buffer = this.crackleBuf;
      src.loop = true;
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 1200;
      src.connect(hp).connect(dry);
      src.start();
      this.bus.sources.add(src);
    }

    this.track = track;
    this.bar = 0;
    this.nextBarTime = ctx.currentTime + 0.12;
    const tick = () => {
      while (this.nextBarTime < ctx.currentTime + 1.5) {
        this.scheduleBar(this.bar, this.nextBarTime);
        this.nextBarTime += track.beatsPerBar * (60 / track.bpm);
        this.bar++;
      }
    };
    tick();
    this.timer = setInterval(tick, 120);
  }

  stop(fade = 0.5) {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    const old = this.bus;
    this.bus = null;
    if (!old) return;
    const t = this.ctx.currentTime;
    old.bus.gain.cancelScheduledValues(t);
    old.bus.gain.setValueAtTime(old.bus.gain.value, t);
    old.bus.gain.linearRampToValueAtTime(0, t + fade);
    setTimeout(() => {
      old.sources.forEach((s) => { try { s.stop(); } catch { /* already stopped */ } });
      old.bus.disconnect();
    }, fade * 1000 + 200);
  }

  scheduleBar(bar, t0) {
    const track = this.track;
    const beatDur = 60 / track.bpm;
    const loopBeats = track.chords.length * track.beatsPerBar;
    const chord = track.chords[bar % track.chords.length];
    const out = this.bus?.bus;
    if (!out) return;

    const swingAt = (beat) => (track.swing && Math.abs((beat % 1) - 0.5) < 1e-6 ? beat + track.swing : beat);
    const note = (inst, midi, beat, durBeats, vel) => {
      const time = t0 + swingAt(beat) * beatDur + (inst === 'hat' || inst === 'kick' ? 0 : Math.random() * 0.008);
      this.play(inst, midi, time, durBeats * beatDur, vel * (0.92 + Math.random() * 0.16), out);
    };

    track.arrange(chord, bar, note);

    const startBeat = (bar * track.beatsPerBar) % loopBeats;
    const endBeat = startBeat + track.beatsPerBar;
    for (const ev of track.melody) {
      if (ev.beat >= startBeat && ev.beat < endBeat) {
        const b = ev.beat - startBeat;
        note(track.melodyInst, ev.midi, b, ev.dur, track.melodyVel);
        if (track.doubleMelody) {
          const d = track.doubleMelody;
          note(d.inst, ev.midi + d.octave, b, ev.dur, d.vel);
        }
      }
    }
  }

  play(inst, midi, t, dur, vel, out) {
    const { ctx } = this;
    const f = freq(midi);
    const env = ctx.createGain();
    env.connect(out);
    const oscs = [];
    const osc = (type, frequency, gain = 1, detune = 0) => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = frequency;
      o.detune.value = detune;
      const g = ctx.createGain();
      g.gain.value = gain;
      o.connect(g);
      oscs.push(o);
      return g;
    };
    const noiseSrc = () => {
      const s = ctx.createBufferSource();
      s.buffer = this.noise;
      oscs.push(s);
      return s;
    };
    let end = t + dur;

    switch (inst) {
      case 'piano': {
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(Math.min(9000, f * 9), t);
        lp.frequency.exponentialRampToValueAtTime(Math.max(400, f * 2.2), t + 1.4);
        osc('triangle', f, 0.8).connect(lp);
        osc('sine', f, 0.6, 3).connect(lp);
        osc('sine', f * 2, 0.16, -4).connect(lp);
        lp.connect(env);
        const release = Math.min(2.6, dur + 1.2);
        env.gain.setValueAtTime(0.0001, t);
        env.gain.exponentialRampToValueAtTime(vel, t + 0.006);
        env.gain.exponentialRampToValueAtTime(vel * 0.35, t + 0.35);
        env.gain.exponentialRampToValueAtTime(0.0001, t + release);
        end = t + release;
        break;
      }
      case 'bell': {
        osc('sine', f, 1).connect(env);
        osc('sine', f * 4.02, 0.22).connect(env);
        osc('sine', f * 2.0, 0.12, 2).connect(env);
        osc('triangle', f * 6.8, 0.05).connect(env);
        env.gain.setValueAtTime(0.0001, t);
        env.gain.exponentialRampToValueAtTime(vel, t + 0.003);
        env.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
        end = t + 1.8;
        break;
      }
      case 'strings':
      case 'pad': {
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = inst === 'pad' ? 900 : 2200;
        lp.Q.value = 0.6;
        osc('sawtooth', f, 0.5, -7).connect(lp);
        osc('sawtooth', f, 0.5, 7).connect(lp);
        if (inst === 'strings') {
          const vib = ctx.createOscillator();
          vib.frequency.value = 5.2;
          const vibGain = ctx.createGain();
          vibGain.gain.value = 6;
          vib.connect(vibGain);
          oscs.forEach((o) => vibGain.connect(o.detune));
          oscs.push(vib);
        }
        lp.connect(env);
        const attack = inst === 'pad' ? 0.6 : 0.12;
        env.gain.setValueAtTime(0.0001, t);
        env.gain.linearRampToValueAtTime(vel, t + attack);
        env.gain.setValueAtTime(vel, t + Math.max(attack, dur - 0.05));
        env.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.6);
        end = t + dur + 0.6;
        break;
      }
      case 'epiano': {
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 1600;
        osc('sine', f, 1).connect(lp);
        osc('sine', f * 2, 0.18).connect(lp);
        osc('triangle', f, 0.25, 6).connect(lp);
        const trem = ctx.createGain();
        lp.connect(trem).connect(env);
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 4;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.15;
        lfo.connect(lfoGain).connect(trem.gain);
        oscs.push(lfo);
        env.gain.setValueAtTime(0.0001, t);
        env.gain.exponentialRampToValueAtTime(vel, t + 0.01);
        env.gain.exponentialRampToValueAtTime(vel * 0.4, t + 0.6);
        env.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.5);
        end = t + dur + 0.5;
        break;
      }
      case 'soft-bass':
      case 'sub': {
        osc('sine', f, 1).connect(env);
        osc('triangle', f, inst === 'sub' ? 0.25 : 0.4).connect(env);
        env.gain.setValueAtTime(0.0001, t);
        env.gain.exponentialRampToValueAtTime(vel, t + 0.02);
        env.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.2);
        end = t + dur + 0.2;
        break;
      }
      case 'kick': {
        const o = ctx.createOscillator();
        o.frequency.setValueAtTime(130, t);
        o.frequency.exponentialRampToValueAtTime(42, t + 0.18);
        o.connect(env);
        oscs.push(o);
        env.gain.setValueAtTime(vel, t);
        env.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
        end = t + 0.45;
        break;
      }
      case 'snare':
      case 'hat': {
        const s = noiseSrc();
        const filter = ctx.createBiquadFilter();
        filter.type = inst === 'hat' ? 'highpass' : 'bandpass';
        filter.frequency.value = inst === 'hat' ? 7000 : 1800;
        filter.Q.value = inst === 'hat' ? 0.7 : 0.9;
        s.connect(filter).connect(env);
        const len = inst === 'hat' ? 0.05 : 0.22;
        env.gain.setValueAtTime(vel, t);
        env.gain.exponentialRampToValueAtTime(0.0001, t + len);
        end = t + len;
        break;
      }
      default:
        return;
    }

    for (const o of oscs) {
      o.start(t);
      o.stop(end + 0.05);
    }
    oscs[0].onended = () => env.disconnect();
  }
}

export const SYNTH_TRACK_IDS = Object.keys(TRACKS);
