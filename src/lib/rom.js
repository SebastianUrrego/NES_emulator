// Lectura y validación de la cabecera iNES / NES 2.0 de una ROM de NES.

export const MAX_ROM_BYTES = 8 * 1024 * 1024;

export class RomError extends Error { }

const MAGIC = [0x4e, 0x45, 0x53, 0x1a]; // "NES" + EOF

export function parseRom(buffer) {
  const data = new Uint8Array(buffer);

  if (data.length < 16 || MAGIC.some((byte, i) => data[i] !== byte)) {
    throw new RomError('No parece una ROM de NES (falta la cabecera iNES).');
  }

  const flags6 = data[6];
  const flags7 = data[7];
  const nes2 = (flags7 & 0x0c) === 0x08;

  let prgBanks = data[4]; // bloques de 16 KB
  let chrBanks = data[5]; // bloques de 8 KB
  let mapper = (flags7 & 0xf0) | (flags6 >> 4);

  if (nes2) {
    mapper |= (data[8] & 0x0f) << 8;
    if ((data[9] & 0x0f) !== 0x0f) prgBanks |= (data[9] & 0x0f) << 8;
    if (data[9] >> 4 !== 0x0f) chrBanks |= (data[9] >> 4) << 8;
  }

  const trainer = Boolean(flags6 & 0x04);
  const expected = 16 + (trainer ? 512 : 0) + prgBanks * 16384 + chrBanks * 8192;
  if (prgBanks === 0 || data.length < expected) {
    throw new RomError('ROM incompleta o corrupta.');
  }

  return {
    data,
    format: nes2 ? 'NES 2.0' : 'iNES',
    mapper,
    prgBanks,
    chrBanks,
    prgKB: prgBanks * 16,
    chrKB: chrBanks * 8,
    trainer,
    battery: Boolean(flags6 & 0x02),
    mirroring: flags6 & 0x08 ? 'cuatro pantallas' : flags6 & 0x01 ? 'vertical' : 'horizontal',
  };
}

export async function readRomFile(file) {
  if (file.size > MAX_ROM_BYTES) {
    throw new RomError('El archivo es demasiado grande para ser una ROM de NES.');
  }
  const rom = parseRom(await file.arrayBuffer());
  return { ...rom, name: file.name, size: file.size };
}
