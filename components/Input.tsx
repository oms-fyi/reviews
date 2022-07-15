import { FC, HTMLProps } from "react";

export const Input: FC<HTMLProps<HTMLInputElement> & { label: string }> = ({
  id,
  label,
  ...delegated
}) => {
  return (
    <div className="relative border border-gray-300 rounded-md px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-indigo-600 focus-within:border-indigo-600">
      <label
        htmlFor={id}
        className="absolute -top-2 left-2 -mt-px inline-block px-1 bg-white text-xs font-medium text-gray-900"
      >
        {label}
      </label>

      <input
        {...delegated}
        id={id}
        className="text-base block border-0 p-0 text-gray-900 placeholder-gray-400 focus:ring-0 sm:text-sm"
      />
    </div>
  );
};
