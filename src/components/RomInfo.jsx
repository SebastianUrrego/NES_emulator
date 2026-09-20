// Pantalla "ROM cargada". En la etapa 2 aquí se conectará el emulador.
export default function RomInfo({ rom, onReset }) {
  const rows = [
    ['Archivo', rom.name],
    ['Formato', rom.format],
    ['Mapper', rom.mapper],
    ['PRG', `${rom.prgKB} KB`],
    ['CHR', rom.chrKB ? `${rom.chrKB} KB` : 'RAM'],
    ['Espejo', rom.mirroring],
    ['Bateria', rom.battery ? 'si' : 'no'],
  ];

  return (
    <div className="rom-info">
      <p className="rom-info__title">ROM cargada</p>
      <dl className="rom-info__list">
        {rows.map(([label, value]) => (
          <div key={label} className="rom-info__row">
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <p className="rom-info__note">Emulador: proxima etapa</p>
      <button type="button" className="rom-info__btn" onClick={onReset}>
        Cambiar ROM
      </button>
    </div>
  );
}