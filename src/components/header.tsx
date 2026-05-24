"use client";

import { Disclosure, Menu, Transition } from "@headlessui/react";
import { PlusIcon } from "@heroicons/react/20/solid";
import {
  Bars3Icon,
  ChevronDownIcon,
  ClockIcon,
  CpuChipIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  LockClosedIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import classNames from "classnames";
import Image from "next/image";
import Link from "next/link";
import { AccountMenu, AccountMenuMobile } from "src/components/account-menu";
import { useParams, usePathname } from "next/navigation";
import { Fragment, type JSX, useEffect, useState } from "react";

const reviewsMenuItems = [
  {
    title: "Most Recent",
    subtitle: "The 100 most recently submitted reviews",
    href: "/reviews/recent",
    icon: ClockIcon,
  },
  {
    title: "CS-6250",
    subtitle: "Computer Networks",
    href: "/courses/computer-networks/reviews",
    icon: GlobeAltIcon,
  },
  {
    title: "CS-6035",
    subtitle: "Introduction to Information Security",
    href: "/courses/introduction-to-information-security/reviews",
    icon: LockClosedIcon,
  },
  {
    title: "CS-7646",
    subtitle: "Machine Learning for Trading",
    href: "/courses/machine-learning-for-trading/reviews",
    icon: CurrencyDollarIcon,
  },
  {
    title: "CS-6200",
    subtitle: "Introduction to Operating Systems",
    href: "/courses/graduate-introduction-to-operating-systems/reviews",
    icon: CpuChipIcon,
  },
];

export function Header(): JSX.Element {
  const pathname = usePathname();
  const params = useParams<{ slug?: string }>();
  const [newReviewURL, setNewReviewURL] = useState<URL>();
  const [copiedContactInfo, setCopiedContactInfo] = useState<string>("");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCopiedContactInfo("");
    }, 2000);

    return function cleanup() {
      clearTimeout(timeoutId);
    };
  }, [copiedContactInfo]);

  useEffect(() => {
    const url = new URL(`${window.location.origin}/reviews/new`);

    if (typeof params.slug === "string") {
      url.searchParams.append("course", params.slug);
    }

    setNewReviewURL(url);
  }, [params.slug]);

  return (
    <Disclosure as="nav" className="bg-white shadow-sm">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <div className="mr-2 -ml-2 flex items-center md:hidden">
                  {/* Mobile menu button */}
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden focus:ring-inset">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
                <Link href="/" className="flex shrink-0 items-center">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/logo.svg"
                      alt="OMS Tech Logo"
                      width={32}
                      height={32}
                      className="block"
                    />
                    <h1 className="text-lg">OMS Reviews</h1>
                  </div>
                </Link>
                <div className="hidden justify-center gap-6 md:ml-6 md:flex">
                  <Link
                    href="/"
                    className={classNames(
                      {
                        "border-indigo-500 text-gray-900": pathname === "/",
                        "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700":
                          pathname !== "/",
                      },
                      "inline-flex items-center border-b-2 px-1 pt-1",
                    )}
                  >
                    Home
                  </Link>
                  <Menu
                    as="div"
                    className="relative inline-flex items-center px-1 pt-1 text-gray-500 hover:text-gray-700"
                  >
                    {({ open: reviewMenuOpen }) => (
                      <>
                        <Menu.Button
                          className={classNames(
                            {
                              "text-gray-900": reviewMenuOpen,
                              "text-gray-500": !reviewMenuOpen,
                            },
                            "group inline-flex items-center rounded-md bg-white text-base font-medium hover:text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden",
                          )}
                        >
                          Reviews
                          <ChevronDownIcon
                            className={classNames(
                              reviewMenuOpen
                                ? "text-gray-600"
                                : "text-gray-400",
                              "ml-2 h-5 w-5 group-hover:text-gray-500",
                            )}
                            aria-hidden="true"
                          />
                        </Menu.Button>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-200"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute top-full z-10 -mt-3 -ml-4 w-screen max-w-md origin-bottom-right transform px-2 sm:px-0 lg:left-1/2 lg:ml-0 lg:-translate-x-1/2">
                            <div className="ring-opacity-5 overflow-hidden rounded-lg shadow-lg">
                              <div className="relative grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8">
                                {reviewsMenuItems.map((item) => (
                                  <Menu.Item key={item.href}>
                                    <Link
                                      href={item.href}
                                      key={item.href}
                                      className="-m-3 flex items-start rounded-lg p-3 hover:bg-gray-50"
                                    >
                                      <item.icon
                                        className="h-6 w-6 shrink-0 text-indigo-600"
                                        aria-hidden="true"
                                      />
                                      <div className="ml-4">
                                        <p className="text-base font-medium text-gray-900">
                                          {item.title}
                                        </p>
                                        <p className="mt-1 text-sm text-gray-500">
                                          {item.subtitle}
                                        </p>
                                      </div>
                                    </Link>
                                  </Menu.Item>
                                ))}
                              </div>
                            </div>
                          </Menu.Items>
                        </Transition>
                      </>
                    )}
                  </Menu>
                  <a
                    href="https://omscs-notes.com"
                    className="inline-flex items-center px-1 pt-1 text-gray-500 hover:text-gray-700"
                  >
                    OMSCS Notes
                  </a>
                </div>
              </div>
              <div className="flex items-center">
                <div className="shrink-0">
                  <Link
                    href={newReviewURL ?? "/"}
                    className="relative inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden"
                  >
                    <PlusIcon
                      className="mr-2 -ml-1 h-5 w-5"
                      aria-hidden="true"
                    />
                    <span>Add Review</span>
                  </Link>
                </div>
                <div className="hidden md:ml-4 md:flex md:shrink-0 md:items-center">
                  <AccountMenu />
                </div>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="md:hidden">
            <div className="space-y-1 pt-2 pb-3">
              <Link href="/" passHref>
                <Disclosure.Button
                  as="a"
                  href="#"
                  className={classNames({
                    "block border-l-4 border-indigo-500 bg-indigo-50 py-2 pr-4 pl-3 text-base font-medium text-indigo-700 sm:pr-6 sm:pl-5":
                      pathname === "/",
                    "block border-l-4 border-transparent py-2 pr-4 pl-3 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 sm:pr-6 sm:pl-5":
                      pathname !== "/",
                  })}
                >
                  Courses
                </Disclosure.Button>
              </Link>
              <Disclosure.Button
                as="a"
                href="https://omscs-notes.com"
                className="block py-2 pr-4 pl-3 text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 sm:pr-6 sm:pl-5"
              >
                OMSCS Notes
              </Disclosure.Button>
            </div>
            <div className="border-t border-gray-200 pt-4 pb-3">
              <div className="space-y-1">
                {reviewsMenuItems.map((item) => (
                  <Link href={item.href} key={item.href} passHref>
                    <Disclosure.Button
                      as="a"
                      className="flex items-start rounded-lg p-3 hover:bg-gray-50"
                    >
                      <item.icon
                        className="h-6 w-6 shrink-0 text-indigo-600"
                        aria-hidden="true"
                      />
                      <div className="ml-4">
                        <p className="text-base font-medium text-gray-900">
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {item.subtitle}
                        </p>
                      </div>
                    </Disclosure.Button>
                  </Link>
                ))}
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4 pb-3">
              <AccountMenuMobile />
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
