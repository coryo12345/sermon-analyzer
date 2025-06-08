import { useState, useEffect } from "preact/hooks";
import { Button, ButtonProps } from "./Button";

interface AreYouSureProps {
  children: string;
  onConfirm: () => void;
  title?: string;
  description?: string;
  cancelText?: string;
  confirmText?: string;
  buttonProps?: Partial<ButtonProps>;
}

export function AreYouSure({
  children,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  cancelText = "Cancel",
  confirmText = "Confirm",
  buttonProps = {},
}: AreYouSureProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleConfirm = () => {
    onConfirm();
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Button
        {...buttonProps}
        onClick={() => setIsOpen(true)}
      >
        {children}
      </Button>

      {isOpen && (
        <div class="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            class="fixed inset-0 bg-black/50 transition-opacity"
            onClick={handleCancel}
          />
          
          {/* Dialog */}
          <div class="relative bg-surface-800 border border-surface-700 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div class="mb-4">
              <h3 class="text-lg font-semibold text-surface-50 mb-2">
                {title}
              </h3>
              <p class="text-surface-300">
                {description}
              </p>
            </div>

            <div class="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={handleCancel}
              >
                {cancelText}
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirm}
              >
                {confirmText}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}