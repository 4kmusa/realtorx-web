import { useEffect, useState } from 'react';

/** Current dashboard section from the URL (/agent/<section>), kept in sync with the browser history. `go` can add a query
 * (e.g. `deal=DL-…`) that the section reads to open one record. */
export function useSection(base: string, fallback: string, known: string[]): [string, (s: string, query?: string) => void] {
  const read = () => {
    const part = window.location.pathname.replace(new RegExp(`^/${base}/?`), '').split('/')[0];
    return known.includes(part) ? part : fallback;
  };
  const [section, setSection] = useState(read);
  useEffect(() => {
    const onPop = () => setSection(read());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const go = (s: string, query?: string) => {
    const url = (s === fallback ? `/${base}/` : `/${base}/${s}`) + (query ? `?${query}` : '');
    if (url !== window.location.pathname + window.location.search) window.history.pushState(null, '', url);
    setSection(s);
    window.scrollTo({ top: 0 });
  };
  return [section, go];
}
