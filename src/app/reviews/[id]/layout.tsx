import { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren): JSX.Element {
  return (
    <main className="m-auto flex h-full max-w-6xl items-center justify-center px-5 py-10">
      {children}
    </main>
  );
}
