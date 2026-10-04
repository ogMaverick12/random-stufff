/**
 * Synthesizes immersive ambient and kinetic audio effects using the Web Audio API.
 * 100% self-contained, zero external audio asset dependencies.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public enableAudio() {
    this.enabled = true;
    this.initCtx();
  }

  public disableAudio() {
    this.enabled = false;
  }

  public toggleAudio(): boolean {
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.initCtx();
    }
    return this.enabled;
  }

  /**
   * Crisp, subtle mechanical/acoustic typing click with resonant chime
   */
  public playTypingSound(charIndex: number) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Pentatonic scale frequency based on character index for a melodic typing sequence
    const notes = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25]; // C4, D4, E4, G4, A4, C5
    const freq = notes[charIndex % notes.length] * (1 + (charIndex * 0.05));

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t + 0.08);

    // Click transient
    const noiseBuffer = this.createClickBuffer();
    if (noiseBuffer) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.04, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
      noise.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noise.start(t);
    }

    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.16);
  }

  /**
   * Harmonic shimmer sound while hands are drawing the heart
   */
  public playDrawingShimmer(progress: number) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Glissando / ascending sweep
    const baseFreq = 440 + progress * 400;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.linearRampToValueAtTime(baseFreq + 30, t + 0.06);

    gain.gain.setValueAtTime(0.02, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  /**
   * Deep, resonant anatomical heartbeat pulse ("Lub-Dub")
   */
  public playHeartbeat(intensity: number = 1.0) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Pulse 1: "Lub"
    this.triggerHeartSubPulse(t, 55, 0.18 * intensity, 0.14);

    // Pulse 2: "Dub" shortly after
    this.triggerHeartSubPulse(t + 0.13, 48, 0.15 * intensity, 0.16);
  }

  private triggerHeartSubPulse(startTime: number, freq: number, volume: number, duration: number) {
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, startTime);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);
    osc.frequency.exponentialRampToValueAtTime(32, startTime + duration);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  /**
   * Cosmic stardust chime & whoosh when the heart explodes & dissolves
   */
  public playDissolveBurst() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Burst whoosh
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.4);
    osc.frequency.exponentialRampToValueAtTime(180, t + 1.2);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 1.25);

    // Chime sparkles (multi-frequency celestial bells)
    const sparkleFreqs = [587.33, 880, 1174.66, 1760, 2349.32];
    sparkleFreqs.forEach((sf, idx) => {
      if (!this.ctx) return;
      const sOsc = this.ctx.createOscillator();
      const sGain = this.ctx.createGain();
      const st = t + (idx * 0.06);

      sOsc.type = 'triangle';
      sOsc.frequency.setValueAtTime(sf, st);

      sGain.gain.setValueAtTime(0.03, st);
      sGain.gain.exponentialRampToValueAtTime(0.0001, st + 0.8);

      sOsc.connect(sGain);
      sGain.connect(this.ctx.destination);
      sOsc.start(st);
      sOsc.stop(st + 0.85);
    });
  }

  private createClickBuffer(): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 0.03;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }
    return buffer;
  }
}

export const soundEngine = new SoundEngine();
