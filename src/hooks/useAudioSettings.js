import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'nes-web:audio';
const DEFAULTS = { volume: 0.7, muted: false };

const clamp = (value) => (Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : DEFAULTS.volume);

function load() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return { volume: clamp(Number(saved?.volume ?? DEFAULTS.volume)), muted: Boolean(saved?.muted) };
    } catch {
        return DEFAULTS;
    }
}

// Volumen y silencio, recordados entre visitas.
export function useAudioSettings() {
    const [settings, setSettings] = useState(load);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        } catch {
            /* almacenamiento no disponible: la configuración solo dura esta sesión */
        }
    }, [settings]);

    // Mover el control de volumen también quita el silencio.
    const setVolume = useCallback((volume) => setSettings({ volume: clamp(volume), muted: false }), []);
    const toggleMute = useCallback(() => setSettings((s) => ({ ...s, muted: !s.muted })), []);

    return { settings, setVolume, toggleMute };
}