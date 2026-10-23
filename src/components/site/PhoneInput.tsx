// Mobile number with its country: a country picker (flag and dialling code) next to the national number, giving the
// number in international form (+923001234567). The country starts as the visitor's: from the server (the proxy's
// country header), else the device's time zone, else the browser language, else Pakistan. Typing or pasting a number
// that starts with "+" or "00" picks its country. The server checks the number again.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { callGet } from '../../services/api/client';
import { COUNTRIES, Country, TZ_COUNTRY } from '../../utils/countries';

const BY_ISO = new Map(COUNTRIES.map((c) => [c[0], c]));
const POPULAR = ['PK', 'AE', 'SA', 'GB', 'US', 'QA', 'OM', 'KW', 'BH', 'CA', 'AU'];
const FALLBACK = 'PK';
// Where several countries share a dialling code, the one assumed when a pasted number does not say.
const SHARED_CODE: Record<number, string> = { 1: 'US', 7: 'RU', 44: 'GB', 61: 'AU', 47: 'NO', 212: 'MA', 262: 'RE', 590: 'GP', 599: 'CW' };

let detected: Promise<string> | null = null;

/** The visitor's country (ISO code), asked once per page load. */
export function detectCountry(): Promise<string> {
  if (!detected) {
    detected = callGet<string | null>('realtor_x.api.v1.visitor_country')
      .catch(() => null)
      .then((fromServer) => (fromServer && BY_ISO.has(fromServer) ? fromServer : guessCountry()));
  }
  return detected;
}

function guessCountry(): string {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (zone && TZ_COUNTRY[zone]) return TZ_COUNTRY[zone];
  } catch {
    /* no Intl time zone */
  }
  for (const lang of navigator.languages || []) {
    const region = lang.split('-')[1]?.toUpperCase();
    if (region && BY_ISO.has(region)) return region;
  }
  return FALLBACK;
}

const flag = (iso: string) => String.fromCodePoint(...[...iso].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));

/** "+923001234567" or "0092 300…" -> the country and the national digits; null when it is not international. */
export function splitPhone(value: string): { iso: string; national: string } | null {
  const digits = value.trim().replace(/^00/, '+');
  if (!digits.startsWith('+')) return null;
  const all = digits.replace(/\D/g, '');
  for (let len = 4; len >= 1; len -= 1) {
    const code = Number(all.slice(0, len));
    const matches = COUNTRIES.filter((c) => c[2] === code);
    if (matches.length) {
      const iso = SHARED_CODE[code] && matches.some((c) => c[0] === SHARED_CODE[code]) ? SHARED_CODE[code] : matches[0][0];
      return { iso, national: all.slice(len) };
    }
  }
  return null;
}

/** International form: the dialling code and the national number without the country's trunk prefix (the "0" in
 * 0300 1234567); countries without a trunk prefix keep every digit. */
export function joinPhone(iso: string, national: string): string {
  const country = BY_ISO.get(iso);
  let digits = national.replace(/\D/g, '');
  if (country?.[4] && digits.startsWith(country[4])) digits = digits.slice(country[4].length);
  return digits ? `+${country?.[2] ?? ''}${digits}` : '';
}

interface Props {
  id: string;
  value: string;
  onChange: (international: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function PhoneInput({ id, value, onChange, required, disabled, className }: Props) {
  const start = splitPhone(value || '');
  const [iso, setIso] = useState(start?.iso || FALLBACK);
  const [national, setNational] = useState(start?.national ?? (value || ''));
  const chosen = useRef(!!start); // the visitor (or the saved number) has set the country: detection must not change it
  const emitted = useRef(value);
  const typed = useRef(national);
  typed.current = national;

  useEffect(() => {
    if (chosen.current) return;
    let live = true;
    detectCountry().then((c) => {
      if (!live || chosen.current) return;
      setIso(c);
      if (typed.current) emit(c, typed.current); // typed before the country was known
    });
    return () => {
      live = false;
    };
  }, []);

  // A new value from outside (e.g. a saved profile loaded later).
  useEffect(() => {
    if (value === emitted.current) return;
    const parsed = splitPhone(value || '');
    if (parsed) {
      chosen.current = true;
      setIso(parsed.iso);
      setNational(parsed.national);
    } else if (!value) {
      setNational('');
    }
    emitted.current = value;
  }, [value]);

  const emit = (nextIso: string, nextNational: string) => {
    const out = joinPhone(nextIso, nextNational);
    emitted.current = out;
    onChange(out);
  };

  const country: Country = BY_ISO.get(iso) || BY_ISO.get(FALLBACK)!;
  const options = useMemo(() => [...POPULAR.map((p) => BY_ISO.get(p)!).filter(Boolean)], []);

  return (
    <div className={`flex h-12 w-full overflow-hidden rounded-xl border border-line bg-panel transition-colors focus-within:border-blue-2/70 focus-within:bg-panel-2 ${disabled ? 'opacity-60' : ''} ${className || ''}`}>
      <label className="relative flex shrink-0 items-center gap-1.5 border-r border-line pl-3 pr-2 text-[15px] text-fg">
        <span aria-hidden="true">{flag(country[0])}</span>
        <span className="tabular-nums">+{country[2]}</span>
        <ChevronDown className="h-3.5 w-3.5 text-fg-3" aria-hidden="true" />
        <select
          aria-label="Country code"
          className="absolute inset-0 cursor-pointer opacity-0"
          value={iso}
          disabled={disabled}
          onChange={(e) => {
            chosen.current = true;
            setIso(e.target.value);
            emit(e.target.value, national);
          }}
        >
          <optgroup label="Common">
            {options.map((c) => <option key={`p-${c[0]}`} value={c[0]}>{`${c[1]} (+${c[2]})`}</option>)}
          </optgroup>
          <optgroup label="All countries">
            {COUNTRIES.map((c) => <option key={c[0]} value={c[0]}>{`${c[1]} (+${c[2]})`}</option>)}
          </optgroup>
        </select>
      </label>
      <input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        required={required}
        disabled={disabled}
        placeholder={country[3] || 'Mobile number'}
        className="min-w-0 flex-1 bg-transparent px-3 text-[15px] text-fg outline-none placeholder:text-fg-3"
        value={national}
        onChange={(e) => {
          const text = e.target.value;
          const parsed = /^\s*(\+|00)/.test(text) ? splitPhone(text) : null; // a full international number pasted in
          if (parsed) {
            chosen.current = true;
            setIso(parsed.iso);
            setNational(parsed.national);
            emit(parsed.iso, parsed.national);
            return;
          }
          setNational(text);
          emit(iso, text);
        }}
      />
    </div>
  );
}
