import { NES } from 'jsnes';

const WIDTH = 256;
const HEIGHT = 240;
const FRAME_MS = 1000 / 60.0988; // la NES (NTSC) va a ~60.1 cuadros por segundo
const MAX_CATCH_UP = 4; // cuadros máximos que se recuperan de una vez si el navegador se atrasa

// jsnes espera la ROM como cadena binaria (un carácter por byte), no como Uint8Array.
export function bytesToBinaryString(bytes) {
    const CHUNK = 0x8000;
    let out = '';
    for (let i = 0; i < bytes.length; i += CHUNK) {
        out += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
    }
    return out;
}

// Envuelve jsnes: dibuja cada cuadro en un <canvas> y corre el bucle a ~60 fps.
// No depende de React, así las siguientes etapas (audio, gamepad, estados) se añaden aquí.
export class Emulator {
    constructor(canvas) {
        this.ctx = canvas.getContext('2d');
        this.image = this.ctx.createImageData(WIDTH, HEIGHT);
        this.pixels = new Uint32Array(this.image.data.buffer);
        this.dirty = false;

        this.raf = 0;
        this.last = 0;
        this.acc = 0;

        this.nes = new NES({
            onFrame: (frameBuffer) => this.storeFrame(frameBuffer),
            onAudioSample: () => { }, // el sonido llega en la etapa 3
        });

        this.tick = this.tick.bind(this);
    }

    load(romBytes) {
        this.nes.loadROM(bytesToBinaryString(romBytes));
    }

    storeFrame(frameBuffer) {
        for (let i = 0; i < this.pixels.length; i++) {
            this.pixels[i] = 0xff000000 | frameBuffer[i];
        }
        this.dirty = true;
    }

    start() {
        this.last = performance.now();
        this.acc = 0;
        this.raf = requestAnimationFrame(this.tick);
    }

    stop() {
        cancelAnimationFrame(this.raf);
        this.raf = 0;
    }

    tick(now) {
        this.raf = requestAnimationFrame(this.tick);

        // Con la pestaña en segundo plano `now` salta mucho: se limita para no acelerar el juego.
        this.acc += Math.min(now - this.last, 100);
        this.last = now;

        let frames = 0;
        while (this.acc >= FRAME_MS && frames < MAX_CATCH_UP) {
            this.nes.frame();
            this.acc -= FRAME_MS;
            frames++;
        }
        if (frames === MAX_CATCH_UP) this.acc = 0;

        if (this.dirty) {
            this.ctx.putImageData(this.image, 0, 0);
            this.dirty = false;
        }
    }

    buttonDown(button) {
        this.nes.buttonDown(1, button);
    }

    buttonUp(button) {
        this.nes.buttonUp(1, button);
    }

    releaseAll() {
        for (let button = 0; button < 8; button++) this.nes.buttonUp(1, button);
    }
}