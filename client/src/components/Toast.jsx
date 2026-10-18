'use client';

import { CircleAlert, CircleCheck } from 'lucide-react';

export default function Toast({ toast }) {
  if (!toast) return null;
  const error = toast.type === 'error';
  const Icon = error ? CircleAlert : CircleCheck;
  return (
    <div
      role="status"
      className={`fixed right-5 bottom-5 z-50 flex max-w-sm items-start gap-2.5 rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-lg ${
        error ? 'bg-rose-700' : 'bg-emerald-600'
      }`}
    >
      <Icon size={16} className="mt-0.5 shrink-0" />
      <span>{toast.msg}</span>
    </div>
  );
}
