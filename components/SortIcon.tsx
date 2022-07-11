import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/solid";
import { FC } from "react";

export const SortIcon: FC<{ active: boolean; direction: string }> = ({
  active,
  direction,
}) => {
  if (!active) {
    return (
      <span className="invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible">
        <ChevronUpIcon className="h-5 w-5" aria-hidden="true" />
      </span>
    );
  }

  return (
    <span className="ml-2 flex-none rounded bg-gray-200 text-gray-900 group-hover:bg-gray-300">
      {direction === "asc" ? (
        <ChevronUpIcon className="h-5 w-5" aria-hidden="true" />
      ) : (
        <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
      )}
    </span>
  );
};
