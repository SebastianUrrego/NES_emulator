# NES Web

Emulador de NES para el navegador, hecho con React y Vite. La interfaz es un televisor CRT retro: la pantalla muestra estática con un letrero que dice **"Arrastre el archivo .ROM"**, y basta con soltar la ROM sobre la ventana para cargarla.

> Proyecto en construcción, se desarrolla por etapas.

## Estado actual

**Etapa 1 completada: interfaz y carga de ROM.**

- Televisor CRT con marco, perillas, altavoz y LED, hecho solo con CSS.
- Estática animada en un `<canvas>` de 256x240 (la resolución de la NES), con ruido, banda que sube y parpadeo. Respeta `prefers-reduced-motion`.
- Letrero pixelado con la fuente Press Start 2P. Cambia según el estado: arrastrando, cargando y error.
- Arrastrar y soltar en toda la ventana, o clic / Enter sobre la pantalla para abrir el selector de archivos.
- Lectura y validación de la cabecera iNES / NES 2.0: mapper, tamaño de PRG y CHR, espejo y batería. Detecta archivos que no son ROMs y ROMs incompletas.
- Al cargar una ROM válida, la pantalla muestra sus datos en verde fosforito, con un botón para cambiarla.
- Diseño adaptable a móvil.

**Etapa 2 completada: emulador con video y teclado.**

- Núcleo `jsnes` envuelto en la clase `Emulator`, que corre a ~60 fps y dibuja cada cuadro en un `<canvas>` de 256x240.
- Teclado: flechas o WASD para moverse, `X` = A, `Z` = B, `Enter` = Start, `Shift` = Select.
- Barra inferior con los datos de la ROM, la leyenda de controles y el botón "Expulsar ROM".
- Si el mapper no está soportado, se muestra el error en el letrero.

<img width="1376" height="881" alt="image" src="https://github.com/user-attachments/assets/0ef0b976-01ae-41ec-bc9f-63c8734822ce" />

## Hoja de ruta

- [x] **Etapa 1:** interfaz CRT, estática, letrero y carga de ROM
- [x] **Etapa 2:** núcleo del emulador ([jsnes](https://github.com/bfirsh/jsnes)), video en pantalla y control con teclado
- [ ] **Etapa 3:** sonido con botón de silencio
- [ ] **Etapa 4:** soporte de gamepad (Gamepad API)
- [ ] **Etapa 5:** guardar y cargar estado

## Cómo correrlo

Requisitos: [Node.js](https://nodejs.org/) 18 o superior.

```bash
npm install
npm run dev
```

Abre la dirección que muestra la terminal (normalmente `http://localhost:5173`) y arrastra un archivo `.nes` a la pantalla.

Para generar la versión de producción:

```bash
npm run build
npm run preview
```

## Estructura

```
src/
├── main.jsx                    punto de entrada
├── App.jsx                     estado general y flujo de carga
├── index.css                   estilos del televisor, letrero y pantalla
├── components/
│   ├── Tv.jsx                  marco del televisor CRT
│   ├── StaticCanvas.jsx        estática animada
│   ├── DropSign.jsx            letrero "Arrastre el archivo .ROM"
│   └── RomInfo.jsx             datos de la ROM cargada
├── hooks/
│   └── useFileDrop.js          arrastrar y soltar sobre la ventana
└── lib/
    └── rom.js                  lectura y validación de la cabecera iNES
```

## Notas

- Las ROMs no se incluyen en el repositorio. Usa solo juegos que poseas legalmente. Por eso el `.gitignore` excluye los archivos `.nes` y `.rom`.
- La fuente Press Start 2P se carga desde Google Fonts. Sin conexión, la interfaz usa una fuente monoespaciada.
- La fuente pixelada no tiene tildes ni eñes, por eso los textos de la pantalla van sin acentos.
