import {
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import classNames from "classnames";
import type { JSX } from "react";

interface AlertProps {
  variant: "success" | "failure";
  onDismiss: () => void;
  children: React.ReactNode;
}

export function Alert({
  variant,
  children,
  onDismiss,
}: AlertProps): JSX.Element {
  return (
    <div
      className={classNames(
        {
          "bg-red-50": variant === "failure",
          "bg-green-50": variant === "success",
        },
        "my-4 rounded-md p-4",
      )}
    >
      <div className="flex">
        <div className="shrink-0">
          {variant === "success" ? (
            <CheckCircleIcon className="h-5 w-5 text-green-400" />
          ) : (
            <XCircleIcon className="h-5 w-5 text-red-400" />
          )}
        </div>
        <div
          className={classNames(
            {
              "text-green-800": variant === "success",
              "text-red-800": variant === "failure",
            },
            "ml-3",
          )}
        >
          {children}
        </div>
        <div className="ml-auto self-start pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              onClick={onDismiss}
              className={classNames(
                {
                  "bg-green-50 text-green-500 hover:bg-green-100 focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50 focus:outline-hidden":
                    variant === "success",
                  "bg-red-50 text-red-500 hover:bg-red-100 focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50 focus:outline-hidden":
                    variant === "failure",
                },
                "inline-flex rounded-md p-1.5",
              )}
            >
              <span className="sr-only">Dismiss</span>
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
