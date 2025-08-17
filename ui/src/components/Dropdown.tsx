import { ComponentChildren } from "preact";
import { forwardRef } from "preact/compat";
import { useState, useEffect, useRef } from "preact/hooks";
import { Button, ButtonProps } from "./Button";

export interface DropdownItem {
  key: string;
  label: ComponentChildren;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export interface DropdownProps {
  /** The content to render inside the trigger button */
  children: ComponentChildren;
  /** Array of dropdown menu items - optional if using children for menu content */
  items?: DropdownItem[];
  /** Custom menu content - alternative to items prop */
  menuContent?: ComponentChildren;
  /** Button variant for the trigger */
  variant?: ButtonProps["variant"];
  /** Button size for the trigger */
  size?: ButtonProps["size"];
  /** Whether the dropdown is disabled */
  disabled?: boolean;
  /** Position preference for the dropdown menu */
  placement?:
    | "bottom-start"
    | "bottom-end"
    | "top-start"
    | "top-end"
    | "bottom"
    | "top";
  /** Additional className for the trigger button */
  className?: string;
  /** Additional className for the dropdown menu */
  menuClassName?: string;
  /** Maximum width of the dropdown menu */
  maxWidth?: string;
  /** Maximum height of the dropdown menu */
  maxHeight?: string;
  /** Whether to show a chevron icon */
  showChevron?: boolean;
  /** Callback when dropdown opens/closes */
  onOpenChange?: (isOpen: boolean) => void;
}

export const Dropdown = forwardRef<HTMLButtonElement, DropdownProps>(
  (
    {
      children,
      items,
      menuContent,
      variant = "secondary",
      size = "md",
      disabled = false,
      placement = "bottom-start",
      className = "",
      menuClassName = "",
      maxWidth = "max-w-xs",
      maxHeight = "max-h-64",
      showChevron = true,
      onOpenChange,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node) &&
          triggerRef.current &&
          !triggerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
          document.removeEventListener("keydown", handleKeyDown);
        };
      }
    }, [isOpen]);

    // Handle keyboard navigation
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    const toggleDropdown = () => {
      const newIsOpen = !isOpen;
      setIsOpen(newIsOpen);
      onOpenChange?.(newIsOpen);
    };

    const handleItemClick = (item: DropdownItem) => {
      if (!item.disabled) {
        item.onClick?.();
        setIsOpen(false);
        onOpenChange?.(false);
      }
    };

    // Calculate dropdown position classes
    const getPositionClasses = () => {
      switch (placement) {
        case "bottom-start":
          return "top-full left-0 mt-1";
        case "bottom-end":
          return "top-full right-0 mt-1";
        case "bottom":
          return "top-full left-1/2 transform -translate-x-1/2 mt-1";
        case "top-start":
          return "bottom-full left-0 mb-1";
        case "top-end":
          return "bottom-full right-0 mb-1";
        case "top":
          return "bottom-full left-1/2 transform -translate-x-1/2 mb-1";
        default:
          return "top-full left-0 mt-1";
      }
    };

    const ChevronIcon = () => (
      <svg
        class={`w-4 h-4 ml-2 transition-transform duration-200 ${
          isOpen ? "transform rotate-180" : ""
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    );

    return (
      <div class="relative inline-block text-left">
        <Button
          ref={(el: HTMLButtonElement | HTMLAnchorElement | null) => {
            // Store reference for our internal use (we know it's a button since no 'to' prop)
            triggerRef.current = el as HTMLButtonElement;

            // Forward the ref to parent if provided
            if (typeof ref === "function") {
              ref(el as HTMLButtonElement);
            } else if (ref && el) {
              (ref as { current: HTMLButtonElement | null }).current =
                el as HTMLButtonElement;
            }
          }}
          variant={variant}
          size={size}
          disabled={disabled}
          className={className}
          onClick={toggleDropdown}
          aria-expanded={isOpen}
          aria-haspopup="true"
          {...props}
        >
          {children}
          {showChevron && <ChevronIcon />}
        </Button>

        {isOpen && (
          <div
            ref={dropdownRef}
            class={`
              absolute z-50 ${getPositionClasses()} ${maxWidth} ${maxHeight}
              bg-white dark:bg-surface-800 
              border border-surface-300 dark:border-surface-600
              rounded-lg shadow-lg ring-1 ring-black ring-opacity-5
              overflow-auto
              ${menuClassName}
              [&_li]:w-full [&_li]:text-left [&_li]:px-4 [&_li]:py-2 [&_li]:text-sm
              [&_li]:transition-colors [&_li]:duration-150 [&_li]:cursor-pointer
              [&_li]:text-background-900 [&_li]:dark:text-surface-100
              [&_li:hover]:bg-surface-100 [&_li:hover]:dark:bg-surface-700
              [&_li:focus]:bg-surface-100 [&_li:focus]:dark:bg-surface-700
              [&_li:focus]:outline-none
              [&_li[aria-disabled="true"]]:text-surface-400 [&_li[aria-disabled="true"]]:cursor-not-allowed
              [&_li[aria-disabled="true"]:hover]:bg-transparent
            `}
            role="menu"
            aria-orientation="vertical"
          >
            {menuContent ? (
              <div class="py-1">{menuContent}</div>
            ) : (
              items && (
                <div class="py-1">
                  {items.map((item) => {
                    // If no onClick function, render as non-interactive text
                    if (!item.onClick) {
                      return (
                        <div
                          key={item.key}
                          class={`
                            w-full text-left px-4 py-2 text-sm
                            text-surface-500 dark:text-surface-400
                            ${item.className || ""}
                          `}
                          role="menuitem"
                          aria-disabled="true"
                        >
                          {item.label}
                        </div>
                      );
                    }

                    // Render as interactive button if onClick is provided
                    return (
                      <button
                        key={item.key}
                        class={`
                          w-full text-left px-4 py-2 text-sm
                          transition-colors duration-150
                          ${
                            item.disabled
                              ? "text-surface-400 cursor-not-allowed"
                              : "text-background-900 dark:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-700 focus:bg-surface-100 dark:focus:bg-surface-700 cursor-pointer"
                          }
                          focus:outline-none
                          ${item.className || ""}
                        `}
                        disabled={item.disabled}
                        onClick={() => handleItemClick(item)}
                        role="menuitem"
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              )
            )}
          </div>
        )}
      </div>
    );
  }
);
