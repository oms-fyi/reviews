import Image from 'next/image';
import buyMeACoffeeLogo from 'public/bmac.svg';

export default function Footer() {
  return (
    <footer className="bg-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          <a href="https://www.buymeacoffee.com/omstech" className="font-cookie text-2xl relative inline-flex gap-2 items-center px-4 py-2 pr-5 border border-transparent rounded-md text-white bg-indigo-600 shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <Image
              // https://duncanleung.com/next-js-typescript-svg-any-module-declaration/
              src={buyMeACoffeeLogo as string}
              alt="A cup of coffee"
              width={32}
              height={32}
              className="block"
            />
            <span>Buy me a coffee</span>
          </a>
        </div>
        <div className="mt-8 md:mt-0 md:order-1">
          <p className="text-center text-base text-gray-400">
            &copy;
            {' '}
            {new Date().getFullYear()}
            {' '}
            OMSCentral. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
