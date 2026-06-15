"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="light"
      position="top-right"
      richColors
      toastOptions={{
        classNames: {
          toast: "rounded-lg border shadow-md",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
