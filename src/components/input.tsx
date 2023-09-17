import { HTMLProps, forwardRef } from "react";

type Props = HTMLProps<HTMLInputElement> & {
  label: string;
};

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { id, label, ...delegated },
  ref
) {
  return (
    <div className="relative rounded-md border border-gray-300 px-3 py-2 shadow-sm focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600">
      <label
        htmlFor={id}
        className="absolute -top-2 left-2 -mt-px inline-block bg-white px-1 text-xs font-medium text-gray-900"
      >
        {label}
      </label>

      <input
        {...delegated}
        ref={ref}
        id={id}
        className="block border-0 p-0 text-base text-gray-900 placeholder-gray-400 focus:ring-0 sm:text-sm"
      />
    </div>
  );
});
