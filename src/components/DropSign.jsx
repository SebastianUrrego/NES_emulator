// Letrero que se muestra sobre la estática.
export default function DropSign({ dragging, error, loading }) {
  let title = 'Arrastre el archivo .ROM';
  let hint = 'o haga clic para elegirlo';

  if (loading) {
    title = 'Cargando...';
    hint = '';
  } else if (dragging) {
    title = 'Suelte el archivo';
    hint = '';
  } else if (error) {
    title = 'Error';
    hint = error;
  }

  const cls = ['sign', dragging && 'sign--dragging', error && !dragging && 'sign--error']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cls} role="status" aria-live="polite">
      <div className="sign__box">
        <p className="sign__title">{title}</p>
        {hint && <p className="sign__hint">{hint}</p>}
        {!error && !loading && <span className="sign__arrow" aria-hidden="true" />}
      </div>
    </div>
  );
}

