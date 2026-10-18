/**
 * Procedural Web Audio API sound synthesizer
 * Zero external audio dependencies: generates authentic ambient noisescapes
 * (Rain on window, Tokyo cafe chatter, Library whispers, Vinyl lofi) and soft chimes.
 */

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  // Master Gain
  private masterGain: GainNode | null = null;

  // Sound Channels
  private channels: {
    rain: { gain: GainNode | null; source: AudioNode | null; isRunning: boolean; volume: number };
    cafe: { gain: GainNode | null; source: AudioNode | null; isRunning: boolean; volume: number };
    library: { gain: GainNode | null; source: AudioNode | null; isRunning: boolean; volume: number };
    vinyl: { gain: GainNode | null; source: AudioNode | null; isRunning: boolean; volume: number };
  } = {
    rain: { gain: null, source: null, isRunning: false, volume: 0.5 },
    cafe: { gain: null, source: null, isRunning: false, volume: 0 },
    library: { gain: null, source: null, isRunning: false, volume: 0 },
    vinyl: { gain: null, source: null, isRunning: false, volume: 0 },
  };

  private ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Generate pink/brown noise buffer
  private createNoiseBuffer(seconds: number = 3): AudioBuffer {
    if (!this.ctx) throw new Error('AudioContext missing');
    const bufferSize = this.ctx.sampleRate * seconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Brown/Pink filter integration
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 3.5;
    }
    return buffer;
  }

  // Play a soft high-end wooden meditation bell chime for timer complete or peer nudge
  public playChime(type: 'pomodoro_complete' | 'break_start' | 'peer_nudge' = 'pomodoro_complete') {
    try {
      this.ensureContext();
      if (!this.ctx || !this.masterGain || this.isMuted) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (type === 'pomodoro_complete') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(528, now); // Solfeggio 528Hz healing tone
        osc.frequency.exponentialRampToValueAtTime(1056, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(792, now + 0.6);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);
      } else if (type === 'break_start') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.3);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
      } else {
        // Peer nudge soft wooden bell chime
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
      }

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 2.1);
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  }

  // Start Rain Synthesizer
  public startRain(volume: number = 0.5) {
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;
    this.stopRain();

    const buffer = this.createNoiseBuffer(4);
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Resonant lowpass & bandpass for rain on glass feel
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(850, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.4, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();

    this.channels.rain = {
      gain,
      source: noise,
      isRunning: true,
      volume,
    };
  }

  public stopRain() {
    if (this.channels.rain.source) {
      try {
        (this.channels.rain.source as AudioBufferSourceNode).stop();
      } catch (_) {}
      this.channels.rain.source = null;
    }
    this.channels.rain.isRunning = false;
  }

  // Start Cafe Ambience Synthesizer
  public startCafe(volume: number = 0.4) {
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;
    this.stopCafe();

    const buffer = this.createNoiseBuffer(5);
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Bandpass for warm cafe chatter murmur
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(620, this.ctx.currentTime);
    filter.Q.setValueAtTime(0.8, this.ctx.currentTime);

    // Subtle LFO modulation for human movement rustle
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.3, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(150, this.ctx.currentTime);
    lfo.connect(filter.frequency);
    lfo.start();

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.35, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();

    this.channels.cafe = {
      gain,
      source: noise,
      isRunning: true,
      volume,
    };
  }

  public stopCafe() {
    if (this.channels.cafe.source) {
      try {
        (this.channels.cafe.source as AudioBufferSourceNode).stop();
      } catch (_) {}
      this.channels.cafe.source = null;
    }
    this.channels.cafe.isRunning = false;
  }

  // Start Library Whispers Synthesizer
  public startLibrary(volume: number = 0.4) {
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;
    this.stopLibrary();

    const buffer = this.createNoiseBuffer(4);
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.3, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();

    this.channels.library = {
      gain,
      source: noise,
      isRunning: true,
      volume,
    };
  }

  public stopLibrary() {
    if (this.channels.library.source) {
      try {
        (this.channels.library.source as AudioBufferSourceNode).stop();
      } catch (_) {}
      this.channels.library.source = null;
    }
    this.channels.library.isRunning = false;
  }

  // Start Vinyl Lofi Crackle Synthesizer
  public startVinyl(volume: number = 0.4) {
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;
    this.stopVinyl();

    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // Periodic subtle pop/crackle impulses
      if (Math.random() < 0.0008) {
        data[i] = (Math.random() * 2 - 1) * 0.9;
      } else {
        data[i] = (Math.random() * 2 - 1) * 0.02;
      }
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);

    // Warm sub-hum (60Hz turntable needle ground hum)
    const hum = this.ctx.createOscillator();
    hum.frequency.setValueAtTime(55, this.ctx.currentTime);
    const humGain = this.ctx.createGain();
    humGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    hum.connect(humGain);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.4, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    humGain.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
    hum.start();

    this.channels.vinyl = {
      gain,
      source: noise,
      isRunning: true,
      volume,
    };
  }

  public stopVinyl() {
    if (this.channels.vinyl.source) {
      try {
        (this.channels.vinyl.source as AudioBufferSourceNode).stop();
      } catch (_) {}
      this.channels.vinyl.source = null;
    }
    this.channels.vinyl.isRunning = false;
  }

  public setChannelVolume(channel: 'rain' | 'cafe' | 'library' | 'vinyl', vol: number) {
    this.channels[channel].volume = vol;
    if (this.channels[channel].gain && this.ctx) {
      this.channels[channel].gain!.gain.setValueAtTime(vol * 0.4, this.ctx.currentTime);
    }
    if (vol > 0 && !this.channels[channel].isRunning) {
      if (channel === 'rain') this.startRain(vol);
      if (channel === 'cafe') this.startCafe(vol);
      if (channel === 'library') this.startLibrary(vol);
      if (channel === 'vinyl') this.startVinyl(vol);
    } else if (vol === 0 && this.channels[channel].isRunning) {
      if (channel === 'rain') this.stopRain();
      if (channel === 'cafe') this.stopCafe();
      if (channel === 'library') this.stopLibrary();
      if (channel === 'vinyl') this.stopVinyl();
    }
  }

  public getChannelStates() {
    return {
      rain: { isRunning: this.channels.rain.isRunning, volume: this.channels.rain.volume },
      cafe: { isRunning: this.channels.cafe.isRunning, volume: this.channels.cafe.volume },
      library: { isRunning: this.channels.library.isRunning, volume: this.channels.library.volume },
      vinyl: { isRunning: this.channels.vinyl.isRunning, volume: this.channels.vinyl.volume },
      isMuted: this.isMuted,
    };
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public stopAll() {
    this.stopRain();
    this.stopCafe();
    this.stopLibrary();
    this.stopVinyl();
  }
}

export const audioSynth = new AudioSynthesizer();
