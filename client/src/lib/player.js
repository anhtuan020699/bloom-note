import { useSyncExternalStore } from 'react';
import { SynthEngine } from './synth.js';

class MusicPlayer {
  state = { playing: false, muted: false, key: null, error: null };
  listeners = new Set();
  ctx = null;
  synth = null;
  audio = null;
  outGain = null;

  subscribe = (fn) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };
  getState = () => this.state;
  set(patch) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((fn) => fn());
  }

  ensureContext() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new Ctx();
      this.outGain = this.ctx.createGain();
      this.outGain.connect(this.ctx.destination);
      this.synth = new SynthEngine(this.ctx, this.outGain);
    }
    // Must run synchronously inside the user gesture to satisfy autoplay policies.
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  static keyOf(config) {
    if (!config || config.source === 'none') return null;
    return config.source === 'library' ? `lib:${config.trackId}` : `url:${config.url}`;
  }

  /** Call directly from a click/tap handler. */
  play(config) {
    const key = MusicPlayer.keyOf(config);
    this.stop();
    if (!key) return;
    this.set({ key, error: null, playing: true });

    if (config.source === 'library') {
      this.ensureContext();
      this.synth.start(config.trackId);
      return;
    }

    if (!this.audio) {
      this.audio = new Audio();
      this.audio.loop = true;
      this.audio.preload = 'auto';
      this.audio.addEventListener('error', () => {
        if (this.state.key?.startsWith('url:')) {
          this.set({ playing: false, error: 'Không phát được nhạc từ link này.' });
        }
      });
    }
    this.audio.src = config.url;
    this.audio.muted = this.state.muted;
    this.audio.currentTime = 0;
    this.audio.volume = 0;
    this.audio.play().then(
      () => this.fadeAudio(1),
      (err) => {
        if (err?.name !== 'AbortError') this.set({ playing: false, error: 'Trình duyệt chặn hoặc không phát được nhạc.' });
      },
    );
  }

  fadeAudio(target, ms = 1200) {
    const el = this.audio;
    if (!el) return;
    const from = el.volume;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / ms);
      el.volume = from + (target - from) * p;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  stop() {
    this.synth?.stop();
    if (this.audio && !this.audio.paused) this.audio.pause();
    if (this.state.playing || this.state.key) this.set({ playing: false, key: null });
  }

  toggle(config) {
    if (this.state.playing && this.state.key === MusicPlayer.keyOf(config)) this.stop();
    else this.play(config);
  }

  setMuted(muted) {
    if (this.outGain) this.outGain.gain.setTargetAtTime(muted ? 0 : 1, this.ctx.currentTime, 0.08);
    if (this.audio) this.audio.muted = muted;
    this.set({ muted });
  }
}

export const player = new MusicPlayer();
export const musicKey = MusicPlayer.keyOf;

export const usePlayer = () => useSyncExternalStore(player.subscribe, player.getState, player.getState);
