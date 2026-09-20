import { useEffect, useRef } from 'react';
import { Emulator } from '../emulator/Emulator.js';
import { KEY_MAP } from '../emulator/keymap.js';

// Canvas de 256x240 donde corre el juego. Arranca al recibir una ROM y se detiene al salir.
export default function NesScreen({ rom, onError }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const emu = new Emulator(canvasRef.current);

        try {
            emu.load(rom.data);
        } catch (e) {
            onError(/mapper/i.test(e.message) ? `Mapper ${rom.mapper} no soportado` : 'No se pudo iniciar la ROM');
            return undefined;
        }

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

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        window.addEventListener('blur', onBlur);

        return () => {
            emu.stop();
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
            window.removeEventListener('blur', onBlur);
        };
    }, [rom, onError]);

    return <canvas ref={canvasRef} className="nes-canvas" width={256} height={240} />;
}