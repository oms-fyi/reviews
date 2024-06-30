import { Listbox, Popover, Transition } from "@headlessui/react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  FilterIcon,
  InformationCircleIcon,
  SearchIcon,
} from "@heroicons/react/outline";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SelectorIcon,
} from "@heroicons/react/solid";
import classNames from "classnames";
import Fuse from "fuse.js";
import { ObjectId } from "mongodb";
import type { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { FC, Fragment, useEffect, useMemo, useState } from "react";

import type { Course, Review } from "src/@types";
import { Input } from "src/components/input";
import { Toggle } from "src/components/toggle";
import { connectToDatabase } from "src/lib/mongodb";
import { formatNumber } from "src/util";

type CourseWithStats = Course & {
  rating?: number;
  difficulty?: number;
  workload?: number;
  reviewCount: number;
};

interface HomePageProps {
  courses: CourseWithStats[];
}

export const getStaticProps: GetStaticProps<HomePageProps> = async () => {
  const { db } = await connectToDatabase();

  let apiResponse = await db.collection("courses").find({}).toArray();

  const courses: CourseWithStats[] = await Promise.all(
    apiResponse.map(async (course) => {
      let resultCourse = (await JSON.parse(
        JSON.stringify(course),
      )) as CourseWithStats;
      const reviews = await JSON.parse(
        JSON.stringify(
          await db
            .collection("reviews")
            .find({ courseId: new ObjectId(course._id) })
            .toArray(),
        ),
      );

      const rating = average(reviews, "rating");
      const difficulty = average(reviews, "difficulty");
      const workload = average(reviews, "workload");

      if (rating) resultCourse.rating = rating;
      if (difficulty) resultCourse.difficulty = difficulty;
      if (workload) resultCourse.workload = workload;
      resultCourse.reviewCount = reviews.length;

      return resultCourse;
    }),
  );

  return { props: { courses } };
};

interface PaginationProps {
  pageSize: number;
  pageNumber: number;
  resultCount: number;
  // eslint-disable-next-line no-unused-vars
  onPageChange: (nextPage: number) => void;
  // eslint-disable-next-line no-unused-vars
  onPageSizeChange: (nextPageSize: number) => void;
  pageSizes: number[];
}

const Pagination: FC<PaginationProps> = function Pagination({
  pageSize,
  pageNumber,
  resultCount,
  onPageChange,
  onPageSizeChange,
  pageSizes,
}) {
  const rangeStart = pageNumber * pageSize;
  const rangeEnd = Math.min(rangeStart + pageSize, resultCount);

  const hasNextPage = rangeStart + pageSize - 1 <= resultCount;
  const hasPrevPage = pageNumber !== 0;

  function incrementPageNumber(): void {
    if (hasNextPage) onPageChange(pageNumber + 1);
  }
  function decrementPageNumber(): void {
    if (hasPrevPage) onPageChange(pageNumber - 1);
  }

  function changePageSize(nextPageSize: number): void {
    onPageSizeChange(nextPageSize);
  }

  let paginationChunks: number[][];

  const totalPages = Math.ceil(resultCount / pageSize);

  if (totalPages <= 7) {
    paginationChunks = [
      Array.from({ length: totalPages })
        .fill(0)
        .map((_, i) => i),
    ];
  } else if (pageNumber <= 3) {
    paginationChunks = [[0, 1, 2, 3, 4], [totalPages - 1]];
  } else if (totalPages - pageNumber <= 4) {
    paginationChunks = [[0], [5, 4, 3, 2, 1].map((v) => totalPages - v)];
  } else {
    paginationChunks = [
      [0],
      [pageNumber - 1, pageNumber, pageNumber + 1],
      [totalPages - 1],
    ];
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <p className="text-sm text-gray-700 md:w-full">
        Showing{" "}
        {resultCount ? (
          <>
            <span className="font-medium">{rangeStart + 1}</span> to{" "}
            <span className="font-medium">{rangeEnd}</span> of{" "}
          </>
        ) : (
          ""
        )}
        <span className="font-medium">{resultCount}</span> courses
      </p>
      <div className="md:grow">
        <span className="relative z-0 inline-flex items-center rounded-md">
          {pageSizes.map((size, i, a) => (
            <button
              key={size}
              type="button"
              onClick={() => size !== pageSize && changePageSize(size)}
              className={classNames(
                {
                  "rounded-l-md": i === 0,
                  "-ml-px": i > 0,
                  "rounded-r-md": i === a.length - 1,
                },
                "relative inline-flex items-center border border-gray-300 bg-white px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:px-4 sm:py-2",
                {
                  "z-10 border-indigo-500 bg-indigo-50 text-indigo-600  hover:bg-indigo-50":
                    size === pageSize,
                },
              )}
            >
              {size}
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-700">courses per page</span>
        </span>
      </div>
      <div>
        <nav
          className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm"
          aria-label="Pagination"
        >
          <button
            {...(hasPrevPage ? {} : { disabled: true })}
            type="button"
            onClick={decrementPageNumber}
            className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-1 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:text-gray-300 disabled:hover:bg-white sm:px-4 sm:py-2"
          >
            <span className="sr-only">Previous</span>
            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
          </button>
          {paginationChunks.map((chunks, i, a) => [
            ...chunks.map((page) => (
              <button
                type="button"
                key={page}
                {...(page === pageNumber && { "aria-current": "page" })}
                onClick={() => onPageChange(page)}
                className={classNames(
                  {
                    "z-10 border-indigo-500 bg-indigo-50 text-indigo-600":
                      page === pageNumber,
                  },
                  "relative inline-flex items-center border px-2 py-1 text-sm font-medium sm:px-4 sm:py-2",
                )}
              >
                {page + 1}
              </button>
            )),
            ...(i + 1 === a.length
              ? []
              : [
                  <span
                    key="..."
                    className=" relative inline-flex items-center border bg-white px-2 py-1 text-sm font-medium text-gray-700 sm:px-4 sm:py-2"
                  >
                    ...
                  </span>,
                ]),
          ])}
          <button
            type="button"
            {...(hasNextPage ? {} : { disabled: true })}
            onClick={incrementPageNumber}
            className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-1 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:text-gray-300 disabled:hover:bg-white sm:px-4 sm:py-2"
          >
            <span className="sr-only">Next</span>
            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </nav>
      </div>
    </div>
  );
};

// MAY RETURN NaN
function average(
  reviews: Pick<Review, "rating" | "difficulty" | "workload">[],
  key: keyof Pick<Review, "rating" | "difficulty" | "workload">,
): number {
  let sum = 0;
  let count = 0;

  reviews.forEach((review) => {
    const value = review[key];
    if (value) {
      count += 1;
      sum += value;
    }
  });

  return sum / count;
}

const getDefaultInputValue = (value: number | undefined): string =>
  value === undefined || Number.isNaN(value) ? "" : value.toString();

function between(value: number | undefined, min: number, max: number): boolean {
  return value === undefined ? true : value >= min && value <= max;
}

type SortableField =
  | keyof Pick<Course, "name">
  | keyof Pick<Review, "rating" | "difficulty" | "workload">
  | "reviewCount";
type SortConfig = {
  field: SortableField;
  direction: "desc" | "asc";
};

const sortFieldsToLabels: {
  // eslint-disable-next-line no-unused-vars
  [Property in SortableField]: string;
} = {
  name: "Name",
  rating: "Rating",
  difficulty: "Difficulty",
  workload: "Workload",
  reviewCount: "# of Reviews",
};

export default function Home({ courses }: HomePageProps): JSX.Element {
  const searchIndex = useMemo(
    () =>
      new Fuse(courses, {
        keys: ["name", "tags", "codes"],
        threshold: 0.4,
      }),
    [courses],
  );

  const [view, setView] = useState<CourseWithStats[]>([]);

  // FILTERING
  // By default only show courses with 1+ review
  const [minReviewCount, setMinReviewCount] = useState<number>(1);
  const [maxReviewCount, setMaxReviewCount] = useState<number>();

  const [minRating, setMinRating] = useState<number>();
  const [maxRating, setMaxRating] = useState<number>();

  const [minDifficulty, setMinDifficulty] = useState<number>();
  const [maxDifficulty, setMaxDifficulty] = useState<number>();

  const [minWorkload, setMinWorkload] = useState<number>();
  const [maxWorkload, setMaxWorkload] = useState<number>();

  const [hideDeprecated, setHideDeprecated] = useState(false);
  const [onlyShowFoundational, setOnlyShowFoundational] = useState(false);
  const [onlyShowNotes, setOnlyShowNotes] = useState(false);

  useEffect(() => {
    setView(
      courses.filter(
        ({
          isDeprecated,
          isFoundational,
          notesURL,
          rating,
          difficulty,
          workload,
          reviewCount,
        }) =>
          between(
            reviewCount,
            minReviewCount || 0,
            maxReviewCount || Number.POSITIVE_INFINITY,
          ) &&
          between(rating, minRating || 1, maxRating || 10) &&
          between(difficulty, minDifficulty || 1, maxDifficulty || 10) &&
          between(workload, minWorkload || 1, maxWorkload || 100) &&
          (hideDeprecated ? isDeprecated === false : true) &&
          (onlyShowFoundational ? isFoundational === true : true) &&
          (onlyShowNotes ? Boolean(notesURL) : true),
      ),
    );
  }, [
    courses,
    minReviewCount,
    maxReviewCount,
    minRating,
    maxRating,
    minDifficulty,
    maxDifficulty,
    minWorkload,
    maxWorkload,
    onlyShowFoundational,
    hideDeprecated,
    onlyShowNotes,
  ]);

  // SORTING
  const [sorted, setSorted] = useState<CourseWithStats[]>([]);
  const [sort, setSort] = useState<SortConfig>({
    field: "reviewCount",
    direction: "desc",
  });

  useEffect(() => {
    setSorted(
      [...view].sort((a, b) => {
        const { direction, field } = sort;
        const mult = direction === "asc" ? 1 : -1;

        switch (field) {
          case "name": {
            return a.name.localeCompare(b.name) * mult;
          }
          case "reviewCount": {
            return (a.reviewCount - b.reviewCount) * mult;
          }
          case "rating":
          case "difficulty":
          case "workload": {
            if (a[field] === undefined) return 1;
            if (b[field] === undefined) return -1;

            return ((a[field] as number) - (b[field] as number)) * mult;
          }
          default: {
            throw new Error("Unknown sort option!");
          }
        }
      }),
    );
  }, [sort, view]);

  function toggleSort(field: SortableField) {
    if (sort.field === field) {
      setSort({
        field,
        direction: sort.direction === "asc" ? "desc" : "asc",
      });
    } else {
      setSort({ field, direction: "asc" });
    }
  }

  // SEARCHING
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<CourseWithStats[]>([]);

  useEffect(() => {
    if (!searchInput) {
      setSearchResults(sorted);
      return () => {};
    }

    const debounceId = setTimeout(() => {
      const matches = searchIndex.search(searchInput);
      const ids = new Set(matches.map(({ item: { _id } }) => _id));

      setSearchResults(sorted.filter(({ _id }) => ids.has(_id)));
    }, 500);

    return function cleanup() {
      clearTimeout(debounceId);
    };
  }, [searchInput, searchIndex, searchResults, sorted]);

  const collection = searchResults;

  // PAGINATION
  const [pageSize, setPageSize] = useState(10);
  const [pageNumber, setPageNumber] = useState(0);

  useEffect(() => {
    if (pageSize * pageNumber >= collection.length) {
      setPageNumber(Math.floor(collection.length / pageSize));
    }
  }, [pageNumber, pageSize, collection]);

  const page = collection.slice(
    pageNumber * pageSize,
    pageNumber * pageSize + pageSize,
  );

  return (
    <>
      <Head>
        <title>Home | OMSCentral</title>
      </Head>
      <main className="mx-auto py-6 sm:max-w-6xl sm:px-6 sm:py-10 lg:px-8">
        <div className="px-4">
          <div className="flex flex-col space-y-2">
            <div className="flex items-end justify-between gap-2">
              <div>
                <label
                  htmlFor="search"
                  className="block text-sm font-medium text-gray-700"
                >
                  Search courses
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <div className="relative flex flex-grow items-stretch focus-within:z-10">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <SearchIcon
                          className="hidden h-5 w-5 text-gray-400 sm:block"
                          aria-hidden="true"
                        />
                      </div>
                      <input
                        type="text"
                        name="search"
                        id="search"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.currentTarget.value)}
                        className="block w-full min-w-0 rounded-none rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:pl-10 sm:text-sm"
                        placeholder="HPCA"
                      />
                    </div>
                    <Popover className="relative">
                      {({ open }) => (
                        <>
                          <Popover.Button
                            type="button"
                            className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:py-2"
                          >
                            <FilterIcon
                              className="h-5 w-5 text-gray-400"
                              aria-hidden="true"
                            />
                            <span className="sr-only sm:not-sr-only">
                              {open ? "Done" : "Filter"}
                            </span>
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
                            <Popover.Panel className="absolute right-0 z-10 mt-3 translate-x-1/2 px-4 sm:translate-x-0 sm:px-0">
                              <article className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                                <form className="bg-white p-7">
                                  <div className="mb-6">
                                    <p className="mb-4 text-xs uppercase text-gray-500">
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
                                          minReviewCount,
                                        )}
                                        inputMode="decimal"
                                        size={10}
                                        onBlur={(e) => {
                                          setMinReviewCount(
                                            Number.parseFloat(
                                              e.currentTarget.value,
                                            ),
                                          );
                                        }}
                                      />
                                      <Input
                                        id="maxReview"
                                        type="text"
                                        label="Max Reviews"
                                        placeholder="100"
                                        size={10}
                                        defaultValue={getDefaultInputValue(
                                          maxReviewCount,
                                        )}
                                        inputMode="decimal"
                                        onBlur={(e) => {
                                          setMaxReviewCount(
                                            Number.parseFloat(
                                              e.currentTarget.value,
                                            ),
                                          );
                                        }}
                                      />
                                    </fieldset>
                                  </div>
                                  <div className="mb-6">
                                    <p className="mb-4 text-xs uppercase text-gray-500">
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
                                            minRating,
                                          )}
                                          size={10}
                                          inputMode="decimal"
                                          onBlur={(e) => {
                                            setMinRating(
                                              Number.parseFloat(
                                                e.currentTarget.value,
                                              ),
                                            );
                                          }}
                                        />
                                        <Input
                                          id="maxRating"
                                          type="text"
                                          label="Max Rating"
                                          placeholder="10"
                                          defaultValue={getDefaultInputValue(
                                            maxRating,
                                          )}
                                          size={10}
                                          inputMode="decimal"
                                          onBlur={(e) => {
                                            setMaxRating(
                                              Number.parseFloat(
                                                e.currentTarget.value,
                                              ),
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
                                            minDifficulty,
                                          )}
                                          size={10}
                                          inputMode="decimal"
                                          onBlur={(e) => {
                                            setMinDifficulty(
                                              Number.parseFloat(
                                                e.currentTarget.value,
                                              ),
                                            );
                                          }}
                                        />
                                        <Input
                                          id="maxDifficulty"
                                          type="text"
                                          label="Max Difficulty"
                                          placeholder="5"
                                          defaultValue={getDefaultInputValue(
                                            maxDifficulty,
                                          )}
                                          size={10}
                                          inputMode="decimal"
                                          onBlur={(e) => {
                                            setMaxDifficulty(
                                              Number.parseFloat(
                                                e.currentTarget.value,
                                              ),
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
                                          type="text"
                                          label="Min Workload"
                                          placeholder="10"
                                          defaultValue={getDefaultInputValue(
                                            minWorkload,
                                          )}
                                          size={10}
                                          inputMode="decimal"
                                          onBlur={(e) => {
                                            setMinWorkload(
                                              Number.parseFloat(
                                                e.currentTarget.value,
                                              ),
                                            );
                                          }}
                                        />
                                        <Input
                                          id="maxWorkload"
                                          type="text"
                                          label="Max Workload"
                                          placeholder="20"
                                          defaultValue={getDefaultInputValue(
                                            maxWorkload,
                                          )}
                                          size={10}
                                          inputMode="decimal"
                                          onBlur={(e) => {
                                            setMaxWorkload(
                                              Number.parseFloat(
                                                e.currentTarget.value,
                                              ),
                                            );
                                          }}
                                        />
                                      </fieldset>
                                    </div>
                                  </div>
                                  <div className="mb-6">
                                    <p className="mb-4 text-xs uppercase text-gray-500">
                                      Other Filters
                                    </p>
                                    <div className="flex flex-col gap-6">
                                      <Toggle
                                        enabled={onlyShowNotes}
                                        onChange={setOnlyShowNotes}
                                        label="Has lecture notes"
                                      />
                                      <Toggle
                                        enabled={onlyShowFoundational}
                                        onChange={setOnlyShowFoundational}
                                        label="Foundational only"
                                      />
                                      <Toggle
                                        enabled={hideDeprecated}
                                        onChange={setHideDeprecated}
                                        label="Hide deprecated"
                                      />
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
                </label>
              </div>
              <div>
                <Listbox
                  value={sort.field}
                  onChange={(field) => toggleSort(field)}
                >
                  {({ open }) => (
                    <>
                      <Listbox.Label className="block text-sm font-medium text-gray-700">
                        Sort by
                      </Listbox.Label>
                      <div className="relative mt-1">
                        <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
                          <div className="flex items-center gap-1">
                            <span className="block truncate">
                              {sortFieldsToLabels[sort.field]}
                            </span>
                            {sort.direction === "asc" ? (
                              <ChevronUpIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            ) : (
                              <ChevronDownIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            )}
                          </div>
                          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <SelectorIcon
                              className="h-5 w-5 text-gray-400"
                              aria-hidden="true"
                            />
                          </span>
                        </Listbox.Button>

                        <Transition
                          show={open}
                          as={Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <Listbox.Options className="absolute right-0 z-10 mt-1 max-h-60 w-40 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                            {Object.entries(sortFieldsToLabels).map(
                              ([field, label]) => (
                                <Listbox.Option
                                  key={field}
                                  className={({ active }) =>
                                    classNames(
                                      {
                                        "bg-indigo-600 text-white": active,
                                        "text-gray-900": !active,
                                      },
                                      "relative cursor-default select-none py-2 pl-3 pr-9",
                                    )
                                  }
                                  value={field}
                                >
                                  {({ selected }) => (
                                    <span
                                      className={classNames(
                                        {
                                          "font-semibold": selected,
                                          "font-normal": !selected,
                                        },
                                        "block truncate",
                                      )}
                                    >
                                      {label}
                                    </span>
                                  )}
                                </Listbox.Option>
                              ),
                            )}
                          </Listbox.Options>
                        </Transition>
                      </div>
                    </>
                  )}
                </Listbox>
              </div>
            </div>
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:mx-0 md:rounded-lg">
              <div className="overflow-scroll">
                <table
                  className="min-w-full border-separate"
                  style={{ borderSpacing: 0 }}
                >
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="border-b border-gray-300 bg-gray-50 bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                      >
                        Course
                      </th>
                      <th
                        scope="col"
                        className="hidden border-b border-gray-300 bg-gray-50 bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter md:table-cell"
                      >
                        <span className="flex">
                          Code(s)
                          <Popover className="relative">
                            <>
                              <Popover.Button type="button">
                                <InformationCircleIcon className="h-4 w-4 text-indigo-600" />
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
                                <Popover.Panel className="absolute right-0 z-10 mt-3 w-80 translate-x-1/2 px-0">
                                  <article className="rounded-lg bg-white px-4 py-2 font-normal shadow-lg ring-1 ring-black ring-opacity-5">
                                    Multiple departments may <b>crosslist</b> a
                                    single course so that students with distinct
                                    degree requirements can enroll. Please
                                    register with the department that best fits
                                    your needs.
                                  </article>
                                </Popover.Panel>
                              </Transition>
                            </>
                          </Popover>
                        </span>
                      </th>
                      <th
                        scope="col"
                        className="hidden border-b border-gray-300 bg-gray-50 bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:table-cell"
                      >
                        Rating
                      </th>
                      <th
                        scope="col"
                        className="hidden border-b border-gray-300 bg-gray-50 bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:table-cell"
                      >
                        Difficulty
                      </th>
                      <th
                        scope="col"
                        className="hidden border-b border-gray-300 bg-gray-50 bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:table-cell"
                      >
                        Workload
                      </th>
                      <th
                        scope="col"
                        className="hidden border-b border-gray-300 bg-gray-50 bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter md:table-cell"
                      >
                        Reviews
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {page.map(
                      (
                        {
                          _id,
                          slug,
                          codes,
                          name,
                          officialURL,
                          notesURL,
                          rating,
                          difficulty,
                          workload,
                          reviewCount,
                        },
                        index,
                      ) => (
                        <tr
                          key={_id}
                          className={index % 2 === 0 ? undefined : "bg-gray-50"}
                        >
                          <td className="px-3 py-4 text-sm text-gray-700 sm:pl-6">
                            <dl className="font-normal">
                              <dt className="sr-only">Course name</dt>
                              <dd className="inline">
                                <span className="block w-72 truncate whitespace-nowrap lg:w-96">
                                  <span className="mr-2 block text-xs text-gray-500 md:hidden">
                                    {codes.join(" / ")}
                                  </span>
                                  <span className=" text-base">{name}</span>
                                </span>
                              </dd>
                              <div className="block sm:hidden">
                                <div className="flex flex-row gap-1">
                                  <dt className="sr-only">Rating</dt>
                                  <dd>
                                    {formatNumber(rating)}
                                    <span className="text-gray-400">
                                      {" "}
                                      / 5 rating
                                    </span>
                                  </dd>
                                  <dt className="sr-only">Difficulty</dt>
                                  <dd className="before:mr-1 before:content-['\b7']">
                                    {formatNumber(difficulty)}
                                    <span className="text-gray-400">
                                      {" "}
                                      / 5 difficulty
                                    </span>
                                  </dd>
                                </div>
                                <dt className="sr-only">Workload</dt>
                                <dd>
                                  {formatNumber(workload)}
                                  <span className="text-gray-400">
                                    {" "}
                                    hours of work per week
                                  </span>
                                </dd>
                              </div>
                              <div className="flex flex-row gap-1">
                                <dt className="sr-only">Reviews URL</dt>
                                <dd>
                                  <Link
                                    href={`/courses/${slug}/reviews`}
                                    className="text-sm text-indigo-600 hover:text-indigo-900"
                                  >
                                    Reviews
                                  </Link>{" "}
                                  <span className="md:hidden">
                                    ({reviewCount})
                                  </span>
                                </dd>
                                {officialURL && (
                                  <>
                                    <dt className="sr-only">GATech URL</dt>
                                    <dd className="before:mr-1 before:content-['\b7']">
                                      <a
                                        href={officialURL}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sm text-indigo-600 hover:text-indigo-900"
                                      >
                                        GT Official
                                      </a>
                                    </dd>
                                  </>
                                )}
                                {notesURL && (
                                  <>
                                    <dt className="sr-only">OMSCSNotes URL</dt>
                                    <dd className="before:mr-1 before:content-['\b7']">
                                      <a
                                        href={notesURL}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sm text-indigo-600 hover:text-indigo-900"
                                      >
                                        Lecture Notes
                                      </a>
                                    </dd>
                                  </>
                                )}
                              </div>
                            </dl>
                          </td>
                          <td className="hidden whitespace-nowrap px-3 py-4 text-sm text-gray-700 md:table-cell">
                            {codes.map((code) => (
                              <>
                                {code}
                                <br />
                              </>
                            ))}
                          </td>
                          <td className="hidden whitespace-nowrap px-3 py-4 text-sm text-gray-700 sm:table-cell">
                            {formatNumber(rating)}
                          </td>
                          <td className="hidden whitespace-nowrap px-3 py-4 text-sm text-gray-700 sm:table-cell">
                            {formatNumber(difficulty)}
                          </td>
                          <td className="hidden whitespace-nowrap px-3 py-4 text-sm text-gray-700 sm:table-cell">
                            {formatNumber(workload)}
                          </td>
                          <td className="hidden whitespace-nowrap px-3 py-4 text-sm text-gray-700 md:table-cell">
                            {reviewCount}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination
                resultCount={collection.length}
                pageSize={pageSize}
                pageNumber={pageNumber}
                onPageChange={setPageNumber}
                onPageSizeChange={setPageSize}
                pageSizes={[10, 25, 50]}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
