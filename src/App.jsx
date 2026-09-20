import { useCallback, useRef, useState } from 'react';
import Tv from './components/Tv.jsx';
import StaticCanvas from './components/StaticCanvas.jsx';
import DropSign from './components/DropSign.jsx';
import RomInfo from './components/RomInfo.jsx';
import { useFileDrop } from './hooks/useFileDrop.js';
import { readRomFile } from './lib/rom.js';

export default function App() {
  const [rom, setRom] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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

  const dragging = useFileDrop(loadFile);

  const openPicker = () => inputRef.current?.click();
  const onPick = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // permite volver a elegir el mismo archivo
    if (file) loadFile(file);
  };
  const reset = () => {
    setRom(null);
    setError('');
  };

  return (
    <main className="stage">
      <Tv active={Boolean(rom)} dragging={dragging}>
        {rom ? (
          <RomInfo rom={rom} onReset={reset} />
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

      <input
        ref={inputRef}
        type="file"
        accept=".nes,.rom,.bin"
        hidden
        onChange={onPick}
      />
    </main>
  );
}
