import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

import { CalendarIcon, PencilAltIcon } from "@heroicons/react/outline";
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
    <ul className="divide-y px-6 divide-gray-200 prose prose-sm mx-auto">
      {reviews.map(
        ({
          id,
          created,
          body,
          rating,
          difficulty,
          workload,
          semester,
          course,
        }) => (
          <li key={id}>
            {course && (
              <>
                <h3>{course.name}</h3>
                <Link href={`/courses/${course.slug}/reviews`} passHref>
                  <a href="replace">More reviews for {course.name}</a>
                </Link>
              </>
            )}
            <div className="break-words">
              <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                {body}
              </ReactMarkdown>
            </div>
            <div className="py-2 flex flex-row gap-2 items-start">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Rating: {rating ? `${rating} / 5` : "N/A"}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Difficulty: {difficulty ? `${difficulty} / 5` : "N/A"}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Workload: {workload ? `${workload} hours / week` : "N/A"}
              </span>
            </div>
            {semester && (
              <p className="text-gray-500 mt-2 flex items-center text-xs">
                <CalendarIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                <span className="capitalize">
                  Semester: {semester.term}{" "}
                  {new Date(semester.startDate).getFullYear()}
                </span>
              </p>
            )}
            <p className="text-gray-500 mt-2 flex items-center text-xs">
              <PencilAltIcon className="h-5 w-5 mr-2" aria-hidden="true" />
              {`Review submitted: ${
                hasMounted
                  ? new Date(created).toLocaleDateString(
                      navigator.language || "en-US",
                      { dateStyle: "long" }
                    )
                  : created
              }`}
            </p>
          </li>
        )
      )}
    </ul>
  );
}
