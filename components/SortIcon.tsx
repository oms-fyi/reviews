import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/solid";
import classNames from "classnames";

interface SortIconProps {
  active: boolean;
  direction: "asc" | "desc";
}

export default function SortIcon({
  active,
  direction,
}: SortIconProps): JSX.Element {
  return (
    <span
      className={classNames("ml-2 flex-none rounded", {
        "invisible text-gray-400 group-hover:visible group-focus:visible":
          !active,
        "bg-gray-200 text-gray-900 group-hover:bg-gray-300": active,
      })}
    >
      {direction === "asc" || !active ? (
        <ChevronUpIcon className="h-5 w-5" aria-hidden="true" />
      ) : (
        <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
      )}
    </span>
  );
}
