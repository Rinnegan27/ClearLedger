"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-gray-600",
          actionButton:
            "group-[.toast]:bg-burgundy-600 group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-600",
          success:
            "group-[.toast]:bg-success-50 group-[.toast]:text-success-900 group-[.toast]:border-success-200",
          error:
            "group-[.toast]:bg-danger-50 group-[.toast]:text-danger-900 group-[.toast]:border-danger-200",
          warning:
            "group-[.toast]:bg-warning-50 group-[.toast]:text-warning-900 group-[.toast]:border-warning-200",
          info:
            "group-[.toast]:bg-coral-50 group-[.toast]:text-coral-900 group-[.toast]:border-coral-200",
        },
      }}
      visibleToasts={3}
      duration={5000}
      {...props}
    />
  );
};

export { Toaster };
