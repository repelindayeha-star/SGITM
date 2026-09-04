import { AlertTriangle } from 'lucide-react';

export default function ErrorBanner({ children }) {
  if (!children) return null;
  return (
    <div className="flex items-center gap-2 rounded-md border border-red-800/60 bg-red-950/40 px-4 py-3 text-red-300 text-sm mb-5">
      <AlertTriangle className="w-4 h-4 shrink-0" />
      {children}
    </div>
  );
}
