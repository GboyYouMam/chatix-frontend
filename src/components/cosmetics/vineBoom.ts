// Synthesized "vine boom": a falling sine plus a short filtered noise burst. No audio file.
let audioContext: AudioContext | null = null;

export const playVineBoom = (): void => {
    try {
        const AudioCtor =
            window.AudioContext ??
            (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtor) return;
        audioContext ??= new AudioCtor();
        const ctx = audioContext;
        if (ctx.state === 'suspended') void ctx.resume();

        const now = ctx.currentTime;

        const oscillator = ctx.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(140, now);
        oscillator.frequency.exponentialRampToValueAtTime(28, now + 0.6);
        const bodyGain = ctx.createGain();
        bodyGain.gain.setValueAtTime(0.0001, now);
        bodyGain.gain.exponentialRampToValueAtTime(1, now + 0.02);
        bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
        oscillator.connect(bodyGain).connect(ctx.destination);
        oscillator.start(now);
        oscillator.stop(now + 0.9);

        const length = Math.floor(ctx.sampleRate * 0.3);
        const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
        const samples = buffer.getChannelData(0);
        for (let i = 0; i < length; i++) {
            samples[i] = (Math.random() * 2 - 1) * (1 - i / length);
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const lowpass = ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 600;
        const noiseGain = ctx.createGain();
        noiseGain.gain.value = 0.6;
        noise.connect(lowpass).connect(noiseGain).connect(ctx.destination);
        noise.start(now);
    } catch {
        // audio is optional, a silent boom is still a boom
    }
};
