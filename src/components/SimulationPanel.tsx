import { useSyncExternalStore } from 'react';
import { simulation } from '../lib/geolocation';

function PlayPauseIcon({ playing }: { playing: boolean }) {
  return playing ? (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
    </svg>
  ) : (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export default function SimulationPanel() {
  const state = useSyncExternalStore(simulation.subscribe, simulation.getSnapshot, simulation.getSnapshot);

  return (
    <div className="absolute top-14 right-2 z-30 flex items-center gap-1 rounded-full bg-gray-900/85 text-white pl-2.5 pr-1.5 py-1.5 text-[11px] font-semibold shadow-lg backdrop-blur-sm">
      <span className="text-amber-400 tracking-wider">SIM</span>
      <button
        onClick={() => simulation.setPlaying(!state.playing)}
        className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-white/15 transition-colors"
        aria-label={state.playing ? 'Pausar simulación' : 'Reanudar simulación'}
      >
        <PlayPauseIcon playing={state.playing} />
      </button>
      <button
        onClick={() => simulation.setMultiplier(state.multiplier === 1 ? 4 : 1)}
        className={`px-2 h-6 rounded-full transition-colors ${
          state.multiplier === 4 ? 'bg-amber-500 text-gray-900' : 'hover:bg-white/15'
        }`}
        aria-label="Alternar velocidad de simulación"
      >
        ×{state.multiplier}
      </button>
      <button
        onClick={() => simulation.setLateralOffset(!state.lateralOffset)}
        className={`px-2 h-6 rounded-full transition-colors ${
          state.lateralOffset ? 'bg-amber-500 text-gray-900' : 'hover:bg-white/15'
        }`}
        aria-pressed={state.lateralOffset}
      >
        Desvío
      </button>
      {state.hasRoute && (
        <span className={`px-1 ${state.finished ? 'text-green-400' : 'text-gray-400'}`}>
          {state.finished ? 'fin' : 'en ruta'}
        </span>
      )}
    </div>
  );
}
