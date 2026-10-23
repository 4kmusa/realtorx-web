// Website buyer session: who is signed in (RealtorX Buyer role), their contact details and requests. Sign-in uses the
// dashboards' portal login with app "buyer"; the CSRF token from the session is used for every write.
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { callGet, callPost, setCsrfToken } from '../../services/api/client';

export interface BuyerRequest { reference: string; status: string; date: string; unit?: string | null; title: string; project?: string | null;
  visit_date?: string | null; visit_slot?: string | null; expires_on?: string | null }
export interface Buyer {
  user: string;
  full_name: string;
  email: string;
  phone?: string | null;
  enquiries: BuyerRequest[];
  visits: BuyerRequest[];
  bookings: BuyerRequest[];
}
interface SessionInfo { user: string | null; allowed: boolean; full_name?: string; csrf_token?: string | null }

interface BuyerContext {
  buyer: Buyer | null;
  /** Signed in with another kind of account (agent, developer, staff). */
  otherAccount: string | null;
  loading: boolean;
  refresh: () => Promise<Buyer | null>;
  started: (session: SessionInfo) => Promise<Buyer | null>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<BuyerContext>({ buyer: null, otherAccount: null, loading: true, refresh: async () => null, started: async () => null, signOut: async () => undefined });

export function BuyerProvider({ children }: { children: React.ReactNode }) {
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [otherAccount, setOther] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (session: SessionInfo | null): Promise<Buyer | null> => {
    setCsrfToken(session?.csrf_token);
    if (!session?.user || !session.allowed) {
      setBuyer(null);
      setOther(session?.user && !session.allowed ? session.user : null);
      return null;
    }
    const me = await callGet<Omit<Buyer, 'user'>>('realtor_x.api.buyers.me');
    const b = { user: session.user, ...me };
    setBuyer(b);
    setOther(null);
    return b;
  }, []);

  const refresh = useCallback(async () => {
    try {
      return await load(await callGet<SessionInfo>('realtor_x.api.portal.session', { app: 'buyer' }));
    } catch {
      setBuyer(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [load]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signOut = useCallback(async () => {
    await callPost('realtor_x.api.portal.logout').catch(() => undefined);
    setCsrfToken(null);
    setBuyer(null);
    setOther(null);
  }, []);

  return <Ctx.Provider value={{ buyer, otherAccount, loading, refresh, started: load, signOut }}>{children}</Ctx.Provider>;
}

export const useBuyer = () => useContext(Ctx);
