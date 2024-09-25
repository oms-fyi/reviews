export function Footer() {
  return (
    <footer className="h-fit grow-0 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:flex md:items-center md:justify-center lg:px-8">
        <div className="md:order-1 md:mt-0">
          <p className="text-center text-base text-gray-400">
            &copy; {new Date().getFullYear()} FIB Review. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
