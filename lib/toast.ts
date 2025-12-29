import { toast as sonnerToast } from "sonner";

/**
 * Toast notification utilities using Sonner
 * Matches ClearLedger design system colors:
 * - Default/Success: success colors
 * - Error/Danger: danger colors
 * - Warning: warning colors
 * - Info: coral colors
 */

export const toast = {
  /**
   * Show a success toast notification
   */
  success: (title: string, description?: string) => {
    return sonnerToast.success(title, {
      description,
    });
  },

  /**
   * Show an error toast notification
   */
  error: (title: string, description?: string) => {
    return sonnerToast.error(title, {
      description,
    });
  },

  /**
   * Show a warning toast notification
   */
  warning: (title: string, description?: string) => {
    return sonnerToast.warning(title, {
      description,
    });
  },

  /**
   * Show an info toast notification (uses coral colors)
   */
  info: (title: string, description?: string) => {
    return sonnerToast.info(title, {
      description,
    });
  },

  /**
   * Show a default toast notification
   */
  default: (title: string, description?: string) => {
    return sonnerToast(title, {
      description,
    });
  },

  /**
   * Show a toast with a custom action button
   */
  action: (
    title: string,
    options: {
      description?: string;
      actionLabel: string;
      onAction: () => void;
    }
  ) => {
    return sonnerToast(title, {
      description: options.description,
      action: {
        label: options.actionLabel,
        onClick: options.onAction,
      },
    });
  },

  /**
   * Show a promise-based toast (loading → success/error)
   */
  promise: <T,>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) => {
    return sonnerToast.promise(promise, options);
  },

  /**
   * Dismiss a specific toast by ID
   */
  dismiss: (toastId?: string | number) => {
    return sonnerToast.dismiss(toastId);
  },
};
