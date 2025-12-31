import { PropsWithChildren } from "react";

export default function ReviewPageLayout({ children }: PropsWithChildren) {
  return (
    <section className="m-auto flex h-full max-w-6xl items-center justify-center px-5 py-10">
      {children}
    </section>
  );
}
