// Member Service - ERPNext integration for RealtorX Members

import {
  MemberProfile,
  MemberReferral,
  MemberPayout,
  MemberProperty,
} from '../types';

const ERPNEXT_URL = import.meta.env.VITE_ERPNEXT_URL || 'http://172.23.173.190:8000';
const API_KEY = import.meta.env.VITE_ERPNEXT_API_KEY || '';
const API_SECRET = import.meta.env.VITE_ERPNEXT_API_SECRET || '';

const AUTH_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  Authorization: `token ${API_KEY}:${API_SECRET}`,
};

// ═══════════════════════════════════════════════════════
// Fetch Member Profile by Email
// ═══════════════════════════════════════════════════════
export async function fetchMemberProfile(email: string): Promise<MemberProfile | null> {
  try {
    const url = `${ERPNEXT_URL}/api/resource/RealtorX Member?filters=[["email","=","${email}"]]&limit_page_length=1`;
    const response = await fetch(url, { headers: AUTH_HEADERS });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data.data || data.data.length === 0) return null;

    return data.data[0] as MemberProfile;
  } catch (error) {
    console.error('Error fetching member profile:', error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════
// Fetch Member by Member ID
// ═══════════════════════════════════════════════════════
export async function fetchMemberById(memberId: string): Promise<MemberProfile | null> {
  try {
    const url = `${ERPNEXT_URL}/api/resource/RealtorX Member/${memberId}`;
    const response = await fetch(url, { headers: AUTH_HEADERS });

    if (!response.ok) return null;

    const data = await response.json();
    return data.data as MemberProfile;
  } catch (error) {
    console.error('Error fetching member:', error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════
// Fetch Member Referrals
// ═══════════════════════════════════════════════════════
export async function fetchMemberReferrals(memberId: string): Promise<MemberReferral[]> {
  try {
    const url = `${ERPNEXT_URL}/api/resource/Referral Ledger?filters=[["member","=","${memberId}"]]&fields=["*"]&order_by=creation+desc&limit_page_length=100`;
    const response = await fetch(url, { headers: AUTH_HEADERS });

    if (!response.ok) return [];

    const data = await response.json();
    return (data.data || []) as MemberReferral[];
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return [];
  }
}

// ═══════════════════════════════════════════════════════
// Fetch Member Payouts
// ═══════════════════════════════════════════════════════
export async function fetchMemberPayouts(memberId: string): Promise<MemberPayout[]> {
  try {
    const url = `${ERPNEXT_URL}/api/resource/Member Payout?filters=[["member","=","${memberId}"]]&fields=["*"]&order_by=creation+desc&limit_page_length=100`;
    const response = await fetch(url, { headers: AUTH_HEADERS });

    if (!response.ok) return [];

    const data = await response.json();
    return (data.data || []) as MemberPayout[];
  } catch (error) {
    console.error('Error fetching payouts:', error);
    return [];
  }
}

// ═══════════════════════════════════════════════════════
// Fetch Member's Listed Properties
// ═══════════════════════════════════════════════════════
export async function fetchMemberProperties(memberId: string): Promise<MemberProperty[]> {
  try {
    const url = `${ERPNEXT_URL}/api/resource/Property?filters=[["listed_by_member","=","${memberId}"]]&fields=["name","property_title","custom_property_category","status","list_price","size","size_unit","listed_by_member"]&order_by=creation+desc&limit_page_length=10`;
    const response = await fetch(url, { headers: AUTH_HEADERS });

    if (!response.ok) return [];

    const data = await response.json();
    return (data.data || []) as MemberProperty[];
  } catch (error) {
    console.error('Error fetching member properties:', error);
    return [];
  }
}

// ═══════════════════════════════════════════════════════
// Create New Property Listing (Member)
// ═══════════════════════════════════════════════════════
export async function createMemberProperty(data: {
  property_title: string;
  custom_property_category: string;
  size: number;
  size_unit: string;
  list_price: number;
  project?: string;
  listed_by_member: string;
  listing_type: string;
}): Promise<{ success: boolean; name?: string; error?: string }> {
  try {
    const response = await fetch(`${ERPNEXT_URL}/api/resource/Property`, {
      method: 'POST',
      headers: AUTH_HEADERS,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return { success: false, error: err.exception || 'Failed to create property' };
    }

    const result = await response.json();
    return { success: true, name: result.data?.name };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════
// Helper: Format Currency (PKR)
// ═══════════════════════════════════════════════════════
export function formatPKR(amount: number | undefined | null): string {
  if (!amount && amount !== 0) return 'PKR 0';
  if (amount >= 10000000) return `PKR ${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `PKR ${(amount / 100000).toFixed(2)} Lakh`;
  return `PKR ${amount.toLocaleString()}`;
}
