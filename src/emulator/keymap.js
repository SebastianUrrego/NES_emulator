import { Controller } from 'jsnes';

// Teclas (event.code, independiente de la distribución del teclado) -> botón del control 1.
export const KEY_MAP = {
    ArrowUp: Controller.BUTTON_UP,
    KeyW: Controller.BUTTON_UP,
    ArrowDown: Controller.BUTTON_DOWN,
    KeyS: Controller.BUTTON_DOWN,
    ArrowLeft: Controller.BUTTON_LEFT,
    KeyA: Controller.BUTTON_LEFT,
    ArrowRight: Controller.BUTTON_RIGHT,
    KeyD: Controller.BUTTON_RIGHT,
    KeyX: Controller.BUTTON_A,
    KeyZ: Controller.BUTTON_B,
    Enter: Controller.BUTTON_START,
    ShiftLeft: Controller.BUTTON_SELECT,
    ShiftRight: Controller.BUTTON_SELECT,
};