/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private masterVolume: number = 0.5;

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  }

  setVolume(volume: number) {
    this.masterVolume = volume;
  }

  private createOscillator(
    type: OscillatorType,
    freq: number,
    duration: number,
    gainStart: number
  ): { osc: OscillatorNode; gain: GainNode } | null {
    this.init();
    if (!this.ctx) return null;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(gainStart * this.masterVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    return { osc, gain };
  }

  playJump() {
    const sound = this.createOscillator('triangle', 180, 0.15, 0.35);
    if (!sound || !this.ctx) return;
    sound.osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.12);
    sound.osc.start();
    sound.osc.stop(this.ctx.currentTime + 0.15);
  }

  playDash() {
    const sound = this.createOscillator('square', 300, 0.2, 0.4);
    if (!sound || !this.ctx) return;
    sound.osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.18);
    
    // Add brief bandpass or noise filter effect natively using oscillator sweep
    sound.osc.start();
    sound.osc.stop(this.ctx.currentTime + 0.2);
  }

  playGravityShift(direction: 'up' | 'down' | 'left' | 'right' | 'cw' | 'ccw') {
    const sound = this.createOscillator('sine', 120, 0.35, 0.4);
    if (!sound || !this.ctx) return;
    
    let targetFreq = 220;
    if (direction === 'up' || direction === 'cw') {
      targetFreq = 380;
    } else if (direction === 'down' || direction === 'ccw') {
      targetFreq = 80;
    } else if (direction === 'left') {
      targetFreq = 200;
    } else {
      targetFreq = 260;
    }

    sound.osc.frequency.exponentialRampToValueAtTime(targetFreq, this.ctx.currentTime + 0.3);
    sound.osc.start();
    sound.osc.stop(this.ctx.currentTime + 0.35);
  }

  playShard(consecutiveCount: number = 0) {
    // scale up note frequencies dynamically based on consecutive collections
    const baseFreq = 523.25; // C5
    const multiplier = Math.pow(1.122, Math.min(consecutiveCount, 8)); // Scale up by musical steps
    const freq = baseFreq * multiplier;

    const sound = this.createOscillator('sine', freq, 0.25, 0.3);
    if (!sound || !this.ctx) return;
    sound.osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    sound.osc.frequency.setValueAtTime(freq * 1.55, this.ctx.currentTime + 0.06); // Harmonics!
    sound.osc.start();
    sound.osc.stop(this.ctx.currentTime + 0.25);
  }

  playBounce() {
    const sound = this.createOscillator('triangle', 90, 0.3, 0.5);
    if (!sound || !this.ctx) return;
    sound.osc.frequency.exponentialRampToValueAtTime(280, this.ctx.currentTime + 0.1);
    sound.osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.28);
    sound.osc.start();
    sound.osc.stop(this.ctx.currentTime + 0.3);
  }

  playLaserZap() {
    const sound = this.createOscillator('sawtooth', 800, 0.15, 0.15);
    if (!sound || !this.ctx) return;
    sound.osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.12);
    sound.osc.start();
    sound.osc.stop(this.ctx.currentTime + 0.15);
  }

  playButtonClick() {
    const sound = this.createOscillator('sine', 650, 0.08, 0.2);
    if (!sound || !this.ctx) return;
    sound.osc.frequency.setValueAtTime(800, this.ctx.currentTime + 0.03);
    sound.osc.start();
    sound.osc.stop(this.ctx.currentTime + 0.08);
  }

  playLogUnlock() {
    const sound = this.createOscillator('triangle', 300, 0.4, 0.25);
    if (!sound || !this.ctx) return;
    // Chime sweep
    sound.osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    sound.osc.frequency.setValueAtTime(360, this.ctx.currentTime + 0.08);
    sound.osc.frequency.setValueAtTime(450, this.ctx.currentTime + 0.16);
    sound.osc.frequency.setValueAtTime(600, this.ctx.currentTime + 0.24);
    sound.osc.start();
    sound.osc.stop(this.ctx.currentTime + 0.4);
  }

  playLevelClear() {
    this.init();
    if (!this.ctx) return;
    
    const freqs = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C Major scale arpeggio
    freqs.forEach((freq, idx) => {
      setTimeout(() => {
        const sound = this.createOscillator('sine', freq, 0.5, 0.18);
        if (sound) {
          sound.osc.start();
          sound.osc.stop(this.ctx!.currentTime + 0.5);
        }
      }, idx * 75);
    });
  }

  playDeath() {
    const sound = this.createOscillator('sawtooth', 220, 0.4, 0.45);
    if (!sound || !this.ctx) return;
    sound.osc.frequency.linearRampToValueAtTime(50, this.ctx.currentTime + 0.35);
    sound.osc.start();
    sound.osc.stop(this.ctx.currentTime + 0.4);
  }

  playPortal() {
    const sound = this.createOscillator('sine', 400, 0.3, 0.3);
    if (!sound || !this.ctx) return;
    sound.osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.15);
    sound.osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.3);
    sound.osc.start();
    sound.osc.stop(this.ctx.currentTime + 0.3);
  }
}

export const sounds = new SoundSynthesizer();
