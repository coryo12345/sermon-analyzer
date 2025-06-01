import type { SnackbarType } from "./Snackbar";

export interface AlertProps {
  type: SnackbarType;
  title: string;
  message?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function Alert({
  type,
  title,
  message,
  dismissible = false,
  onDismiss,
  action,
  className = "",
}: AlertProps) {
  const getTypeStyles = (type: SnackbarType) => {
    switch (type) {
      case "success":
        return "bg-success-500 text-white border-success-600";
      case "error":
        return "bg-error-500 text-white border-error-600";
      case "warning":
        return "bg-warning-500 text-white border-warning-600";
      case "info":
        return "bg-primary-500 text-white border-primary-600";
      default:
        return "bg-surface-500 text-white border-surface-600";
    }
  };

  const getIcon = (type: SnackbarType) => {
    switch (type) {
      case "success":
        return (
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case "error":
        return (
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        );
      case "warning":
        return (
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case "info":
        return (
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div
      class={`
        ${getTypeStyles(type)}
        border rounded-lg shadow-lg p-4 w-full
        ${className}
      `}
    >
      <div class="flex items-start">
        <div class="flex-shrink-0">
          {getIcon(type)}
        </div>
        <div class="ml-3 w-0 flex-1">
          <p class="text-sm font-medium">
            {title}
          </p>
          {message && (
            <p class="mt-1 text-sm opacity-90">
              {message}
            </p>
          )}
          {action && (
            <div class="mt-2">
              <button
                type="button"
                onClick={action.onClick}
                class="text-sm font-medium underline hover:no-underline focus:outline-none focus:underline"
              >
                {action.label}
              </button>
            </div>
          )}
        </div>
        {dismissible && onDismiss && (
          <div class="ml-4 flex-shrink-0 flex">
            <button
              type="button"
              onClick={onDismiss}
              class="inline-flex text-white hover:opacity-75 focus:outline-none focus:opacity-75"
            >
              <span class="sr-only">Dismiss</span>
              <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}