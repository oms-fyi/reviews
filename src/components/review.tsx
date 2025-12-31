import {
  CalendarIcon,
  PencilSquareIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import classNames from "classnames";
import Link from "next/link";
import { type JSX } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

import { Time } from "./datetime";

interface ReviewProps {
  createdAt: string;
  course: {
    name: string | null;
    slug: string | null;
  } | null;
  semester: {
    startDate: string | null;
    term: string | null;
  } | null;
  author: string | null;
  difficulty: number;
  rating: number;
  workload: number;
  body: string;
}

export function Review({
  author = "Georgia Tech Student",
  difficulty,
  rating,
  workload,
  body,
  createdAt,
  course,
  semester,
}: ReviewProps): JSX.Element {
  return (
    <article className="prose prose-sm mx-auto bg-white px-6 py-3 shadow-sm sm:rounded-lg">
      <p className="flex items-center gap-2">
        <UserCircleIcon className="h-11 w-11 text-gray-400" />
        <span className="flex flex-col gap-1">
          <span className="font-medium">
            {author ?? "Georgia Tech Student"}
          </span>
          <span className="flex gap-3">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <PencilSquareIcon className="h-4 w-4" aria-hidden="true" />
              <Time dateTime={createdAt} opts={{ dateStyle: "long" }} />
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <CalendarIcon className="h-4 w-4" aria-hidden="true" />
              <span className="capitalize">
                {semester && semester.startDate
                  ? `${semester.term} ${new Date(
                      semester.startDate,
                    ).getFullYear()}`
                  : "Unknown Semester"}
              </span>
            </span>
          </span>
        </span>
      </p>
      {course && course?.slug && course?.name && (
        <Link
          href={`/courses/${course.slug}/reviews`}
          className="text-sm text-indigo-600 hover:text-indigo-900"
        >
          {course.name}
        </Link>
      )}
      <div className="wrap-break-word">
        <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{body}</ReactMarkdown>
      </div>
      <p className="flex flex-row gap-2">
        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
          Rating: {rating ? `${rating} / 5` : "N/A"}
        </span>
        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
          Difficulty: {difficulty ? `${difficulty} / 5` : "N/A"}
        </span>
        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
          Workload: {workload ? `${workload} hours / week` : "N/A"}
        </span>
      </p>
    </article>
  );
}
