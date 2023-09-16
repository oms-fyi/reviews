import { PropsWithChildren } from "react";

export function Banner({ children }: PropsWithChildren): JSX.Element {
  return (
    <div className="relative bg-indigo-600">
      <div className="mx-auto max-w-7xl px-3 py-3 sm:px-6 lg:px-8">
        <div className="text-center ">
          <p className="font-medium text-white">{children}</p>
        </div>
      </div>
    </div>
  );
}
