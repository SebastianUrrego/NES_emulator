const CONTROLS = [
    ['Flechas / WASD', 'Mover'],
    ['X', 'A'],
    ['Z', 'B'],
    ['Enter', 'Start'],
    ['Shift', 'Select'],
];

// Barra bajo el televisor: datos de la ROM, controles y botón para expulsarla.
export default function Hud({ rom, onEject }) {
    return (
        <section className="hud">
            <div className="hud__top">
                <div className="hud__game">
                    <strong className="hud__name">{rom.name}</strong>
                    <span className="hud__meta">
                        Mapper {rom.mapper} · PRG {rom.prgKB} KB · CHR {rom.chrKB ? `${rom.chrKB} KB` : 'RAM'}
                    </span>
                </div>
                <button type="button" className="hud__btn" onClick={onEject}>
                    Expulsar ROM
                </button>
            </div>

            <ul className="hud__keys">
                {CONTROLS.map(([key, action]) => (
                    <li key={key}>
                        <kbd>{key}</kbd> {action}
                    </li>
                ))}
            </ul>
        </section>
    );
}