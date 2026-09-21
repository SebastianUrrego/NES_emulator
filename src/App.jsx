import { useCallback, useEffect, useRef, useState } from 'react';
import Tv from './components/Tv.jsx';
import StaticCanvas from './components/StaticCanvas.jsx';
import DropSign from './components/DropSign.jsx';
import NesScreen from './components/NesScreen.jsx';
import Hud from './components/Hud.jsx';
import { useFileDrop } from './hooks/useFileDrop.js';
import { useAudioSettings } from './hooks/useAudioSettings.js';
import { readRomFile } from './lib/rom.js';

export default function App() {
  const [rom, setRom] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [audioState, setAudioState] = useState('suspended');
  const { settings: audio, setVolume, toggleMute } = useAudioSettings();
  const inputRef = useRef(null);

  const loadFile = useCallback(async (file) => {
    setError('');
    setLoading(true);
    try {
      setRom(await readRomFile(file));
    } catch (e) {
      setRom(null);
      setError(e.message || 'No se pudo leer el archivo.');
    } finally {
      setLoading(false);
    }
  }, []);

  // El emulador no pudo arrancar la ROM (por ejemplo, mapper no soportado): vuelve a la estática.
  const handleEmulatorError = useCallback((message) => {
    setRom(null);
    setError(message);
  }, []);

  const dragging = useFileDrop(loadFile);

  // Tecla M: silenciar / activar el sonido.
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code === 'KeyM' && !e.repeat) toggleMute();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggleMute]);

  const openPicker = () => inputRef.current?.click();
  const onPick = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // permite volver a elegir el mismo archivo
    if (file) loadFile(file);
  };
  const eject = () => {
    setRom(null);
    setError('');
  };

  return (
    <main className="stage">
      <div className="console">
        <Tv active={Boolean(rom)} dragging={dragging}>
          {rom ? (
            <NesScreen
              rom={rom}
              audio={audio}
              onError={handleEmulatorError}
              onAudioState={setAudioState}
            />
          ) : (
            <div
              className="screen-drop"
              role="button"
              tabIndex={0}
              aria-label="Arrastre el archivo .ROM o presione Enter para elegirlo"
              onClick={openPicker}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openPicker();
                }
              }}
            >
              <StaticCanvas />
              <DropSign dragging={dragging} error={error} loading={loading} />
            </div>
          )}
        </Tv>

        {rom && (
          <Hud
            rom={rom}
            audio={audio}
            audioState={audioState}
            onVolume={setVolume}
            onToggleMute={toggleMute}
            onEject={eject}
          />
        )}
      </div>

      <input ref={inputRef} type="file" accept=".nes,.rom,.bin" hidden onChange={onPick} />
    </main>
  );
}
