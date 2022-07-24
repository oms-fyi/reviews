import { FC } from "react";
import { Switch } from "@headlessui/react";
import classNames from "classnames";

interface ToggleProps {
  enabled: boolean;
  onChange: (nextValue: boolean) => void;
  label: string;
}

export const Toggle: FC<ToggleProps> = ({ enabled, onChange, label }) => (
  <Switch.Group as="div" className="flex items-center">
    <Switch
      checked={enabled}
      onChange={onChange}
      className={classNames(
        { "bg-indigo-600": enabled, "bg-gray-200": !enabled },
        "relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      )}
    >
      <span
        aria-hidden="true"
        className={classNames(
          { "translate-x-5": enabled, "translate-x-0": !enabled },
          "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"
        )}
      />
    </Switch>
    <Switch.Label as="span" className="ml-3">
      <span className="text-sm font-medium text-gray-900">{label}</span>
    </Switch.Label>
  </Switch.Group>
);
