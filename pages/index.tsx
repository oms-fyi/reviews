import { Dispatch, Fragment, SetStateAction, useState } from "react";

import type { NextPage, GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";

import { Popover, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/solid";

import { Input } from "../components/Input";
import { SortIcon } from "../components/SortIcon";

import type { Course } from "../@types";
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

function getDefaultInputValue(value: number | undefined): string {
  if (typeof value === "undefined" || isNaN(value)) {
    return "";
  } else {
    return value.toString();
  }
}

const Home: NextPage<HomePageProps> = ({ courses }) => {
  const [sort, setSort] = useState<SortConfig>({
    attribute: "reviewCount",
    direction: "desc",
  });

  // By default only show courses with 1+ review
  const [minReviewCount, setMinReviewCount] = useState<number>(1);
  const [maxReviewCount, setMaxReviewCount] = useState<number>();

  const [minRating, setMinRating] = useState<number>();
  const [maxRating, setMaxRating] = useState<number>();

  const [minDifficulty, setMinDifficulty] = useState<number>();
  const [maxDifficulty, setMaxDifficulty] = useState<number>();

  const [minWorkload, setMinWorkload] = useState<number>();
  const [maxWorkload, setMaxWorkload] = useState<number>();

  const current = courses
    .filter(({ reviewCount, rating, difficulty, workload }) => {
      function between(value: number, min: number, max: number): boolean {
        return value >= min && value <= max;
      }

      return (
        between(reviewCount, 0, maxReviewCount || Infinity) &&
        between(rating, minRating || 1, maxRating || 5) &&
        between(difficulty, minDifficulty || 1, maxDifficulty || 5) &&
        between(workload, minWorkload || 1, maxWorkload || 100)
      );
    })
    .sort((a, b) => {
      const ordering = sort.direction === "asc" ? 1 : -1;
      const { attribute } = sort;

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
    <>
      <Head>
        <title>Home | OMSCentral</title>
      </Head>
      <main className="mx-auto sm:max-w-4xl sm:px-6 lg:px-8 mt-10">
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
              <div className="flex justify-end">
                <div>
                  <Popover className="relative">
                    {({ open }) => (
                      <>
                        <Popover.Button
                          className={`
                ${open ? "" : "text-opacity-90"}
                w-24 group inline-flex items-center rounded-md bg-indigo-700 px-3 py-2 text-base font-medium text-white hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
                        >
                          <span>{open ? "Done" : "Filters"}</span>
                          <ChevronDownIcon
                            className={`${open ? "" : "text-opacity-70"}
                  ml-2 h-5 w-5 text-indigo-300 transition duration-150 ease-in-out group-hover:text-opacity-80`}
                            aria-hidden="true"
                          />
                        </Popover.Button>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-200"
                          enterFrom="opacity-0 translate-y-1"
                          enterTo="opacity-100 translate-y-0"
                          leave="transition ease-in duration-150"
                          leaveFrom="opacity-100 translate-y-0"
                          leaveTo="opacity-0 translate-y-1"
                        >
                          <Popover.Panel className="absolute right-0 z-10 mt-3 px-4 sm:px-0">
                            <article className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                              <form className="bg-white p-7">
                                <div className="mb-6">
                                  <p className="mb-4 text-xs text-gray-500 uppercase">
                                    Filter by review count
                                  </p>
                                  <fieldset className="flex gap-2">
                                    <legend className="sr-only">
                                      Review Count
                                    </legend>
                                    <Input
                                      id="minReview"
                                      type="text"
                                      label="Min Reviews"
                                      placeholder="1"
                                      defaultValue={getDefaultInputValue(
                                        minReviewCount
                                      )}
                                      inputMode="decimal"
                                      onBlur={(e) => {
                                        console.log("blur", e);
                                        setMinReviewCount(
                                          parseFloat(e.currentTarget.value)
                                        );
                                      }}
                                    />
                                    <Input
                                      id="maxReview"
                                      type="text"
                                      label="Max Reviews"
                                      placeholder="100"
                                      defaultValue={getDefaultInputValue(
                                        maxReviewCount
                                      )}
                                      inputMode="decimal"
                                      onBlur={(e) => {
                                        setMaxReviewCount(
                                          parseFloat(e.currentTarget.value)
                                        );
                                      }}
                                    />
                                  </fieldset>
                                </div>
                                <div className="mb-6">
                                  <p className="mb-4 text-xs text-gray-500 uppercase">
                                    Filter by stats
                                  </p>
                                  <div className="flex flex-col gap-6">
                                    <fieldset className="flex gap-2">
                                      <legend className="sr-only">
                                        Rating
                                      </legend>
                                      <Input
                                        id="minRating"
                                        type="text"
                                        label="Min Rating"
                                        placeholder="1"
                                        defaultValue={getDefaultInputValue(
                                          minRating
                                        )}
                                        inputMode="decimal"
                                        onBlur={(e) => {
                                          setMinRating(
                                            parseFloat(e.currentTarget.value)
                                          );
                                        }}
                                      />
                                      <Input
                                        id="maxRating"
                                        type="text"
                                        label="Max Rating"
                                        placeholder="5"
                                        defaultValue={getDefaultInputValue(
                                          maxRating
                                        )}
                                        inputMode="decimal"
                                        onBlur={(e) => {
                                          setMaxRating(
                                            parseFloat(e.currentTarget.value)
                                          );
                                        }}
                                      />
                                    </fieldset>
                                    <fieldset className="flex gap-2">
                                      <legend className="sr-only">
                                        Difficulty
                                      </legend>
                                      <Input
                                        id="minDifficulty"
                                        type="text"
                                        label="Min Difficulty"
                                        placeholder="1"
                                        defaultValue={getDefaultInputValue(
                                          minDifficulty
                                        )}
                                        inputMode="decimal"
                                        onBlur={(e) => {
                                          setMinDifficulty(
                                            parseFloat(e.currentTarget.value)
                                          );
                                        }}
                                      />
                                      <Input
                                        id="maxDifficulty"
                                        type="number"
                                        label="Max Difficulty"
                                        placeholder="5"
                                        defaultValue={getDefaultInputValue(
                                          maxDifficulty
                                        )}
                                        inputMode="decimal"
                                        onBlur={(e) => {
                                          setMaxDifficulty(
                                            parseFloat(e.currentTarget.value)
                                          );
                                        }}
                                      />
                                    </fieldset>
                                    <fieldset className="flex gap-2">
                                      <legend className="sr-only">
                                        Workload
                                      </legend>
                                      <Input
                                        id="minWorkload"
                                        type="number"
                                        label="Min Workload"
                                        placeholder="10"
                                        defaultValue={getDefaultInputValue(
                                          minWorkload
                                        )}
                                        inputMode="decimal"
                                        onBlur={(e) => {
                                          setMinWorkload(
                                            parseFloat(e.currentTarget.value)
                                          );
                                        }}
                                      />
                                      <Input
                                        id="maxWorkload"
                                        type="number"
                                        label="Max Workload"
                                        placeholder="20"
                                        defaultValue={getDefaultInputValue(
                                          maxWorkload
                                        )}
                                        inputMode="decimal"
                                        onBlur={(e) => {
                                          setMaxWorkload(
                                            parseFloat(e.currentTarget.value)
                                          );
                                        }}
                                      />
                                    </fieldset>
                                  </div>
                                </div>
                              </form>
                            </article>
                          </Popover.Panel>
                        </Transition>
                      </>
                    )}
                  </Popover>
                </div>
              </div>
              <div className="inline-block min-w-full py-4 align-middle">
                <div className="shadow-sm ring-1 ring-black ring-opacity-5">
                  <table
                    className="min-w-full border-separate"
                    style={{ borderSpacing: 0 }}
                  >
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="sticky top-0 border-b border-gray-300 bg-gray-50 bg-opacity-75 px-2 py-2 md:px-3 md:py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
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
                          className="sticky top-0 border-b border-gray-300 bg-gray-50 bg-opacity-75 px-2 py-2 md:px-3 md:py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
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
                          className="sticky top-0 border-b border-gray-300 bg-gray-50 bg-opacity-75 px-2 py-2 md:px-3 md:py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
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
                          className="sticky top-0 border-b border-gray-300 bg-gray-50 bg-opacity-75 px-2 py-2 md:px-3 md:py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
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
                          className="sticky top-0 border-b border-gray-300 bg-gray-50 bg-opacity-75 px-2 py-2 md:px-3 md:py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
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
                      {current.map(
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
      </main>
    </>
  );
};

export default Home;
