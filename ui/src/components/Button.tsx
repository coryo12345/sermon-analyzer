import { ComponentChildren, Ref } from "preact";
import { forwardRef } from "preact/compat";
import { JSX } from "preact";

export interface ButtonProps
  extends Omit<
    JSX.HTMLAttributes<HTMLButtonElement | HTMLAnchorElement>,
    "type" | "disabled"
  > {
  children: ComponentChildren;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  to?: string;
}

export const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(
  (
    {
      children,
      type = "button",
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      className = "",
      onClick,
      to,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const getVariantStyles = () => {
      switch (variant) {
        case "primary":
          return isDisabled
            ? "bg-primary-400 cursor-not-allowed text-white"
            : "bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 text-white cursor-pointer";
        case "secondary":
          return isDisabled
            ? "bg-surface-300 cursor-not-allowed text-surface-500 border border-surface-400"
            : "bg-white hover:bg-surface-50 focus:ring-primary-500 text-background-900 border border-surface-300 cursor-pointer";
        case "danger":
          return isDisabled
            ? "bg-error-400 cursor-not-allowed text-white"
            : "bg-error-600 hover:bg-error-700 focus:ring-error-500 text-white cursor-pointer";
        case "ghost":
          return isDisabled
            ? "cursor-not-allowed text-surface-400"
            : "text-surface-100 hover:bg-surface-100 hover:text-background-900 focus:ring-primary-500 cursor-pointer";
        default:
          return "";
      }
    };

    const getSizeStyles = () => {
      switch (size) {
        case "sm":
          return "px-3 py-2 text-sm";
        case "md":
          return "px-4 py-3 text-sm";
        case "lg":
          return "px-6 py-4 text-base";
        default:
          return "px-4 py-3 text-sm";
      }
    };

    const Spinner = () => (
      <svg
        class="animate-spin -ml-1 mr-2 h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    const baseClasses = `
      relative flex justify-center items-center font-medium rounded-lg
      focus:outline-none focus:ring-2 focus:ring-offset-2
      dark:focus:ring-offset-surface-900
      transition-all duration-200
      ${getVariantStyles()}
      ${getSizeStyles()}
      ${className}
    `;

    const content = (
      <>
        {loading && <Spinner />}
        <span
          class={`flex items-center justify-center ${loading ? "opacity-75" : ""}`}
        >
          {children}
        </span>
      </>
    );

    if (to) {
      return (
        <a
          ref={ref as Ref<HTMLAnchorElement>}
          href={to}
          aria-disabled={isDisabled}
          class={baseClasses}
          {...(props as JSX.HTMLAttributes<HTMLAnchorElement>)}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref as Ref<HTMLButtonElement>}
        type={type}
        disabled={isDisabled}
        onClick={isDisabled ? undefined : onClick}
        class={baseClasses}
        {...(props as JSX.HTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    );
  }
);
