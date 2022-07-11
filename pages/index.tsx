import { PlusSmIcon, MinusSmIcon } from "@heroicons/react/solid";
import type { NextPage, GetStaticProps } from "next";
import Link from "next/link";
import { useMemo, useState } from "react";
import { SortIcon } from "../components/SortIcon";
import { Toggle } from "../components/Toggle";
import { Course } from "../@types";
import { getCourses } from "../lib/sanity";

interface HomePageProps {
  courses: Course[];
}

export const getStaticProps: GetStaticProps<HomePageProps> = async () => {
  const courses = await getCourses();

  return {
    props: { courses },
  };
};

interface SortConfig {
  attribute: keyof Pick<
    Course,
    "name" | "difficulty" | "reviewCount" | "rating" | "workload"
  >;
  direction: "desc" | "asc";
}

const Home: NextPage<HomePageProps> = ({ courses }) => {
  const [sort, setSort] = useState<SortConfig>({
    attribute: "reviewCount",
    direction: "desc",
  });

  const [foundational, setFoundational] = useState(false);
  const [deprecated, setDeprecated] = useState(false);
  const [hasReviews, setHasReviews] = useState(true);

  const [showFilters, setShowFilters] = useState(false);

  const coursesView = useMemo(() => {
    const { attribute } = sort;

    const sorted = courses.sort((a, b) => {
      const ordering = sort.direction === "asc" ? 1 : -1;

      if (attribute === "name") {
        return a[attribute].localeCompare(b[attribute]) * ordering;
      } else if (typeof a[attribute] === "undefined") {
        return 1;
      } else if (typeof b[attribute] === "undefined") {
        return -1;
      } else {
        return ((a[attribute] as number) - (b[attribute] as number)) * ordering;
      }
    });

    return sorted.filter((course) => {
      return (
        (foundational ? course.isFoundational : true) &&
        (deprecated ? course.isDeprecated : true) &&
        (hasReviews ? course.reviewCount > 0 : true)
      );
    });
  }, [sort, courses, foundational, deprecated, hasReviews]);

  function toggleSort(attribute: SortConfig["attribute"]) {
    if (sort.attribute !== attribute) {
      setSort({ attribute, direction: "asc" });
    } else {
      setSort({
        attribute,
        direction: sort.direction === "asc" ? "desc" : "asc",
      });
    }
  }

  return (
    <main className="mx-auto sm:max-w-4xl sm:px-6 lg:px-8 mt-10">
      <>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="mt-8 flex flex-col">
            <div className="-my-2 -mx-4 sm:-mx-6 lg:-mx-8">
              <div className="sm:flex sm:items-center mb-10">
                <div className="sm:flex-auto">
                  <h1 className="text-2xl font-semibold text-gray-900">
                    OMS Reviews
                  </h1>
                  <p className="mt-2 text-sm text-gray-700">
                    Pick the best course for you this semester.
                  </p>
                  <a
                    target="_blank"
                    href="https://github.com/oms-tech/reviews"
                    className="text-indigo-600 text-xs md:text-sm hover:text-indigo-900 flex"
                    rel="noreferrer"
                  >
                    View on Github
                  </a>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center px-4 py-2 border border-dotted border-indigo-600 rounded-md shadow-sm text-sm font-medium text-indigo-300 hover:blur-sm hover:cursor-not-allowed"
                  >
                    Add Review
                  </button>
                </div>
              </div>
              <div className="relative">
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex items-center justify-between">
                  <span className="pr-3 font-medium text-gray-900 bg-gray-100">
                    Showing {coursesView.length} / {courses.length} courses
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowFilters((f) => !f)}
                    className="inline-flex items-center shadow-sm px-4 py-1.5 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {showFilters ? (
                      <MinusSmIcon
                        className="-ml-1.5 mr-1 h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    ) : (
                      <PlusSmIcon
                        className="-ml-1.5 mr-1 h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    )}
                    <span>Filters</span>
                  </button>
                </div>
              </div>
              <div className="inline-block min-w-full py-3 align-middle">
                <div className={showFilters ? "block pt-2 pb-5" : "hidden"}>
                  <div className="py-2">
                    <Toggle
                      label="Foundational Courses"
                      enabled={foundational}
                      onChange={() => {
                        setFoundational((f) => !f);
                      }}
                    />
                  </div>
                  <div className="py-2">
                    <Toggle
                      label="Deprecated Courses"
                      enabled={deprecated}
                      onChange={() => {
                        setDeprecated((f) => !f);
                      }}
                    />
                  </div>
                  <div className="py-2">
                    <Toggle
                      label="Courses with 1+ Reviews"
                      enabled={hasReviews}
                      onChange={() => {
                        setHasReviews((f) => !f);
                      }}
                    />
                  </div>
                </div>
                <div className="shadow-sm ring-1 ring-black ring-opacity-5">
                  <table
                    className="min-w-full border-separate"
                    style={{ borderSpacing: 0 }}
                  >
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="sticky top-0 z-10 border-b border-gray-300 bg-gray-50 bg-opacity-75 px-2 py-2 md:px-3 md:py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                        >
                          <a
                            href="#"
                            className="group inline-flex"
                            onClick={() => toggleSort("name")}
                          >
                            Name
                            <SortIcon
                              active={sort.attribute === "name"}
                              direction={sort.direction}
                            ></SortIcon>
                          </a>
                        </th>
                        <th
                          scope="col"
                          className="sticky top-0 z-10 border-b border-gray-300 bg-gray-50 bg-opacity-75 px-2 py-2 md:px-3 md:py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                        >
                          <a
                            href="#"
                            className="group inline-flex"
                            onClick={() => toggleSort("rating")}
                          >
                            Rating
                            <SortIcon
                              active={sort.attribute === "rating"}
                              direction={sort.direction}
                            ></SortIcon>
                          </a>
                        </th>
                        <th
                          scope="col"
                          className="sticky top-0 z-10 border-b border-gray-300 bg-gray-50 bg-opacity-75 px-2 py-2 md:px-3 md:py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                        >
                          <a
                            href="#"
                            className="group inline-flex"
                            onClick={() => toggleSort("difficulty")}
                          >
                            Difficulty
                            <SortIcon
                              active={sort.attribute === "difficulty"}
                              direction={sort.direction}
                            ></SortIcon>
                          </a>
                        </th>
                        <th
                          scope="col"
                          className="sticky top-0 z-10 border-b border-gray-300 bg-gray-50 bg-opacity-75 px-2 py-2 md:px-3 md:py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                        >
                          <a
                            href="#"
                            className="group inline-flex"
                            onClick={() => toggleSort("workload")}
                          >
                            Workload
                            <SortIcon
                              active={sort.attribute === "workload"}
                              direction={sort.direction}
                            ></SortIcon>
                          </a>
                        </th>
                        <th
                          scope="col"
                          className="sticky top-0 z-10 border-b border-gray-300 bg-gray-50 bg-opacity-75 px-2 py-2 md:px-3 md:py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                        >
                          <a
                            href="#"
                            className="group inline-flex"
                            onClick={() => toggleSort("reviewCount")}
                          >
                            Reviews
                            <SortIcon
                              active={sort.attribute === "reviewCount"}
                              direction={sort.direction}
                            ></SortIcon>
                          </a>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {coursesView.map(
                        (
                          {
                            id,
                            name,
                            reviewCount,
                            difficulty,
                            rating,
                            workload,
                          },
                          index
                        ) => (
                          <tr
                            key={id}
                            className={
                              index % 2 === 0 ? undefined : "bg-gray-50"
                            }
                          >
                            <td className=" px-2 py-2 md:px-3 md:py-4 text-sm font-medium text-gray-500 sm:pl-6 ">
                              <span className="text-xs hidden sm:block">
                                {id}
                              </span>
                              <dl className="font-normal">
                                <dt className="sr-only">Title</dt>
                                <dd className="mt-1">
                                  <Link href={`/courses/${id}/reviews`}>
                                    <a className="text-indigo-600 text-xs md:text-sm hover:text-indigo-900">
                                      {name}
                                      <span className="sr-only"> reviews</span>
                                    </a>
                                  </Link>
                                </dd>
                              </dl>
                            </td>
                            <td className="whitespace-nowrap px-2 py-2 md:px-3 md:py-4 text-xs sm:text-sm text-gray-500">
                              {rating ? rating.toFixed(2) : "N/A"}
                            </td>
                            <td className="whitespace-nowrap px-2 py-2 md:px-3 md:py-4 text-xs sm:text-sm text-gray-500">
                              {difficulty ? difficulty.toFixed(2) : "N/A"}
                            </td>
                            <td className="whitespace-nowrap px-2 py-2 md:px-3 md:py-4 text-xs sm:text-sm text-gray-500">
                              {workload ? workload.toFixed(2) : "N/A"}
                            </td>
                            <td className="whitespace-nowrap px-2 py-2 md:px-3 md:py-4 text-xs sm:text-sm text-gray-500">
                              {reviewCount}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    </main>
  );
};

export default Home;
