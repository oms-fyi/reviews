"use client";

import { Menu, Transition } from "@headlessui/react";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import classNames from "classnames";
import Link from "next/link";
import { Fragment, useCallback, useEffect, useState } from "react";

type SessionUser = {
  username: string;
};

export function AccountMenu() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [casAuth, setCasAuth] = useState(false);

  const loadSession = useCallback(async () => {
    try {
      const [configRes, sessionRes] = await Promise.all([
        fetch("/api/auth/config"),
        fetch("/api/auth/session"),
      ]);
      const config = (await configRes.json()) as { cas: boolean };
      const data = (await sessionRes.json()) as { user: SessionUser | null };
      setCasAuth(config.cas);
      setUser(data.user);
    } catch {
      setUser(null);
      setCasAuth(false);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadSession().catch(() => {});
  }, [loadSession]);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  }

  const signInHref = `/api/auth/cas/login?returnTo=${encodeURIComponent(
    typeof window !== "undefined" ? window.location.pathname : "/reviews/mine",
  )}`;

  return (
    <Menu as="div" className="relative ml-3">
      <div className="flex">
        <Menu.Button className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden">
          <span className="sr-only">Open account menu</span>
          <UserCircleIcon className="h-6 w-6" aria-hidden="true" />
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md bg-white py-1 shadow-lg focus:outline-hidden">
          {loaded && casAuth && user ? (
            <>
              <div className="border-b border-gray-100 px-4 py-2 text-sm text-gray-500">
                Signed in as{" "}
                <span className="font-medium text-gray-900">
                  {user.username}
                </span>
              </div>
              <Menu.Item>
                {({ active }) => (
                  <Link
                    href="/reviews/mine"
                    className={classNames(
                      { "bg-gray-100": active },
                      "block px-4 py-2 text-gray-700",
                    )}
                  >
                    My reviews
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    type="button"
                    onClick={() => {
                      signOut().catch(() => {});
                    }}
                    className={classNames(
                      { "bg-gray-100": active },
                      "block w-full px-4 py-2 text-left text-gray-700",
                    )}
                  >
                    Sign out
                  </button>
                )}
              </Menu.Item>
            </>
          ) : (
            loaded &&
            casAuth && (
              <Menu.Item>
                {({ active }) => (
                  <a
                    href={signInHref}
                    className={classNames(
                      { "bg-gray-100": active },
                      "block px-4 py-2 text-gray-700",
                    )}
                  >
                    Sign in with GT
                  </a>
                )}
              </Menu.Item>
            )
          )}
          <div className="border-t border-gray-100">
            <Menu.Item>
              {({ active }) => (
                <a
                  href="https://github.com/oms-tech/reviews"
                  className={classNames(
                    { "bg-gray-100": active },
                    "block px-4 py-2 text-sm text-gray-500",
                  )}
                >
                  View on GitHub
                </a>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

export function AccountMenuMobile() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [casAuth, setCasAuth] = useState(false);

  useEffect(() => {
    Promise.all([fetch("/api/auth/config"), fetch("/api/auth/session")])
      .then(async ([configRes, sessionRes]) => {
        const config = (await configRes.json()) as { cas: boolean };
        const data = (await sessionRes.json()) as { user: SessionUser | null };
        setCasAuth(config.cas);
        setUser(data.user);
      })
      .catch(() => {
        setUser(null);
        setCasAuth(false);
      });
  }, []);

  if (!casAuth) {
    return null;
  }

  if (user) {
    return (
      <>
        <p className="px-4 py-2 text-sm text-gray-500">
          Signed in as {user.username}
        </p>
        <a
          href="/reviews/mine"
          className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 sm:px-6"
        >
          My reviews
        </a>
        <form
          action="/api/auth/logout"
          method="post"
          onSubmit={async (e) => {
            e.preventDefault();
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/";
          }}
        >
          <button
            type="submit"
            className="block w-full px-4 py-2 text-left text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 sm:px-6"
          >
            Sign out
          </button>
        </form>
      </>
    );
  }

  return (
    <a
      href="/api/auth/cas/login?returnTo=/reviews/mine"
      className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 sm:px-6"
    >
      Sign in with GT
    </a>
  );
}
