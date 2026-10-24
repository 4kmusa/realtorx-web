// Keeps a crash or a missing file from leaving a blank page. After a new deploy, a page that was already open still
// asks for the old JavaScript files, which no longer exist: the page then reloads once to pick up the new version.
import React from 'react';

const RELOAD_KEY = 'rx:reloaded-for-update';

function isStaleBuild(error: unknown): boolean {
  const message = String((error as Error)?.message || error || '');
  return /dynamically imported module|Importing a module script failed|error loading dynamically imported|ChunkLoadError|Unable to preload CSS/i.test(message);
}

/** Reloads the page once per minute at most, so a file that is really missing cannot cause a reload loop. */
export function reloadForUpdate(): boolean {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
    if (Date.now() - last < 60_000) return false;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    return false;
  }
  window.location.reload();
  return true;
}

/** Vite reports a failed lazy import as `vite:preloadError`; reloading loads the current build. */
export function watchForNewBuild() {
  window.addEventListener('vite:preloadError', (event) => {
    if (reloadForUpdate()) event.preventDefault();
  });
}

export default class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    if (isStaleBuild(error)) reloadForUpdate();
    else console.error(error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 text-center text-fg">
        <img src="/images/realtorx-logo-480.png" alt="RealtorX" className="h-10 w-auto" />
        <h1 className="mt-8 text-2xl font-medium tracking-[-0.02em]">Something went wrong on this page.</h1>
        <p className="mt-3 max-w-sm text-sm text-fg-2">Please reload. If it happens again, contact RealtorX at info@realtorx.co.</p>
        <button type="button" onClick={() => window.location.reload()} className="mt-8 h-11 rounded-full bg-fg px-6 text-sm font-medium text-ink hover:bg-white">
          Reload
        </button>
      </div>
    );
  }
}
