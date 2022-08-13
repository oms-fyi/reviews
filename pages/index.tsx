import {
  Fragment, FC, useState, useEffect, useMemo,
} from 'react';

import type { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import { Popover, Transition, Listbox } from '@headlessui/react';
import { ChevronRightIcon, ChevronLeftIcon, SelectorIcon } from '@heroicons/react/solid';
import {
  SearchIcon, FilterIcon, ChevronUpIcon, ChevronDownIcon,
} from '@heroicons/react/outline';

import Fuse from 'fuse.js';

import classNames from 'classnames';

import Input from '../components/Input';

import type { CourseWithReviewsStats, Course, Review } from '../src/@types';
import { CourseEnrichmentOption, getCourses } from '../src/sanity';
import Toggle from '../components/Toggle';
import average from '../src/stats';

import styles from '../styles/Home.module.css';

interface HomePageProps {
  courses: CourseWithReviewsStats[];
}

export const getStaticProps: GetStaticProps<HomePageProps> = async () => {
  const courses = await getCourses(CourseEnrichmentOption.STATS);

  return {
    props: { courses },
  };
};

interface PaginationProps {
  pageSize: number;
  pageNumber: number;
  resultCount: number;
  onPageChange: (nextPage: number) => void;
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
      Array(totalPages)
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
    <div className="bg-white px-4 py-3 flex flex-wrap items-center justify-center border-t border-gray-200 sm:px-6 gap-4">
      <p className="text-sm text-gray-700 md:w-full">
        Showing
        {' '}
        {resultCount ? (
          <>
            <span className="font-medium">{rangeStart + 1}</span>
            {' '}
            to
            {' '}
            <span className="font-medium">{rangeEnd}</span>
            {' '}
            of
            {' '}
          </>
        ) : (
          ''
        )}
        <span className="font-medium">{resultCount}</span>
        {' '}
        courses
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
                  'rounded-l-md': i === 0,
                  '-ml-px': i > 0,
                  'rounded-r-md': i === a.length - 1,
                },
                'relative inline-flex items-center px-2 py-1 sm:px-4 sm:py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500',
                {
                  'z-10 bg-indigo-50 border-indigo-500 text-indigo-600  hover:bg-indigo-50':
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
          className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
          aria-label="Pagination"
        >
          <button
            {...(hasPrevPage ? {} : { disabled: true })}
            type="button"
            onClick={decrementPageNumber}
            className="relative inline-flex items-center px-2 py-1 sm:px-4 sm:py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:text-gray-300 disabled:hover:bg-white"
          >
            <span className="sr-only">Previous</span>
            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
          </button>
          {paginationChunks.map((chunks, i, a) => chunks
            .map((page) => (
              <button
                type="button"
                key={page}
                {...(page === pageNumber && { 'aria-current': 'page' })}
                onClick={() => onPageChange(page)}
                className={classNames(
                  {
                    'z-10 bg-indigo-50 border-indigo-500 text-indigo-600':
                        page === pageNumber,
                  },
                  'relative inline-flex items-center px-2 py-1 sm:px-4 sm:py-2 border text-sm font-medium',
                )}
              >
                {page + 1}
              </button>
            ))
            .concat(
              i + 1 === a.length
                ? []
                : [
                  <span
                    key="..."
                    className=" relative inline-flex items-center px-2 py-1 sm:px-4 sm:py-2 border bg-white text-sm font-medium text-gray-700"
                  >
                    ...
                  </span>,
                ],
            ))}
          <button
            type="button"
            {...(hasNextPage ? {} : { disabled: true })}
            onClick={incrementPageNumber}
            className="relative inline-flex items-center rounded-r-md px-2 py-1 sm:px-4 sm:py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:text-gray-300 disabled:hover:bg-white"
          >
            <span className="sr-only">Next</span>
            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </nav>
      </div>
    </div>
  );
};

const getDefaultInputValue = (value: number | undefined): string => (typeof value === 'undefined' || Number.isNaN(value) ? '' : value.toString());
const formatPossiblyNaNValue = (value: number): string => (
  Number.isNaN(value) ? 'N/A' : value.toFixed(2)
);

type CourseStats = {
  [code: string]: {
    rating: number;
    difficulty: number;
    workload: number;
  };
};

type SortableField = keyof Pick<Course, 'name'> | keyof Pick<Review, 'rating' | 'difficulty' | 'workload'> | 'reviewCount';
type SortConfig = {
  field: SortableField;
  direction: 'desc' | 'asc'
};

const sortFieldsToLabels: {
  [Property in SortableField]: string;
} = {
  name: 'Name',
  rating: 'Rating',
  difficulty: 'Difficulty',
  workload: 'Workload',
  reviewCount: '# of Reviews',
};

export default function Home({ courses }: HomePageProps): JSX.Element {
  const stats = useMemo<CourseStats>(
    () => courses.reduce(
      (d, { reviews, code }) => ({
        ...d,
        [code]: {
          rating: average(reviews, 'rating'),
          difficulty: average(reviews, 'difficulty'),
          workload: average(reviews, 'workload'),
        },
      }),
      {},
    ),
    [courses],
  );

  const searchIndex = useMemo(
    () => new Fuse(courses, {
      keys: ['name', 'aliases', 'code'],
      threshold: 0.4,
    }),
    [courses],
  );

  const [view, setView] = useState<CourseWithReviewsStats[]>([]);

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
      courses.filter(({
        code, reviews, isDeprecated, isFoundational, notesURL,
      }) => {
        function between(value: number, min: number, max: number): boolean {
          return Number.isNaN(value) ? true : value >= min && value <= max;
        }

        const { rating, difficulty, workload } = stats[code];

        return (
          between(
            reviews.length,
            minReviewCount || 0,
            maxReviewCount || Infinity,
          )
          && between(rating, minRating || 1, maxRating || 5)
          && between(difficulty, minDifficulty || 1, maxDifficulty || 5)
          && between(workload, minWorkload || 1, maxWorkload || 100)
          && (hideDeprecated ? isDeprecated === false : true)
          && (onlyShowFoundational ? isFoundational === true : true)
          && (onlyShowNotes ? Boolean(notesURL) : true)
        );
      }),
    );
  }, [
    courses,
    stats,
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
  const [sorted, setSorted] = useState<CourseWithReviewsStats[]>([]);
  const [sort, setSort] = useState<SortConfig>({
    field: 'reviewCount',
    direction: 'desc',
  });

  useEffect(() => {
    setSorted(
      [...view].sort((a, b) => {
        const comp = ((attribute) => {
          switch (attribute) {
            case 'name':
              return a.name.localeCompare(b.name);
            case 'reviewCount':
              return a.reviews.length - b.reviews.length;
            case 'rating':
              return stats[a.code].rating - stats[b.code].rating;
            case 'difficulty':
              return stats[a.code].difficulty - stats[b.code].difficulty;
            default:
              return stats[a.code].workload - stats[b.code].workload;
          }
        })(sort.field);

        return comp * (sort.direction === 'asc' ? 1 : -1);
      }),
    );
  }, [sort, view, stats]);

  function toggleSort(field: SortableField) {
    if (sort.field !== field) {
      setSort({ field, direction: 'asc' });
    } else {
      setSort({
        field,
        direction: sort.direction === 'asc' ? 'desc' : 'asc',
      });
    }
  }

  // SEARCHING
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState<CourseWithReviewsStats[]>(
    [],
  );

  useEffect(() => {
    if (!searchInput) {
      setSearchResults(sorted);
      return () => {};
    }

    const debounceId = setTimeout(() => {
      const matches = searchIndex.search(searchInput);
      const ids = new Set(matches.map(({ item: { id } }) => id));

      setSearchResults(sorted.filter(({ id }) => ids.has(id)));
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
      <main className="mx-auto sm:max-w-4xl sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="px-4">
          <div className="space-y-2 flex flex-col">
            <div className="flex justify-between items-end gap-2">
              <div>
                <label
                  htmlFor="search"
                  className="block text-sm font-medium text-gray-700"
                >
                  Search courses
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <div className="relative flex items-stretch flex-grow focus-within:z-10">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon
                          className="h-5 w-5 text-gray-400 hidden sm:block"
                          aria-hidden="true"
                        />
                      </div>
                      <input
                        type="text"
                        name="search"
                        id="search"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.currentTarget.value)}
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-none rounded-l-md sm:text-sm sm:pl-10 border-gray-300"
                        placeholder="HPCA"
                      />
                    </div>
                    <Popover className="relative">
                      {({ open }) => (
                        <>
                          <Popover.Button
                            type="button"
                            className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2.5 sm:py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <FilterIcon
                              className="h-5 w-5 text-gray-400"
                              aria-hidden="true"
                            />
                            <span className="sr-only sm:not-sr-only">{open ? 'Done' : 'Filter'}</span>
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
                            <Popover.Panel className="absolute right-0 translate-x-1/2 sm:translate-x-0 z-10 mt-3 px-4 sm:px-0">
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
                                          minReviewCount,
                                        )}
                                        inputMode="decimal"
                                        size={10}
                                        onBlur={(e) => {
                                          setMinReviewCount(
                                            parseFloat(e.currentTarget.value),
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
                                            parseFloat(e.currentTarget.value),
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
                                            minRating,
                                          )}
                                          size={10}
                                          inputMode="decimal"
                                          onBlur={(e) => {
                                            setMinRating(
                                              parseFloat(
                                                e.currentTarget.value,
                                              ),
                                            );
                                          }}
                                        />
                                        <Input
                                          id="maxRating"
                                          type="text"
                                          label="Max Rating"
                                          placeholder="5"
                                          defaultValue={getDefaultInputValue(
                                            maxRating,
                                          )}
                                          size={10}
                                          inputMode="decimal"
                                          onBlur={(e) => {
                                            setMaxRating(
                                              parseFloat(
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
                                              parseFloat(
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
                                              parseFloat(
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
                                              parseFloat(
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
                                              parseFloat(
                                                e.currentTarget.value,
                                              ),
                                            );
                                          }}
                                        />
                                      </fieldset>
                                    </div>
                                  </div>
                                  <div className="mb-6">
                                    <p className="mb-4 text-xs text-gray-500 uppercase">
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
                <Listbox value={sort.field} onChange={(field) => toggleSort(field)}>
                  {({ open }) => (
                    <>
                      <Listbox.Label className="block text-sm font-medium text-gray-700">Sort by</Listbox.Label>
                      <div className="mt-1 relative">
                        <Listbox.Button className="bg-white relative w-full border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                          <div className="flex gap-1 items-center">
                            <span className="block truncate">{sortFieldsToLabels[sort.field]}</span>
                            {sort.direction === 'asc' ? <ChevronUpIcon className="h-5 w-5" aria-hidden="true" /> : <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />}
                          </div>
                          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                          </span>
                        </Listbox.Button>

                        <Transition
                          show={open}
                          as={Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <Listbox.Options className="absolute right-0 z-10 mt-1 w-40 bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                            {Object.entries(sortFieldsToLabels).map(([field, label]) => (
                              <Listbox.Option
                                key={field}
                                className={({ active }) => classNames({
                                  'text-white bg-indigo-600': active,
                                  'text-gray-900': !active,
                                }, 'cursor-default select-none relative py-2 pl-3 pr-9')}
                                value={field}
                              >
                                {({ selected }) => (
                                  <span className={classNames({
                                    'font-semibold': selected,
                                    'font-normal': !selected,
                                  }, 'block truncate')}
                                  >
                                    {label}
                                  </span>
                                )}
                              </Listbox.Option>
                            ))}
                          </Listbox.Options>
                        </Transition>
                      </div>
                    </>
                  )}
                </Listbox>
              </div>
            </div>
            <div className="shadow ring-1 overflow-hidden ring-black ring-opacity-5 md:mx-0 md:rounded-lg">
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
                        className="hidden md:table-cell border-b border-gray-300 bg-gray-50 bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                      >
                        Code
                      </th>
                      <th
                        scope="col"
                        className="hidden sm:table-cell border-b border-gray-300 bg-gray-50 bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                      >
                        Rating
                      </th>
                      <th
                        scope="col"
                        className="hidden sm:table-cell border-b border-gray-300 bg-gray-50 bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                      >
                        Difficulty
                      </th>
                      <th
                        scope="col"
                        className="hidden sm:table-cell border-b border-gray-300 bg-gray-50 bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                      >
                        Workload
                      </th>
                      <th
                        scope="col"
                        className="hidden md:table-cell border-b border-gray-300 bg-gray-50 bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                      >
                        Reviews
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {page.map(({
                      id, code, name, reviews, officialURL, notesURL,
                    }, index) => (
                      <tr
                        key={id}
                        className={index % 2 === 0 ? undefined : 'bg-gray-50'}
                      >
                        <td className="px-2 py-2 px-3 py-4 text-sm text-gray-700 sm:pl-6">
                          <dl className="font-normal">
                            <dt className="sr-only">Course name</dt>
                            <dd className="inline">
                              <span className="w-72 whitespace-nowrap truncate block">
                                <span className="block text-xs md:hidden mr-2 text-gray-500">{code}</span>
                                <span className=" text-base">{name}</span>
                              </span>
                            </dd>
                            <div className="block sm:hidden">
                              <div className={`flex flex-row gap-1 ${styles['dot-separated-list']}`}>
                                <dt className="sr-only">Rating</dt>
                                <dd>
                                  {formatPossiblyNaNValue(stats[code].rating)}
                                  <span className="text-gray-400"> / 5 rating</span>
                                </dd>
                                <dt className="sr-only">Difficulty</dt>
                                <dd>
                                  {formatPossiblyNaNValue(stats[code].difficulty)}
                                  <span className="text-gray-400"> / 5 difficulty</span>
                                </dd>
                              </div>
                              <dt className="sr-only">Workload</dt>
                              <dd>
                                {formatPossiblyNaNValue(stats[code].workload)}
                                <span className="text-gray-400"> hours of work per week</span>
                              </dd>
                            </div>
                            <div className={`flex flex-row gap-1 ${styles['dot-separated-list']}`}>
                              <dt className="sr-only">Reviews URL</dt>
                              <dd>
                                <Link
                                  href={`/courses/${code}/reviews`}
                                  passHref
                                >
                                  <a
                                    href="replace"
                                    className="text-indigo-600 text-sm hover:text-indigo-900"
                                  >
                                    Reviews
                                  </a>
                                </Link>
                                {' '}
                                <span className="md:hidden">
                                  (
                                  {reviews.length}
                                  )
                                </span>
                              </dd>
                              {officialURL && (
                                <>
                                  <dt className="sr-only">GATech URL</dt>
                                  <dd><a href={officialURL} target="_blank" rel="noreferrer" className="text-indigo-600 text-sm hover:text-indigo-900">GT Official</a></dd>
                                </>
                              )}
                              {notesURL && (
                                <>
                                  <dt className="sr-only">OMSCSNotes URL</dt>
                                  <dd><a href={notesURL} target="_blank" rel="noreferrer" className="text-indigo-600 text-sm hover:text-indigo-900">Lecture Notes</a></dd>
                                </>
                              ) }
                            </div>
                          </dl>
                        </td>
                        <td className="hidden md:table-cell whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                          {code}
                        </td>
                        <td className="hidden sm:table-cell whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                          {formatPossiblyNaNValue(stats[code].rating)}
                        </td>
                        <td className="hidden sm:table-cell whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                          {formatPossiblyNaNValue(stats[code].difficulty)}
                        </td>
                        <td className="hidden sm:table-cell whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                          {formatPossiblyNaNValue(stats[code].workload)}
                        </td>
                        <td className="hidden md:table-cell whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                          {reviews.length}
                        </td>
                      </tr>
                    ))}
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
