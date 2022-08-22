import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

import {
  CalendarIcon,
  PencilAltIcon,
  UserCircleIcon,
} from "@heroicons/react/outline";

import { Review, Semester, Course } from "src/@types";
import Link from "next/link";

interface ReviewListProps {
  reviews: Array<
    Review & {
      semester: Semester;
      course?: Pick<Course, "name" | "slug">;
    }
  >;
}

export function ReviewList({ reviews }: ReviewListProps): JSX.Element {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <ul className="space-y-4 divide-gray-200 prose prose-sm mx-auto">
      {reviews.map(
        ({
          id,
          created,
          authorId,
          body,
          rating,
          difficulty,
          workload,
          semester,
          course,
        }) => (
          <li key={id} className="bg-white px-4 py-2 shadow sm:rounded-lg">
            {course && <h3>{course.name}</h3>}
            <p className="flex gap-2 items-center">
              <UserCircleIcon className="h-11 w-11 text-gray-400" />
              <span className="flex flex-col gap-1">
                <span className="font-medium">
                  {authorId ?? "Georgia Tech Student"}
                </span>
                <span className="flex gap-3">
                  <span className="text-gray-500 flex items-center text-xs gap-1">
                    <PencilAltIcon className="h-4 w-4" aria-hidden="true" />
                    {hasMounted
                      ? new Date(created).toLocaleDateString(
                          navigator.language || "en-US",
                          { dateStyle: "long" }
                        )
                      : created}
                  </span>
                  <span className="text-gray-500 flex items-center text-xs gap-1">
                    <CalendarIcon className="h-4 w-4" aria-hidden="true" />
                    <span className="capitalize">
                      {semester
                        ? `${semester.term} ${new Date(
                            semester.startDate
                          ).getFullYear()}`
                        : "Unknown Semester"}
                    </span>
                  </span>
                </span>
              </span>
            </p>
            <div className="break-words">
              <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                {body}
              </ReactMarkdown>
            </div>
            <p className="flex flex-row gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Rating: {rating ? `${rating} / 5` : "N/A"}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Difficulty: {difficulty ? `${difficulty} / 5` : "N/A"}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Workload: {workload ? `${workload} hours / week` : "N/A"}
              </span>
            </p>
            {course && (
              <Link href={`/courses/${course.slug}/reviews`} passHref>
                <a href="replace">More {course.name} reviews</a>
              </Link>
            )}
          </li>
        )
      )}
    </ul>
  );
}
