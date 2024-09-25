import Link from "next/link";

export default function LoginPage(): JSX.Element {
  return (
    <div className="my-10 flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-10 text-center shadow-lg">
        <h2 className="mb-6 text-2xl font-bold">Sign In</h2>
        <p className="mb-8 text-gray-600">
          To ensure that reviews are written by actual students of these
          subjects, please log in with your institution account
        </p>
        <div className="flex flex-col gap-4">
          <Link href="/api/auth/fib" passHref>
            <button className="rounded border border-black bg-white px-4 py-2 text-black transition-colors hover:bg-blue-500 hover:text-white">
              Proceed with FIB API
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
