import { Switch } from "@headlessui/react";
import classNames from "classnames";

interface ToggleProps {
  enabled: boolean;
  onChange: (nextValue: boolean) => void;
  label: string;
}

export function Toggle({ enabled, onChange, label }: ToggleProps): JSX.Element {
  return (
    <Switch.Group as="div" className="flex items-center">
      <Switch
        checked={enabled}
        onChange={onChange}
        className={classNames(
          { "bg-indigo-600": enabled, "bg-gray-200": !enabled },
          "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        )}
      >
        <span
          aria-hidden="true"
          className={classNames(
            { "translate-x-5": enabled, "translate-x-0": !enabled },
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
          )}
        />
      </Switch>
      <Switch.Label as="span" className="ml-3">
        <span className="text-sm font-medium text-gray-900">{label}</span>
      </Switch.Label>
    </Switch.Group>
  );
}
