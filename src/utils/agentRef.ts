// RealtorX Agent share links (…?ref=RXA-00001): the Agent ID is kept for this visit so a buyer's enquiry,
// visit or booking request is recorded for the agent who shared the link. The server ignores unknown or
// inactive Agent IDs.
const KEY = 'realtorx_agent_ref';
const PATTERN = /^RXA-[A-Z0-9]{3,12}$/;

export function captureAgentRef(): void {
  try {
    const ref = new URLSearchParams(window.location.search).get('ref')?.trim().toUpperCase();
    if (ref && PATTERN.test(ref)) sessionStorage.setItem(KEY, ref);
  } catch {
    /* storage unavailable: attribution is best-effort */
  }
}

export function agentRef(): string | undefined {
  try {
    return sessionStorage.getItem(KEY) || undefined;
  } catch {
    return undefined;
  }
}
