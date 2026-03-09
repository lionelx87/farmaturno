import { useState } from 'react';
import { usePharmacyApp } from './PharmacyAppContext';
import type { PharmacyEnriched } from '../types/pharmacy';

// ── Icons ─────────────────────────────────────────────────────────────────────

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7zm0-5a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1zm0 16a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1zM4.22 4.22a1 1 0 0 1 1.42 0l1.41 1.41a1 1 0 0 1-1.41 1.42L4.22 5.64a1 1 0 0 1 0-1.42zm13.14 13.14a1 1 0 0 1 1.42 0l1.41 1.41a1 1 0 0 1-1.41 1.42l-1.41-1.41a1 1 0 0 1 0-1.42zM3 12a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1zm16 0a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2h-2a1 1 0 0 1-1-1zM4.22 19.78a1 1 0 0 1 0-1.42l1.41-1.41a1 1 0 0 1 1.42 1.41l-1.41 1.41a1 1 0 0 1-1.42 0zM17.36 6.64a1 1 0 0 1 0-1.42l1.41-1.41a1 1 0 0 1 1.42 1.42l-1.41 1.41a1 1 0 0 1-1.42 0z" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
    </svg>
  );
}

function PhoneIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.62 10.79a15.054 15.054 0 0 0 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </svg>
  );
}

function WalkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7" />
    </svg>
  );
}

function CarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
    </svg>
  );
}

function DirectionsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21.71 11.29l-9-9a1 1 0 0 0-1.42 0l-9 9a1 1 0 0 0 0 1.42l9 9a1 1 0 0 0 1.42 0l9-9a1 1 0 0 0 0-1.42zM14 14.5V12h-4v3H8v-4a1 1 0 0 1 1-1h5V7.5l3.5 3.5-3.5 3.5z" />
    </svg>
  );
}

// ── Detail card ───────────────────────────────────────────────────────────────

function PharmacyDetailCard({ pharmacy }: { pharmacy: PharmacyEnriched }) {
  const { locationStatus, distances, travelMode, onGetDirections, onTravelModeChange } = usePharmacyApp();
  const distance = distances[pharmacy.name];

  return (
    <>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-[15px] text-gray-900 dark:text-white mb-1 leading-snug">
            {pharmacy.name}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 leading-snug">{pharmacy.address}</p>
          {distance && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/60 px-2 py-0.5 rounded-full mb-2">
              <PinIcon />
              ~{distance.label}
            </span>
          )}
          {pharmacy.phone && (
            <a
              href={`tel:${pharmacy.phone.replace(/\D/g, '')}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400 hover:underline"
            >
              <PhoneIcon size={14} />
              {pharmacy.phone}
            </a>
          )}
        </div>

        {pharmacy.lat !== 0 && (
          <div className="flex flex-col rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0">
            <button
              onClick={() => onTravelModeChange('WALKING')}
              className={`flex items-center justify-center p-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 ${
                travelMode === 'WALKING'
                  ? 'bg-green-600 text-white'
                  : 'bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              aria-label="A pie"
            >
              <WalkIcon />
            </button>
            <button
              onClick={() => onTravelModeChange('DRIVING')}
              className={`flex items-center justify-center p-2.5 transition-colors border-t border-gray-200 dark:border-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 ${
                travelMode === 'DRIVING'
                  ? 'bg-green-600 text-white'
                  : 'bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              aria-label="En auto"
            >
              <CarIcon />
            </button>
          </div>
        )}
      </div>

      {pharmacy.lat !== 0 && (
        <div className="mt-3 flex flex-col gap-2">
          <button
            onClick={onGetDirections}
            disabled={locationStatus === 'loading'}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 shadow-sm"
          >
            <DirectionsIcon />
            {locationStatus === 'loading' ? 'Obteniendo ubicación…' : 'Cómo llegar'}
          </button>
          {locationStatus === 'denied' && (
            <p className="text-xs text-red-500 dark:text-red-400">
              Habilitá la ubicación en la barra del navegador y recargá la página.
            </p>
          )}
          {locationStatus === 'unavailable' && (
            <p className="text-xs text-amber-500 dark:text-amber-400">
              Tu navegador no soporta geolocalización.
            </p>
          )}
        </div>
      )}
    </>
  );
}

// ── Date formatting ───────────────────────────────────────────────────────────

function formatDateParts(dateStr: string): { weekday: string; dayMonth: string } {
  const date = new Date(dateStr + 'T12:00:00');
  const weekday = date.toLocaleDateString('es-AR', { weekday: 'long' });
  const dayMonth = date.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });
  return {
    weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
    dayMonth,
  };
}

// ── Shared content ────────────────────────────────────────────────────────────

function SidebarContent({ isMinimized = false }: { isMinimized?: boolean }) {
  const {
    pharmaciesForDate,
    selectedDate,
    selectedPharmacy,
    availableDates,
    canGoPrev,
    canGoNext,
    isDark,
    distances,
    onPharmacySelect,
    onDateChange,
    onToggleTheme,
  } = usePharmacyApp();

  const { weekday, dayMonth } = formatDateParts(selectedDate);
  const currentIndex = availableDates.indexOf(selectedDate);

  function navigateDate(direction: -1 | 1) {
    const next = availableDates[currentIndex + direction];
    if (next) onDateChange(next);
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <img src="/favicon.svg" alt="Farmaturno" width="28" height="28" />
          <div>
            <span className="font-brand font-bold text-[15px] text-gray-900 dark:text-white leading-none block tracking-tight">
              Farmaturno
            </span>
            <span className="text-[11px] text-gray-400 dark:text-gray-500 leading-none block mt-0.5">
              Bariloche
            </span>
          </div>
        </div>
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          aria-label="Alternar tema"
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>

      {/* Collapsible: date selector + pharmacy list */}
      <div className={`flex-1 grid transition-[grid-template-rows] duration-300 motion-reduce:transition-none ${isMinimized ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'}`}>
        <div className="overflow-hidden flex flex-col min-h-0">

          {/* Date selector */}
          <div className="flex items-center justify-between px-2 py-3 border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => navigateDate(-1)}
              disabled={!canGoPrev}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-25 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
              aria-label="Día anterior"
            >
              <ChevronLeft />
            </button>
            <div className="text-center">
              <p className="font-brand font-bold text-[15px] text-gray-900 dark:text-white leading-none">
                {weekday}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{dayMonth}</p>
            </div>
            <button
              onClick={() => navigateDate(1)}
              disabled={!canGoNext}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-25 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
              aria-label="Día siguiente"
            >
              <ChevronRight />
            </button>
          </div>

          {/* Pharmacy list */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {pharmaciesForDate.length === 0 ? (
              <p className="px-4 py-8 text-sm text-center text-gray-400 dark:text-gray-500">
                No hay farmacias de turno para este día.
              </p>
            ) : (
              pharmaciesForDate.map(p => {
                const isSelected = selectedPharmacy?.name === p.name;
                return (
                  <button
                    key={p.name}
                    onClick={() => onPharmacySelect(p)}
                    className={`w-full flex items-center gap-3 px-3.25 py-3.5 text-left transition-colors border-b border-gray-100 dark:border-gray-800/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-green-500 border-l-[3px] ${
                      isSelected
                        ? 'border-l-green-500 bg-green-50/70 dark:bg-green-950/30 hover:bg-green-50 dark:hover:bg-green-950/40'
                        : 'border-l-transparent hover:bg-gray-50/80 dark:hover:bg-gray-900/60'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-[14px] truncate leading-snug ${
                        isSelected ? 'text-green-700 dark:text-green-300' : 'text-gray-900 dark:text-white'
                      }`}>
                        {p.name}
                      </p>
                      <p className="text-[13px] text-gray-400 dark:text-gray-500 truncate mt-0.5">{p.address}</p>
                      {distances[p.name] && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-green-700 dark:text-green-400 mt-1">
                          <PinIcon />
                          ~{distances[p.name].label}
                        </span>
                      )}
                    </div>
                    {p.phone && (
                      <a
                        href={`tel:${p.phone!.replace(/\D/g, '')}`}
                        onClick={e => e.stopPropagation()}
                        className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                        aria-label={`Llamar a ${p.name}`}
                      >
                        <PhoneIcon size={16} />
                      </a>
                    )}
                  </button>
                );
              })
            )}
          </div>

        </div>
      </div>

      {/* Detail card */}
      {selectedPharmacy && (
        <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-gray-50/80 dark:bg-gray-900/60">
          <PharmacyDetailCard pharmacy={selectedPharmacy} />
        </div>
      )}
    </>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

export default function Sidebar() {
  const { selectedPharmacy, onPharmacyDeselect, isDark, onToggleTheme } = usePharmacyApp();
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <>
      {/* ── DESKTOP sidebar ── */}
      <aside className="hidden md:flex w-80 shrink-0 flex-col h-full border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <SidebarContent />
      </aside>

      {/* ── MOBILE bottom sheet ── */}
      <div className="md:hidden fixed inset-0 pointer-events-none z-20">
        {selectedPharmacy ? (
          /* Card mode: compact sheet */
          <div className="absolute bottom-0 left-0 right-0 pointer-events-auto flex flex-col rounded-t-3xl border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-[0_-8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_-8px_32px_rgba(0,0,0,0.4)] h-auto max-h-[55vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <button
                onClick={onPharmacyDeselect}
                className="flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
              >
                <ChevronLeft />
                Lista
              </button>
              <button
                onClick={onToggleTheme}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Alternar tema"
              >
                {isDark ? <SunIcon /> : <MoonIcon />}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <PharmacyDetailCard pharmacy={selectedPharmacy} />
            </div>
          </div>
        ) : (
          /* List mode: always fully visible, minimizable */
          <div className="absolute bottom-0 left-0 right-0 pointer-events-auto flex flex-col rounded-t-3xl border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-[0_-8px_32px_rgba(0,0,0,0.10)] dark:shadow-[0_-8px_32px_rgba(0,0,0,0.4)] h-auto max-h-[80vh] overflow-y-auto">
            <button
              className="flex flex-col items-center pt-3 pb-2 w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded-t-3xl"
              onClick={() => setIsMinimized(m => !m)}
              aria-label={isMinimized ? 'Expandir' : 'Minimizar'}
            >
              <span className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
            </button>
            <SidebarContent isMinimized={isMinimized} />
          </div>
        )}
      </div>
    </>
  );
}
