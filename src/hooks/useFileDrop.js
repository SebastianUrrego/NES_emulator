import { useEffect, useRef, useState } from 'react';

// Escucha arrastrar y soltar archivos sobre toda la ventana.
// Devuelve `dragging` para poder resaltar la interfaz mientras se arrastra.
export function useFileDrop(onFile) {
  const [dragging, setDragging] = useState(false);
  const depth = useRef(0);
  const handler = useRef(onFile);

  useEffect(() => {
    handler.current = onFile;
  }, [onFile]);

  useEffect(() => {
    const hasFiles = (e) => Array.from(e.dataTransfer?.types ?? []).includes('Files');

    const onEnter = (e) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth.current += 1;
      setDragging(true);
    };
    const onOver = (e) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    };
    const onLeave = (e) => {
      if (!hasFiles(e)) return;
      depth.current = Math.max(0, depth.current - 1);
      if (depth.current === 0) setDragging(false);
    };
    const onDrop = (e) => {
      if (!hasFiles(e)) return;
      e.preventDefault(); // evita que el navegador abra el archivo
      depth.current = 0;
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handler.current(file);
    };

    window.addEventListener('dragenter', onEnter);
    window.addEventListener('dragover', onOver);
    window.addEventListener('dragleave', onLeave);
    window.addEventListener('drop', onDrop);
    return () => {
      window.removeEventListener('dragenter', onEnter);
      window.removeEventListener('dragover', onOver);
      window.removeEventListener('dragleave', onLeave);
      window.removeEventListener('drop', onDrop);
    };
  }, []);

  return dragging;
}
