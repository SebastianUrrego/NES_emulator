// Código del AudioWorklet como texto: se carga desde un Blob, así no depende de la configuración del bundler.
// Corre en el hilo de audio: recibe trozos de muestras (L,R,L,R...) y los reproduce desde un búfer circular.
export const WORKLET_SOURCE = `
class NesAudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.capacity = 1 << 15; // 32768 muestras por canal
    this.mask = this.capacity - 1;
    this.left = new Float32Array(this.capacity);
    this.right = new Float32Array(this.capacity);
    this.readPos = 0;
    this.writePos = 0;
    this.buffered = 0;
    this.started = false;

    // Colchón antes de empezar a sonar (evita cortes) y límite de retardo (evita que el sonido se atrase).
    this.prebuffer = Math.round(sampleRate * 0.06);
    this.maxBuffered = Math.round(sampleRate * 0.25);

    this.underruns = 0;
    this.overruns = 0;
    this.quanta = 0;
    this.port.onmessage = (event) => this.enqueue(event.data);
  }

  enqueue(chunk) {
    const frames = chunk.length >> 1;
    for (let i = 0; i < frames; i++) {
      if (this.buffered === this.capacity) {
        this.readPos = (this.readPos + 1) & this.mask;
        this.buffered--;
      }
      this.left[this.writePos] = chunk[2 * i];
      this.right[this.writePos] = chunk[2 * i + 1];
      this.writePos = (this.writePos + 1) & this.mask;
      this.buffered++;
    }
    if (this.buffered > this.maxBuffered) {
      // Demasiado atrasado: descarta lo más viejo y se queda con un colchón corto.
      const target = this.prebuffer * 2;
      this.readPos = (this.readPos + (this.buffered - target)) & this.mask;
      this.buffered = target;
      this.overruns++;
    }
  }

  process(inputs, outputs) {
    const output = outputs[0];
    const left = output[0];
    const right = output[1] || output[0];

    if (!this.started && this.buffered >= this.prebuffer) this.started = true;

    if (this.started) {
      for (let i = 0; i < left.length; i++) {
        if (this.buffered === 0) {
          this.underruns++; // se acabaron las muestras: silencio y vuelve a llenar el colchón
          this.started = false;
          break;
        }
        left[i] = this.left[this.readPos];
        right[i] = this.right[this.readPos];
        this.readPos = (this.readPos + 1) & this.mask;
        this.buffered--;
      }
    }

    if (++this.quanta % 200 === 0) {
      this.port.postMessage({ buffered: this.buffered, underruns: this.underruns, overruns: this.overruns });
    }
    return true;
  }
}

registerProcessor('nes-audio', NesAudioProcessor);
`;