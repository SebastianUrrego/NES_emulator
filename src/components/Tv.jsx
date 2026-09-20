// Marco de televisor CRT. Todo lo que se pase como `children` se dibuja dentro de la pantalla.
export default function Tv({ children, active = false, dragging = false }) {
  const cls = ['tv', active && 'tv--on', dragging && 'tv--dragging'].filter(Boolean).join(' ');

  return (
    <div className={cls}>
      <div className="tv__body">
        <div className="tv__bezel">
          <div className="tv__screen">
            {children}
            <div className="tv__scanlines" aria-hidden="true" />
            <div className="tv__glare" aria-hidden="true" />
          </div>
        </div>

        <div className="tv__panel" aria-hidden="true">
          <div className="tv__knob" />
          <div className="tv__knob tv__knob--small" />
          <div className="tv__speaker">
            {Array.from({ length: 7 }, (_, i) => (
              <span key={i} />
            ))}
          </div>
          <div className="tv__led" />
        </div>
      </div>
      <div className="tv__feet" aria-hidden="true">
        <span />
        <span />
      </div>
    </div>
  );
}
