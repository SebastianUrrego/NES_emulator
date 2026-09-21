const CONTROLS = [
    ['Flechas / WASD', 'Mover'],
    ['X', 'A'],
    ['Z', 'B'],
    ['Enter', 'Start'],
    ['Shift', 'Select'],
    ['M', 'Silencio'],
];

function SpeakerIcon({ muted }) {
    return (
        <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M11 5 6 9H3v6h3l5 4V5z" fill="currentColor" />
            {muted ? (
                <>
                    <path d="M16 9l5 6" />
                    <path d="M21 9l-5 6" />
                </>
            ) : (
                <>
                    <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                    <path d="M18.5 5.5a9 9 0 0 1 0 13" />
                </>
            )}
        </svg>
    );
}

// Barra bajo el televisor: datos de la ROM, sonido, controles y botón para expulsarla.
export default function Hud({ rom, audio, audioState, onVolume, onToggleMute, onEject }) {
    const silent = audio.muted || audio.volume === 0;

    return (
        <section className="hud">
            <div className="hud__top">
                <div className="hud__game">
                    <strong className="hud__name">{rom.name}</strong>
                    <span className="hud__meta">
                        Mapper {rom.mapper} · PRG {rom.prgKB} KB · CHR {rom.chrKB ? `${rom.chrKB} KB` : 'RAM'}
                    </span>
                </div>

                <div className="hud__actions">
                    <div className="hud__sound">
                        <button
                            type="button"
                            className="hud__icon"
                            onClick={onToggleMute}
                            aria-pressed={audio.muted}
                            aria-label={audio.muted ? 'Activar sonido' : 'Silenciar'}
                            title="Silenciar (M)"
                        >
                            <SpeakerIcon muted={silent} />
                        </button>
                        <input
                            className="hud__volume"
                            type="range"
                            min="0"
                            max="100"
                            value={audio.muted ? 0 : Math.round(audio.volume * 100)}
                            onChange={(e) => onVolume(Number(e.target.value) / 100)}
                            aria-label="Volumen"
                        />
                    </div>
                    <button type="button" className="hud__btn" onClick={onEject}>
                        Expulsar ROM
                    </button>
                </div>
            </div>

            {audioState === 'suspended' && (
                <p className="hud__hint">Pulsa cualquier tecla o haz clic para activar el sonido.</p>
            )}

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