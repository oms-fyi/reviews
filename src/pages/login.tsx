import Link from "next/link";

export default function LoginPage(): JSX.Element {
  return (
    <Link href="/api/auth/fib" passHref>
      <button
        style={{
          border: "1px solid black",
          backgroundColor: "white",
          borderRadius: "10px",
          height: "50px",
          width: "200px",
          cursor: "pointer",
        }}
      >
        Proceed with FIB API
      </button>
    </Link>
  );
}
