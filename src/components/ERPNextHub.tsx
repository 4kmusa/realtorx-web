import React, { useState } from 'react';
import { MemberRecord, ERPNextConfig, SyncLog, Language } from '../types';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Download,
  Upload,
  Server,
  Key,
  Link2,
  Wifi,
  WifiOff,
  User,
  Mail,
  MapPin,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

interface ERPNextHubProps {
  config: ERPNextConfig;
  onUpdateConfig: (config: ERPNextConfig) => void;
  members: MemberRecord[];
  onMembersUpdated: (members: MemberRecord[]) => void;
  language: Language;
}

export const ERPNextHub: React.FC<ERPNextHubProps> = ({
  config,
  onUpdateConfig,
  members,
  onMembersUpdated,
  language,
}) => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [syncingAll, setSyncingAll] = useState(false);

  // ─────────────────────────────────────────────
  // Test ERPNext Connection
  // ─────────────────────────────────────────────
  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const cleanUrl = config.baseUrl.replace(/\/+$/, '');
      const response = await fetch(
        `${cleanUrl}/api/method/frappe.auth.get_logged_user`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `token ${config.apiKey}:${config.apiSecret}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTestResult({
          ok: true,
          message: `✅ Connected as ${data.message || 'Administrator'}`,
        });
      } else {
        setTestResult({
          ok: false,
          message: `❌ HTTP ${response.status}: ${response.statusText}`,
        });
      }
    } catch (err: any) {
      setTestResult({
        ok: false,
        message: `❌ Connection failed: ${err.message}`,
      });
    } finally {
      setTesting(false);
    }
  };

  // ─────────────────────────────────────────────
  // Sync Single Member to ERPNext
  // ─────────────────────────────────────────────
  const syncMember = async (member: MemberRecord) => {
    try {
      const cleanUrl = config.baseUrl.replace(/\/+$/, '');
      const payload = {
        member_id: member.memberNumber,
        full_name: member.fullName,
        firm_name: member.firmName,
        role: member.role,
        city: member.city,
        email: member.email,
        phone: member.phone || '',
        license_no: member.licenseNo || '',
        membership_tier: member.tier,
        oath_accepted: member.oathAccepted ? 1 : 0,
        code_agreed: member.codeAgreed ? 1 : 0,
        oath_date: member.joinedAt,
        custodian_hash: member.signatureHash || 'RX-VERIFIED',
        bio: member.bio || '',
      };

      const response = await fetch(`${cleanUrl}/api/resource/RealtorX Member`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `token ${config.apiKey}:${config.apiSecret}`,
        },
        body: JSON.stringify(payload),
      });

      const log: SyncLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        memberId: member.id,
        memberName: member.fullName,
        action: 'create',
        status: response.ok ? 'success' : 'failed',
        message: response.ok
          ? `Synced to ERPNext as ${member.memberNumber}`
          : `Failed (HTTP ${response.status})`,
        payload,
      };

      setSyncLogs((prev) => [log, ...prev]);
      return response.ok;
    } catch (err: any) {
      const log: SyncLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        memberId: member.id,
        memberName: member.fullName,
        action: 'error',
        status: 'failed',
        message: err.message || 'Unknown error',
      };
      setSyncLogs((prev) => [log, ...prev]);
      return false;
    }
  };

  // ─────────────────────────────────────────────
  // Sync All Members
  // ─────────────────────────────────────────────
  const syncAllMembers = async () => {
    setSyncingAll(true);
    let successCount = 0;

    for (const member of members) {
      const ok = await syncMember(member);
      if (ok) successCount++;
    }

    setSyncingAll(false);

    if (successCount > 0) {
      alert(`✅ ${successCount} of ${members.length} members synced successfully`);
    } else {
      alert(`⚠️ 0 of ${members.length} members synced. Check connection.`);
    }
  };

  // ─────────────────────────────────────────────
  // Export CSV
  // ─────────────────────────────────────────────
  const downloadCSV = () => {
    const headers = [
      'member_id',
      'full_name',
      'firm_name',
      'role',
      'city',
      'email',
      'phone',
      'license_no',
      'membership_tier',
      'oath_accepted',
      'code_agreed',
      'oath_date',
    ];

    const rows = members.map((m) => [
      m.memberNumber,
      m.fullName,
      m.firmName,
      m.role,
      m.city,
      m.email,
      m.phone || '',
      m.licenseNo || '',
      m.tier,
      m.oathAccepted ? '1' : '0',
      m.codeAgreed ? '1' : '0',
      m.joinedAt,
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.map((v) => `"${v}"`).join(','))].join(
      '\n'
    );

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `realtorx-members-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* HERO */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#2490EF] bg-[#2490EF]/10 border border-[#2490EF]/30 px-3.5 py-1.5 rounded-full mb-5">
          <Database className="w-3.5 h-3.5" />
          <span>ERPNext REST API Integration Hub</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-white font-heading mb-4">
          Realtor X · ERPNext Bridge
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Monitor your RealtorX community sync, export data, and verify the connection to your
          ERPNext production instance.
        </p>
      </div>

      {/* CONNECTION STATUS */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/70 border border-slate-800">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                testResult?.ok
                  ? 'bg-[#28A745]/15 border border-[#28A745]/40'
                  : 'bg-slate-800 border border-slate-700'
              }`}
            >
              {testResult?.ok ? (
                <Wifi className="w-6 h-6 text-[#28A745]" />
              ) : (
                <WifiOff className="w-6 h-6 text-slate-400" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-heading">
                Connection Status
              </h2>
              <p className="text-xs text-slate-400">
                {testResult?.ok ? 'Connected to ERPNext' : 'Not tested yet'}
              </p>
            </div>
          </div>

          <button
            onClick={testConnection}
            disabled={testing}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#2490EF] hover:bg-[#1b7ecf] rounded-lg transition-colors disabled:opacity-60"
          >
            {testing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Test Connection
              </>
            )}
          </button>
        </div>

        {testResult && (
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              testResult.ok
                ? 'bg-[#28A745]/10 border-[#28A745]/30 text-[#28A745]'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}
          >
            {testResult.ok ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            )}
            <span className="text-sm">{testResult.message}</span>
          </div>
        )}

        {/* Config Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="flex items-start gap-3">
            <Server className="w-4 h-4 text-[#2490EF] shrink-0 mt-1" />
            <div className="min-w-0">
              <div className="text-xs text-slate-400 mb-0.5">Base URL</div>
              <div className="text-sm text-white font-mono truncate">{config.baseUrl}</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Key className="w-4 h-4 text-[#F5A623] shrink-0 mt-1" />
            <div className="min-w-0">
              <div className="text-xs text-slate-400 mb-0.5">API Key</div>
              <div className="text-sm text-white font-mono truncate">
                {config.apiKey.slice(0, 8)}...
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Link2 className="w-4 h-4 text-[#28A745] shrink-0 mt-1" />
            <div className="min-w-0">
              <div className="text-xs text-slate-400 mb-0.5">DocType</div>
              <div className="text-sm text-white font-mono truncate">{config.doctype}</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <RefreshCw className="w-4 h-4 text-purple-400 shrink-0 mt-1" />
            <div className="min-w-0">
              <div className="text-xs text-slate-400 mb-0.5">Auto Sync</div>
              <div className="text-sm text-white font-mono">
                {config.autoSync ? 'Enabled' : 'Disabled'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={downloadCSV}
          disabled={members.length === 0}
          className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-[#2490EF]/50 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#2490EF]/15 border border-[#2490EF]/30 flex items-center justify-center">
              <Download className="w-5 h-5 text-[#2490EF]" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-white">
                Download CSV Export
              </h3>
              <p className="text-xs text-slate-400">
                {members.length} members ready to export
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Standard ERPNext-format CSV for bulk import into any ERPNext instance.
          </p>
        </button>

        <button
          onClick={syncAllMembers}
          disabled={members.length === 0 || syncingAll}
          className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-[#28A745]/50 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#28A745]/15 border border-[#28A745]/30 flex items-center justify-center">
              {syncingAll ? (
                <Loader2 className="w-5 h-5 text-[#28A745] animate-spin" />
              ) : (
                <Upload className="w-5 h-5 text-[#28A745]" />
              )}
            </div>
            <div>
              <h3 className="font-heading font-bold text-white">
                {syncingAll ? 'Syncing...' : 'Sync All to ERPNext'}
              </h3>
              <p className="text-xs text-slate-400">
                Push {members.length} members via REST API
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Creates or updates each member in the connected ERPNext production instance.
          </p>
        </button>
      </div>

      {/* MEMBERS LIST */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/70 border border-slate-800">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-white font-heading">
              RealtorX Members
            </h2>
            <p className="text-xs text-slate-400">
              {members.length} verified custodian{members.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {members.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800/80 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">
              No members yet
            </h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Members will appear here once they take the RealtorX Oath.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-full bg-[#2490EF]/15 border border-[#2490EF]/30 flex items-center justify-center text-[#2490EF] font-bold shrink-0">
                      {member.fullName?.charAt(0) || '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-white">
                          {member.fullName}
                        </h4>
                        <span className="text-[10px] font-mono bg-[#F5A623]/15 text-[#F5A623] px-1.5 py-0.5 rounded border border-[#F5A623]/30">
                          {member.memberNumber}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {member.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {member.city}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {member.tier}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {member.oathAccepted && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-[#28A745] bg-[#28A745]/10 px-2 py-1 rounded">
                        <CheckCircle2 className="w-3 h-3" />
                        OATH
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-mono px-2 py-1 rounded ${
                        member.erpnextStatus === 'success' || member.erpnextDocId
                          ? 'text-[#28A745] bg-[#28A745]/10'
                          : 'text-slate-400 bg-slate-800'
                      }`}
                    >
                      {member.erpnextDocId || member.erpnextStatus || 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SYNC LOGS */}
      {syncLogs.length > 0 && (
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/70 border border-slate-800">
          <h2 className="text-xl font-bold text-white font-heading mb-4">
            Recent Sync Activity
          </h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {syncLogs.map((log) => (
              <div
                key={log.id}
                className={`p-3 rounded-lg border text-xs flex items-start gap-3 ${
                  log.status === 'success'
                    ? 'bg-[#28A745]/5 border-[#28A745]/30'
                    : 'bg-red-500/5 border-red-500/30'
                }`}
              >
                {log.status === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-[#28A745] shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-slate-400 text-[10px] mb-1">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </div>
                  <div className="text-slate-200">
                    <span className="font-semibold">{log.memberName}</span> ·{' '}
                    {log.message}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
