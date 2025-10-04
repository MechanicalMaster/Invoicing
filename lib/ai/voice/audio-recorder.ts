/**
 * AudioRecorder - Browser MediaRecorder wrapper for voice recording
 */

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private audioContext: AudioContext | null = null;

  /**
   * Request microphone permission and initialize recorder
   */
  async requestPermission(): Promise<boolean> {
    try {
      // Check if permission already granted
      const permissionStatus = await navigator.permissions.query({
        name: 'microphone' as PermissionName
      });

      if (permissionStatus.state === 'denied') {
        throw new Error('Microphone permission denied. Please enable it in browser settings.');
      }

      // Request microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,           // Mono audio
          sampleRate: 16000,         // 16kHz (optimal for Whisper)
          echoCancellation: true,    // Reduce echo
          noiseSuppression: true,    // Reduce background noise
          autoGainControl: true,     // Normalize volume
        }
      });

      return true;
    } catch (error: any) {
      console.error('Microphone permission error:', error);

      if (error.name === 'NotAllowedError') {
        throw new Error('Microphone access denied. Please allow microphone access to use voice input.');
      } else if (error.name === 'NotFoundError') {
        throw new Error('No microphone found. Please connect a microphone and try again.');
      } else {
        throw new Error('Failed to access microphone. Please check your device settings.');
      }
    }
  }

  /**
   * Start recording audio
   */
  async startRecording(onDataAvailable?: (amplitude: number) => void): Promise<void> {
    if (!this.stream) {
      throw new Error('Microphone not initialized. Call requestPermission() first.');
    }

    this.audioChunks = [];

    // Set up audio context for waveform visualization
    this.audioContext = new AudioContext();
    const source = this.audioContext.createMediaStreamSource(this.stream);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    source.connect(this.analyser);

    // Start visualization loop
    if (onDataAvailable) {
      this.visualize(onDataAvailable);
    }

    // Create MediaRecorder with optimal settings
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm';

    this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.start(100); // Collect data every 100ms
  }

  /**
   * Visualize audio waveform in real-time
   */
  private visualize(callback: (amplitude: number) => void): void {
    if (!this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (this.mediaRecorder?.state !== 'recording') return;

      requestAnimationFrame(draw);
      this.analyser!.getByteTimeDomainData(dataArray);

      // Calculate amplitude (0-1)
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        const amplitude = (dataArray[i] - 128) / 128;
        sum += amplitude * amplitude;
      }
      const rms = Math.sqrt(sum / bufferLength);

      callback(rms);
    };

    draw();
  }

  /**
   * Stop recording and return audio blob
   */
  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No recording in progress'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.cleanup();
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Cancel recording and cleanup
   */
  cancelRecording(): void {
    if (this.mediaRecorder?.state === 'recording') {
      this.mediaRecorder.stop();
    }
    this.cleanup();
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.analyser = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
  }
}
