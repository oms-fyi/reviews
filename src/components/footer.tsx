import { Cookie } from "next/font/google";
import Image from "next/image";
import buyMeACoffeeLogo from "public/bmac.svg";

const cookie = Cookie({ weight: "400", subsets: ["latin"] });

export function Footer() {
  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          <a
            href="https://www.buymeacoffee.com/omstech"
            className="relative inline-flex items-center gap-2 rounded-md border border-transparent bg-indigo-600 px-4 py-2 pr-5 text-2xl text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <Image
              // https://duncanleung.com/next-js-typescript-svg-any-module-declaration/
              src={buyMeACoffeeLogo as string}
              alt="A cup of coffee"
              width={32}
              className="block"
            />
            <span className={cookie.className}>Buy me a coffee</span>
          </a>
        </div>
        <div className="mt-8 md:order-1 md:mt-0">
          <p className="text-center text-base text-gray-400">
            &copy; {new Date().getFullYear()} OMSCentral. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
