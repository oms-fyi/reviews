"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Alert } from "src/components/alert";

type EditReviewFormProps = {
  reviewId: string;
  initial: {
    body: string;
    rating: number;
    difficulty: number;
    workload: number;
  };
  courseName: string;
};

export function EditReviewForm({
  reviewId,
  initial,
  courseName,
}: EditReviewFormProps) {
  const [body, setBody] = useState(initial.body);
  const [rating, setRating] = useState(initial.rating);
  const [difficulty, setDifficulty] = useState(initial.difficulty);
  const [workload, setWorkload] = useState(initial.workload);
  const [errors, setErrors] = useState<string[]>();
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setErrors(undefined);

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, rating, difficulty, workload }),
      });

      const data = (await response.json()) as {
        errors?: string[];
        error?: string;
      };

      if (!response.ok) {
        setErrors(
          data.errors ?? [data.error ?? "Something went wrong. Please try again."],
        );
      } else {
        router.replace("/reviews/mine?updated=1");
        router.refresh();
      }
    } catch {
      setErrors(["Something went wrong. Please try again."]);
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="mx-auto mt-10 max-w-2xl bg-white px-5 py-10 sm:px-20">
      <div className="mb-8">
        <Link
          href="/reviews/mine"
          className="text-sm text-indigo-600 hover:text-indigo-800"
        >
          ← Back to my reviews
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Edit review</h1>
        <p className="mt-1 text-sm text-gray-600">{courseName}</p>
      </div>

      {errors && (
        <div className="mb-4">
          <Alert variant="failure" onDismiss={() => setErrors(undefined)}>
            <ul className="list-inside list-disc">
              {errors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          </Alert>
        </div>
      )}

      <form onSubmit={(e) => onSubmit(e)} className="space-y-6">
        <div>
          <label htmlFor="rating" className="block text-sm font-medium text-gray-700">
            Rating (1–5)
          </label>
          <input
            id="rating"
            type="number"
            min={1}
            max={5}
            required
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-xs focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="difficulty"
            className="block text-sm font-medium text-gray-700"
          >
            Difficulty (1–5)
          </label>
          <input
            id="difficulty"
            type="number"
            min={1}
            max={5}
            required
            value={difficulty}
            onChange={(e) => setDifficulty(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-xs focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="workload"
            className="block text-sm font-medium text-gray-700"
          >
            Workload (hours per week, 1–100)
          </label>
          <input
            id="workload"
            type="number"
            min={1}
            max={100}
            required
            value={workload}
            onChange={(e) => setWorkload(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-xs focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="body" className="block text-sm font-medium text-gray-700">
            Review
          </label>
          <textarea
            id="body"
            required
            rows={8}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-xs focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
      </form>
    </section>
  );
}
