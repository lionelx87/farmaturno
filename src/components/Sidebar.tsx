import { useState } from 'react';
import type { PharmacyEnriched } from '../types/pharmacy';
import type { LocationStatus } from './PharmacyMap';
import type { DistanceResult } from '../lib/distance';

interface Props {
  pharmacies: PharmacyEnriched[];
  selectedDate: string;
  selectedPharmacy: PharmacyEnriched | null;
  availableDates: string[];
  isDark: boolean;
  locationStatus: LocationStatus;
  distances: Record<string, DistanceResult>;
  onDateChange: (date: string) => void;
  onPharmacySelect: (pharmacy: PharmacyEnriched) => void;
  onPharmacyDeselect: () => void;
  onToggleTheme: () => void;
  onGetDirections: () => void;
}

function PharmacyDetailCard({ pharmacy, locationStatus, distance, onGetDirections }: {
  pharmacy: PharmacyEnriched;
  locationStatus: LocationStatus;
  distance?: DistanceResult;
  onGetDirections: () => void;
}) {
  return (
    <>
      <h2 className="font-semibold text-gray-900 dark:text-white mb-1">{pharmacy.name}</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{pharmacy.address}</p>
      {distance && (
        <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">
          ~{distance.label} en línea recta
        </p>
      )}
      {pharmacy.phone && (
        <a
          href={`tel:${pharmacy.phone.replace(/\D/g, '')}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400 hover:underline"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6.62 10.79a15.054 15.054 0 0 0 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
          </svg>
          {pharmacy.phone}
        </a>
      )}
      {pharmacy.lat !== 0 && (
        <div className="mt-3">
          <button
            onClick={onGetDirections}
            disabled={locationStatus === 'loading'}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.71 11.29l-9-9a1 1 0 0 0-1.42 0l-9 9a1 1 0 0 0 0 1.42l9 9a1 1 0 0 0 1.42 0l9-9a1 1 0 0 0 0-1.42zM14 14.5V12h-4v3H8v-4a1 1 0 0 1 1-1h5V7.5l3.5 3.5-3.5 3.5z" />
            </svg>
            {locationStatus === 'loading' ? 'Obteniendo ubicación...' : 'Cómo llegar'}
          </button>
          {locationStatus === 'denied' && (
            <p className="text-xs text-red-500 dark:text-red-400 mt-2">
              Habilitá la ubicación en la barra del navegador y recargá la página.
            </p>
          )}
          {locationStatus === 'unavailable' && (
            <p className="text-xs text-amber-500 dark:text-amber-400 mt-2">
              Tu navegador no soporta geolocalización.
            </p>
          )}
        </div>
      )}
    </>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  const formatted = date.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export default function Sidebar({
  pharmacies,
  selectedDate,
  selectedPharmacy,
  availableDates,
  isDark,
  locationStatus,
  distances,
  onDateChange,
  onPharmacySelect,
  onPharmacyDeselect,
  onToggleTheme,
  onGetDirections,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const currentIndex = availableDates.indexOf(selectedDate);

  function navigateDate(direction: -1 | 1) {
    const next = availableDates[currentIndex + direction];
    if (next) onDateChange(next);
  }

  return (
    <>
      {/* ── DESKTOP sidebar ── */}
      <aside className="hidden md:flex w-80 flex-shrink-0 flex-col h-full border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <SidebarContent
          pharmacies={pharmacies}
          selectedDate={selectedDate}
          selectedPharmacy={selectedPharmacy}
          canGoPrev={currentIndex > 0}
          canGoNext={currentIndex < availableDates.length - 1}
          isDark={isDark}
          locationStatus={locationStatus}
          distances={distances}
          onPrev={() => navigateDate(-1)}
          onNext={() => navigateDate(1)}
          onToggleTheme={onToggleTheme}
          onPharmacySelect={onPharmacySelect}
          onGetDirections={onGetDirections}
        />
      </aside>

      {/* ── MOBILE bottom sheet ── */}
      <div className="md:hidden fixed inset-0 pointer-events-none z-20">
        {selectedPharmacy ? (
          /* Card mode: compact sheet, mapa visible ~62vh */
          <div className="absolute bottom-0 left-0 right-0 pointer-events-auto flex flex-col rounded-t-2xl border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 h-auto max-h-[55vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
              <button
                onClick={onPharmacyDeselect}
                className="flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                </svg>
                Lista
              </button>
              <button
                onClick={onToggleTheme}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Alternar tema"
              >
                {isDark ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7zm0-5a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1zm0 16a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1zM4.22 4.22a1 1 0 0 1 1.42 0l1.41 1.41a1 1 0 0 1-1.41 1.42L4.22 5.64a1 1 0 0 1 0-1.42zm13.14 13.14a1 1 0 0 1 1.42 0l1.41 1.41a1 1 0 0 1-1.41 1.42l-1.41-1.41a1 1 0 0 1 0-1.42zM3 12a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1zm16 0a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2h-2a1 1 0 0 1-1-1zM4.22 19.78a1 1 0 0 1 0-1.42l1.41-1.41a1 1 0 0 1 1.42 1.41l-1.41 1.41a1 1 0 0 1-1.42 0zM17.36 6.64a1 1 0 0 1 0-1.42l1.41-1.41a1 1 0 0 1 1.42 1.42l-1.41 1.41a1 1 0 0 1-1.42 0z" />
                  </svg>
                )}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <PharmacyDetailCard
                pharmacy={selectedPharmacy}
                locationStatus={locationStatus}
                distance={distances[selectedPharmacy.name]}
                onGetDirections={onGetDirections}
              />
            </div>
          </div>
        ) : (
          /* List mode: expandible */
          <div
            className={`absolute bottom-0 left-0 right-0 pointer-events-auto flex flex-col rounded-t-2xl border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 transition-all duration-300 ${
              isExpanded ? 'h-[70vh]' : 'h-[42vh]'
            }`}
          >
            <button
              className="flex justify-center pt-3 pb-1"
              onClick={() => setIsExpanded(e => !e)}
              aria-label={isExpanded ? 'Contraer' : 'Expandir'}
            >
              <span className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
            </button>

            <SidebarContent
              pharmacies={pharmacies}
              selectedDate={selectedDate}
              selectedPharmacy={selectedPharmacy}
              canGoPrev={currentIndex > 0}
              canGoNext={currentIndex < availableDates.length - 1}
              isDark={isDark}
              locationStatus={locationStatus}
              distances={distances}
              onPrev={() => navigateDate(-1)}
              onNext={() => navigateDate(1)}
              onToggleTheme={onToggleTheme}
              onPharmacySelect={onPharmacySelect}
              onGetDirections={onGetDirections}
            />
          </div>
        )}
      </div>

    </>
  );
}

// ── Shared content between desktop sidebar and mobile bottom sheet ──

interface ContentProps {
  pharmacies: PharmacyEnriched[];
  selectedDate: string;
  selectedPharmacy: PharmacyEnriched | null;
  canGoPrev: boolean;
  canGoNext: boolean;
  isDark: boolean;
  locationStatus: LocationStatus;
  distances: Record<string, DistanceResult>;
  onPrev: () => void;
  onNext: () => void;
  onToggleTheme: () => void;
  onPharmacySelect: (pharmacy: PharmacyEnriched) => void;
  onGetDirections: () => void;
}

function SidebarContent({
  pharmacies,
  selectedDate,
  selectedPharmacy,
  canGoPrev,
  canGoNext,
  isDark,
  locationStatus,
  distances,
  onPrev,
  onNext,
  onToggleTheme,
  onPharmacySelect,
  onGetDirections,
}: ContentProps) {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <img src="/favicon.svg" alt="Farmaturno" width="24" height="24" />
          <span className="font-semibold text-gray-900 dark:text-white tracking-tight">
            Farmaturno
          </span>
        </div>
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Alternar tema"
        >
          {isDark ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7zm0-5a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1zm0 16a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1zM4.22 4.22a1 1 0 0 1 1.42 0l1.41 1.41a1 1 0 0 1-1.41 1.42L4.22 5.64a1 1 0 0 1 0-1.42zm13.14 13.14a1 1 0 0 1 1.42 0l1.41 1.41a1 1 0 0 1-1.41 1.42l-1.41-1.41a1 1 0 0 1 0-1.42zM3 12a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1zm16 0a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2h-2a1 1 0 0 1-1-1zM4.22 19.78a1 1 0 0 1 0-1.42l1.41-1.41a1 1 0 0 1 1.42 1.41l-1.41 1.41a1 1 0 0 1-1.42 0zM17.36 6.64a1 1 0 0 1 0-1.42l1.41-1.41a1 1 0 0 1 1.42 1.42l-1.41 1.41a1 1 0 0 1-1.42 0z" />
            </svg>
          )}
        </button>
      </div>

      {/* Date selector */}
      <div className="flex items-center justify-between px-2 py-3 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={onPrev}
          disabled={!canGoPrev}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Día anterior"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </button>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {formatDate(selectedDate)}
        </span>
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Día siguiente"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
          </svg>
        </button>
      </div>

      {/* Pharmacy list */}
      <div className="flex-1 overflow-y-auto">
        {pharmacies.length === 0 ? (
          <p className="px-4 py-6 text-sm text-center text-gray-500 dark:text-gray-400">
            No hay farmacias de turno para este día.
          </p>
        ) : (
          pharmacies.map(p => (
            <button
              key={p.name}
              onClick={() => onPharmacySelect(p)}
              className={`w-full flex items-center gap-3 px-4 py-4 border-b border-gray-100 dark:border-gray-800 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-900 ${
                selectedPharmacy?.name === p.name
                  ? 'bg-green-50 dark:bg-green-950'
                  : ''
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">{p.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{p.address}</p>
                {distances[p.name] && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                    ~{distances[p.name].label}
                  </p>
                )}
              </div>
              {p.phone && (
                <a
                  href={`tel:${p.phone!.replace(/\D/g, '')}`}
                  onClick={e => e.stopPropagation()}
                  className="flex-shrink-0 p-2 rounded-lg text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900 transition-colors"
                  aria-label={`Llamar a ${p.name}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.62 10.79a15.054 15.054 0 0 0 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                  </svg>
                </a>
              )}
            </button>
          ))
        )}
      </div>

      {/* Detail card */}
      {selectedPharmacy && (
        <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-900">
          <PharmacyDetailCard
            pharmacy={selectedPharmacy}
            locationStatus={locationStatus}
            distance={distances[selectedPharmacy.name]}
            onGetDirections={onGetDirections}
          />
        </div>
      )}
    </>
  );
}
