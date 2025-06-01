import { createContext } from "preact";
import { useContext, useState, useEffect } from "preact/hooks";

export type SnackbarType = "success" | "error" | "warning" | "info";

export interface SnackbarMessage {
  id: string;
  type: SnackbarType;
  title: string;
  message?: string;
  duration?: number; // in milliseconds, default 5000
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface SnackbarContextType {
  addMessage: (message: Omit<SnackbarMessage, "id">) => void;
}

const SnackbarContext = createContext<SnackbarContextType | null>(null);

export function useSnackbar() {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }
  return context;
}

interface SnackbarProviderProps {
  children: preact.ComponentChildren;
}

export function SnackbarProvider({ children }: SnackbarProviderProps) {
  const [messages, setMessages] = useState<SnackbarMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState<SnackbarMessage | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [progressWidth, setProgressWidth] = useState(100);

  const addMessage = (message: Omit<SnackbarMessage, "id">) => {
    const newMessage: SnackbarMessage = {
      ...message,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
      duration: message.duration ?? 5000,
    };
    setMessages(prev => [...prev, newMessage]);
  };

  useEffect(() => {
    if (!currentMessage && messages.length > 0) {
      const nextMessage = messages[0];
      setCurrentMessage(nextMessage);
      setMessages(prev => prev.slice(1));
      setIsVisible(true);
      setProgressWidth(100);
    }
  }, [currentMessage, messages]);

  useEffect(() => {
    if (currentMessage && isVisible) {
      // Start progress bar animation immediately
      setTimeout(() => {
        setProgressWidth(0);
      }, 100); // Small delay to ensure initial state is rendered

      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          setCurrentMessage(null);
        }, 300); // Wait for fade out animation
      }, currentMessage.duration);

      return () => clearTimeout(timer);
    }
  }, [currentMessage, isVisible]);

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

  const closeSnackbar = () => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrentMessage(null);
    }, 300);
  };

  const getProgressBarColor = (type: SnackbarType) => {
    switch (type) {
      case "success":
        return "bg-success-300";
      case "error":
        return "bg-error-300";
      case "warning":
        return "bg-warning-300";
      case "info":
        return "bg-primary-300";
      default:
        return "bg-surface-300";
    }
  };

  return (
    <SnackbarContext.Provider value={{ addMessage }}>
      {children}
      {currentMessage && (
        <div class="fixed bottom-4 right-4 z-50">
          <div
            class={`
              ${getTypeStyles(currentMessage.type)}
              border rounded-lg shadow-lg min-w-80 max-w-md
              transform transition-all duration-300 ease-in-out
              ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}
              relative overflow-hidden
            `}
          >
            <div class="p-4">
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  {getIcon(currentMessage.type)}
                </div>
                <div class="ml-3 w-0 flex-1">
                  <p class="text-sm font-medium">
                    {currentMessage.title}
                  </p>
                  {currentMessage.message && (
                    <p class="mt-1 text-sm opacity-90">
                      {currentMessage.message}
                    </p>
                  )}
                  {currentMessage.action && (
                    <div class="mt-2">
                      <button
                        type="button"
                        onClick={currentMessage.action.onClick}
                        class="text-sm font-medium underline hover:no-underline focus:outline-none focus:underline"
                      >
                        {currentMessage.action.label}
                      </button>
                    </div>
                  )}
                </div>
                <div class="ml-4 flex-shrink-0 flex">
                  <button
                    type="button"
                    onClick={closeSnackbar}
                    class="inline-flex text-white hover:opacity-75 focus:outline-none focus:opacity-75"
                  >
                    <span class="sr-only">Close</span>
                    <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Progress bar */}
            <div class="absolute bottom-0 left-0 h-1 bg-transparent bg-opacity-20 w-full">
              <div 
                class={`h-full ${getProgressBarColor(currentMessage.type)} transition-all ease-linear`}
                style={{
                  width: `${progressWidth}%`,
                  transitionDuration: currentMessage && isVisible ? `${(currentMessage.duration ?? 100) - 100}ms` : '0ms'
                }}
              />
            </div>
          </div>
        </div>
      )}
    </SnackbarContext.Provider>
  );
}