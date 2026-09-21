import { useEffect, useRef } from 'react';
import { Emulator } from '../emulator/Emulator.js';
import { KEY_MAP } from '../emulator/keymap.js';

// Canvas de 256x240 donde corre el juego. Arranca al recibir una ROM y se detiene al salir.
export default function NesScreen({ rom, audio, onError, onAudioState }) {
    const canvasRef = useRef(null);
    const emuRef = useRef(null);
    const levelRef = useRef(audio);

    // Aplica volumen y silencio sin reiniciar el emulador.
    useEffect(() => {
        levelRef.current = audio;
        emuRef.current?.audio.setLevel(audio.volume, audio.muted);
    }, [audio]);

    useEffect(() => {
        const emu = new Emulator(canvasRef.current);
        emu.audio.setLevel(levelRef.current.volume, levelRef.current.muted);

        try {
            emu.load(rom.data);
        } catch (e) {
            emu.destroy();
            onError(/mapper/i.test(e.message) ? `Mapper ${rom.mapper} no soportado` : 'No se pudo iniciar la ROM');
            return undefined;
        }

        emuRef.current = emu;
        emu.audio.onStateChange(onAudioState);
        onAudioState(emu.audio.state);
        emu.start();

        const onKeyDown = (e) => {
            const button = KEY_MAP[e.code];
            if (button === undefined) return;
            e.preventDefault(); // evita el scroll con las flechas y que Enter active botones
            if (!e.repeat) emu.buttonDown(button);
        };
        const onKeyUp = (e) => {
            const button = KEY_MAP[e.code];
            if (button === undefined) return;
            e.preventDefault();
            emu.buttonUp(button);
        };
        const onBlur = () => emu.releaseAll(); // evita botones "pegados" al cambiar de ventana

        // El navegador solo activa el sonido tras un clic o una tecla del usuario.
        const wake = () => emu.audio.resume();
        wake();

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        window.addEventListener('blur', onBlur);
        window.addEventListener('keydown', wake);
        window.addEventListener('pointerdown', wake);

        return () => {
            emuRef.current = null;
            emu.destroy();
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
            window.removeEventListener('blur', onBlur);
            window.removeEventListener('keydown', wake);
            window.removeEventListener('pointerdown', wake);
        };
    }, [rom, onError, onAudioState]);

    return <canvas ref={canvasRef} className="nes-canvas" width={256} height={240} />;
}