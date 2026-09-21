import { WORKLET_SOURCE } from './audioWorklet.js';

const CHUNK_SIZE = 8192; // muestras intercaladas (L,R) que caben en un cuadro

// Sonido del emulador: jsnes entrega muestras una a una (onAudioSample); aquí se agrupan por
// cuadro y se envían a un AudioWorklet que las reproduce. Si el navegador no soporta audio
// (o la página no es https/localhost) el emulador sigue funcionando en silencio.
export class NesAudio {
    constructor() {
        this.sampleRate = 44100;
        this.stats = null; // { buffered, underruns, overruns }: útil para depurar cortes de sonido
        this.closed = false;
        this.node = null;
        this.chunk = new Float32Array(CHUNK_SIZE);
        this.length = 0;
        this.levelSet = false;

        if (!window.AudioContext) return;

        this.ctx = new window.AudioContext({ latencyHint: 'interactive' });
        this.sampleRate = this.ctx.sampleRate; // jsnes genera las muestras a esta frecuencia
        this.gain = this.ctx.createGain();
        this.gain.connect(this.ctx.destination);
        this.setup();
    }

    get state() {
        return this.ctx ? this.ctx.state : 'none';
    }

    async setup() {
        if (!this.ctx.audioWorklet) {
            console.warn('AudioWorklet no disponible (hace falta https o localhost): el juego va sin sonido.');
            return;
        }
        const url = URL.createObjectURL(new Blob([WORKLET_SOURCE], { type: 'text/javascript' }));
        try {
            await this.ctx.audioWorklet.addModule(url);
            if (this.closed) return;
            const node = new AudioWorkletNode(this.ctx, 'nes-audio', {
                numberOfInputs: 0,
                numberOfOutputs: 1,
                outputChannelCount: [2],
            });
            node.port.onmessage = (event) => {
                this.stats = event.data;
            };
            node.connect(this.gain);
            this.node = node;
        } catch (error) {
            if (!this.closed) console.warn('No se pudo iniciar el audio:', error);
        } finally {
            URL.revokeObjectURL(url);
        }
    }

    // Volumen 0..1 y silencio. El cambio es gradual para que no suenen "clics".
    setLevel(volume, muted) {
        if (!this.gain) return;
        const target = muted ? 0 : volume * volume; // curva cuadrática: el volumen se siente más natural
        if (!this.levelSet) {
            this.gain.gain.value = target;
            this.levelSet = true;
        } else {
            this.gain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.02);
        }
    }

    // Los navegadores no dejan sonar hasta que haya un clic o tecla del usuario.
    resume() {
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => { });
    }

    onStateChange(callback) {
        if (this.ctx) this.ctx.onstatechange = callback ? () => callback(this.ctx.state) : null;
    }

    // Llamado por jsnes por cada muestra (~44 000 veces por segundo).
    push(left, right) {
        if (!this.node) return;
        if (this.length + 2 > this.chunk.length) this.length = 0; // seguridad: no debería pasar
        this.chunk[this.length++] = left;
        this.chunk[this.length++] = right;
    }

    // Al terminar cada cuadro se envían las muestras acumuladas al hilo de audio.
    flush() {
        if (!this.node) return;
        if (this.ctx.state === 'running' && this.length > 0) {
            const out = this.chunk.slice(0, this.length);
            this.node.port.postMessage(out, [out.buffer]);
        }
        this.length = 0; // con el audio en pausa se descartan, para no acumular retardo
    }

    close() {
        if (this.closed) return;
        this.closed = true;
        if (!this.ctx) return;
        this.ctx.onstatechange = null;
        if (this.node) {
            this.node.port.close();
            this.node.disconnect();
            this.node = null;
        }
        this.ctx.close().catch(() => { });
    }
}