// The unfinished agent application kept in this browser (id + key), shared by the application form and the
// "My application" page (which hands over a key after sign-in so the form can continue on this device).
export const APPLICATION_STORE = 'realtorx_agent_application';
export const PROFILE_STORE = 'realtorx_my_application';

export type Saved = { application: string; key: string };

export function loadJSON<T>(name: string): T | null {
  try {
    return JSON.parse(localStorage.getItem(name) || 'null');
  } catch {
    return null;
  }
}

export function saveJSON(name: string, value: unknown) {
  try {
    if (value) localStorage.setItem(name, JSON.stringify(value));
    else localStorage.removeItem(name);
  } catch {
    /* private mode: the applicant signs in again on "My application" */
  }
}
