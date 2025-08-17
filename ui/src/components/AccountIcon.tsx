interface AccountIconProps {
  className?: string;
  onClick?: () => void;
}

export function AccountIcon({ className = "", onClick }: AccountIconProps) {
  return (
    <button
      onClick={onClick}
      className={`w-8 h-8 rounded-full bg-surface-800 hover:bg-surface-700 border border-surface-600 flex items-center justify-center transition-colors ${className}`}
      aria-label="Account menu"
    >
      <svg className="w-5 h-5 text-surface-100" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
    </button>
  );
}