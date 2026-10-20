// Signed-in customer's own booking requests, with cancel for pending ones.
import React, { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { callPost } from '../../services/api/client';
import { StatusBadge } from '../../components/ui/Badge';
import { DataTable, DataView, Notice, SectionHeader, formatDate, formatPKR, useApi } from '../portal/kit';

interface Row {
  name: string;
  unit: string;
  unit_code: string | null;
  unit_title: string | null;
  project_name: string | null;
  status: string;
  expires_on: string | null;
  price_snapshot: number | null;
  decision_reason: string | null;
  creation: string;
}

export default function MyBookingRequests() {
  const [tick, setTick] = useState(0);
  const state = useApi<Row[]>('realtor_x.api.community.get_my_booking_requests', undefined, String(tick));
  const [error, setError] = useState<string | null>(null);
  const cancel = async (name: string) => {
    setError(null);
    try {
      await callPost('realtor_x.api.community.cancel_my_booking_request', { name });
      setTick((t) => t + 1);
    } catch (e: any) {
      setError(e?.message || 'Could not cancel.');
    }
  };
  return (
    <div className="space-y-4">
      <SectionHeader title="Booking requests" description="Requests you sent while signed in. A request is not a confirmed booking; RealtorX calls you about the next steps." />
      {error && <Notice tone="error">{error}</Notice>}
      <DataView state={state} isEmpty={(r) => r.length === 0} empty={{ icon: ClipboardList, title: 'No booking requests', description: 'Use "Request booking" on a project unit.' }}>
        {(rows) => (
          <DataTable
            rows={rows}
            rowKey={(r) => r.name}
            columns={[
              { header: 'Reference', cell: (r) => <span className="font-mono text-white">{r.name}</span> },
              { header: 'Unit', cell: (r) => [r.unit_code, r.unit_title].filter(Boolean).join(' · ') || r.unit },
              { header: 'Project', cell: (r) => r.project_name || '—' },
              { header: 'Price at request', cell: (r) => (r.price_snapshot ? formatPKR(r.price_snapshot) : 'On request') },
              { header: 'Status', cell: (r) => <span title={r.decision_reason || undefined}><StatusBadge status={r.status} /></span> },
              { header: 'Hold until', cell: (r) => (r.status === 'Pending Review' ? formatDate(r.expires_on) : '—') },
              { header: '', cell: (r) => (r.status === 'Pending Review' ? <button className="text-xs text-red-300 hover:underline" onClick={() => cancel(r.name)}>Cancel</button> : null) },
            ]}
          />
        )}
      </DataView>
    </div>
  );
}
