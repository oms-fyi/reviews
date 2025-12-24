"use client";

import { Combobox, Dialog, Transition } from "@headlessui/react";
import { CheckIcon, SelectorIcon } from "@heroicons/react/solid";
import classNames from "classnames";
import type { GetStaticProps, Metadata } from "next";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Fragment, useEffect, useMemo, useState } from "react";

import { Alert } from "src/components/alert";
import { sanityClient } from "src/sanity/client";
import { Course, Review, Semester } from "src/types";

export interface NewReviewFormProps {
  courses: Pick<Course, "id" | "slug" | "name">[];
  semesters: Semester[];
}

type RequestState = {
  status: "init" | "pending" | "complete";
  errors?: string[];
};

export const getStaticProps: GetStaticProps<NewReviewFormProps> = async () => {
  const query = `{ 
    "courses": *[_type == 'course'] {
      "id": _id,
      "slug": slug.current,
      name
    } | order(name),
    "semesters" : *[_type == 'semester' && startDate <= now()]{
    "id": _id,
    ...
    } | order(startDate desc)[0...$limit]
  }`;

  const { courses, semesters } = await sanityClient.fetch<NewReviewFormProps>(
    query,
    {
      limit: 3,
    },
  );

  return { props: { courses, semesters } };
};

export const metadata: Metadata = {
  title: "Add review | OMSCentral",
};

export default function NewReviewForm({
  courses,
  semesters,
}: NewReviewFormProps): JSX.Element {
  const params = useSearchParams();

  const [query, setQuery] = useState("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const [courseId, setCourseId] = useState<Course["id"]>("");
  const [semesterId, setSemesterId] = useState<Semester["id"]>("");
  const [rating, setRating] = useState<NonNullable<Review["rating"]>>();
  const [difficulty, setDifficulty] =
    useState<NonNullable<Review["difficulty"]>>();
  const [workload, setWorkload] = useState<NonNullable<Review["workload"]>>();
  const [body, setBody] = useState<Review["body"]>("");
  const [username, setUsername] = useState<string>("");
  const [code, setCode] = useState<string>("");

  const [codeRequestState, setCodeRequestState] = useState<RequestState>({
    status: "init",
  });
  const [reviewRequestState, setReviewRequestState] = useState<RequestState>({
    status: "init",
  });

  const selectedCourse = useMemo<(typeof courses)[0] | undefined>(
    () => courses.find(({ id }) => id === courseId),
    [courseId, courses],
  );

  useEffect(() => {
    const courseSlug = params.get("course");

    if (typeof courseSlug === "string") {
      setCourseId(
        courses.find((course) => course.slug === courseSlug)?.id ?? "",
      );
    }
  }, [params, courses]);

  useEffect(() => {
    if (reviewRequestState.status === "complete" && reviewRequestState.errors) {
      window.scroll({ top: 0, behavior: "smooth" });
    }
  }, [reviewRequestState]);

  const filteredCourses = useMemo(
    () =>
      query === ""
        ? courses
        : courses.filter((course) =>
            course.name.toLowerCase().includes(query.toLowerCase()),
          ),
    [query, courses],
  );

  function onDismissSendCodeAlert() {
    setCodeRequestState({ status: "init" });
  }

  function onDismissCreateReviewAlert() {
    setReviewRequestState({ status: "init" });
  }

  function closeSuccessModal() {
    setCourseId("");
    setSemesterId("");
    setRating(undefined);
    setDifficulty(undefined);
    setWorkload(undefined);
    setBody("");
    setUsername("");
    setCode("");

    setIsSuccessModalOpen(false);
  }

  async function sendCode() {
    if (!username) {
      return;
    }

    setCodeRequestState({ status: "pending" });

    try {
      const response = await fetch("/api/verifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      const { error } = (await response.json()) as { error?: string };

      if (error) {
        setCodeRequestState({ status: "complete", errors: [error] });
      } else {
        setCodeRequestState({ status: "complete" });
      }
    } catch {
      setCodeRequestState({
        status: "complete",
        errors: ["Something went wrong. Please try again."],
      });
    }
  }

  async function createReview(e: FormEvent) {
    e.preventDefault();

    setReviewRequestState({ status: "pending" });

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        body: JSON.stringify({
          courseId,
          semesterId,
          rating,
          difficulty,
          workload,
          body,
          username,
          code,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const { errors } = (await response.json()) as { errors?: string[] };

      if (!errors) {
        setIsSuccessModalOpen(true);
      }

      setReviewRequestState({ status: "complete", errors });
    } catch {
      setCodeRequestState({
        status: "complete",
        errors: ["Something went wrong. Please try again."],
      });
    }
  }

  return (
    <section className="mx-auto mt-10 max-w-2xl bg-white px-5 py-10 sm:px-20">
      <div className="space-y-8 divide-y divide-gray-200">
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1" aria-live="polite">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
              Add A Review
            </h1>
            <div className="text-sm font-medium">
              {reviewRequestState.status === "complete" &&
                reviewRequestState.errors && (
                  <div className="-mb-4">
                    <Alert
                      variant="failure"
                      onDismiss={() => onDismissCreateReviewAlert()}
                    >
                      {reviewRequestState.errors.length > 1 ? (
                        <>
                          <span>Please fix the following errors:</span>
                          <ul className="list-inside list-disc">
                            {reviewRequestState.errors.map((err) => (
                              <li key={err}>{err}</li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        <p>{reviewRequestState.errors[0]}</p>
                      )}
                    </Alert>
                  </div>
                )}
            </div>
          </div>
        </div>
        <form
          onSubmit={(e) => {
            createReview(e).catch(() => {});
          }}
          className="space-y-8 divide-y divide-gray-200"
        >
          <div className="pt-8">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Course
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Let&apos;s start with some information about the course want to
              review.
            </p>
            <Combobox
              as="div"
              className="mt-6"
              value={courseId}
              onChange={(value) => setCourseId(value ?? '')}
            >
              <Combobox.Label className="block text-sm font-medium text-gray-700">
                Course Name
              </Combobox.Label>
              <div className="relative mt-1">
                <Combobox.Input
                  required
                  className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                  onChange={(event) => setQuery(event.target.value)}
                  displayValue={() => selectedCourse?.name ?? ""}
                />
                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                  <SelectorIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </Combobox.Button>

                {filteredCourses.length > 0 && (
                  <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {filteredCourses.map((course) => (
                      <Combobox.Option
                        key={course.id}
                        value={course.id}
                        className={({ active }) =>
                          classNames(
                            "relative cursor-default select-none py-2 pl-3 pr-9",
                            {
                              "bg-indigo-600 text-white": active,
                              "text-gray-900": !active,
                            },
                          )
                        }
                      >
                        {({ active, selected }) => (
                          <>
                            <span
                              className={classNames("block truncate", {
                                "font-semibold": selected,
                              })}
                            >
                              {course.name}
                            </span>

                            {selected && (
                              <span
                                className={classNames(
                                  "absolute inset-y-0 right-0 flex items-center pr-4",
                                  {
                                    "text-white": active,
                                    "text-indigo-600": !active,
                                  },
                                )}
                              >
                                <CheckIcon
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                />
                              </span>
                            )}
                          </>
                        )}
                      </Combobox.Option>
                    ))}
                  </Combobox.Options>
                )}
              </div>
            </Combobox>
            <fieldset className="mt-6">
              <legend className="text-sm font-medium text-gray-900">
                Semester
              </legend>
              <p className="mb-4 text-sm leading-5 text-gray-500">
                When did you take this course?
              </p>
              <div className="space-y-4 sm:flex sm:items-center sm:space-x-10 sm:space-y-0">
                {semesters.map(({ id, term, startDate }) => (
                  <div key={id}>
                    <label
                      htmlFor={`semester-${term}-${startDate}`}
                      className="flex flex-row-reverse items-center justify-end gap-3 text-sm font-medium capitalize text-gray-700"
                    >
                      {`${term} ${new Date(startDate).getFullYear()}`}
                      <input
                        required
                        checked={semesterId === id}
                        onChange={() => setSemesterId(id)}
                        id={`semester-${term}-${startDate}`}
                        name="semester"
                        type="radio"
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </label>
                  </div>
                ))}
              </div>
            </fieldset>
          </div>
          <div className="pt-8">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Review
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Please share your experience along with some quick stats.
            </p>
            <fieldset className="mt-6">
              <legend className="text-sm font-medium text-gray-900">
                Rating
              </legend>
              <p className="mb-4 text-sm leading-5 text-gray-500">
                Overall, how would you rate this course on a scale of 1-5?
              </p>
              <div className="flex items-center space-x-7 md:space-x-10">
                {[1, 2, 3, 4, 5].map((num) => (
                  <div className="flex items-center" key={num}>
                    <label
                      htmlFor={`rating-${num}`}
                      className="flex flex-row-reverse items-center gap-3 text-sm font-medium text-gray-700"
                    >
                      {num}
                      <input
                        required
                        id={`rating-${num}`}
                        name="rating"
                        type="radio"
                        checked={rating === num}
                        onChange={() => setRating(num)}
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </label>
                  </div>
                ))}
              </div>
            </fieldset>
            <fieldset className="mt-6">
              <legend className="text-sm font-medium text-gray-900">
                Difficulty
              </legend>
              <p className="mb-4 text-sm leading-5 text-gray-500">
                How difficult was this course on a scale of 1-5?
              </p>
              <div className="flex items-center space-x-7 md:space-x-10">
                {[1, 2, 3, 4, 5].map((num) => (
                  <div className="flex items-center" key={num}>
                    <label
                      htmlFor={`difficulty-${num}`}
                      className="flex flex-row-reverse items-center gap-3 text-sm font-medium text-gray-700"
                    >
                      {num}
                      <input
                        required
                        id={`difficulty-${num}`}
                        name="difficulty"
                        type="radio"
                        checked={difficulty === num}
                        onChange={() => setDifficulty(num)}
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </label>
                  </div>
                ))}
              </div>
            </fieldset>
            <label
              htmlFor="workload"
              className="mt-6 block text-sm font-medium text-gray-700"
            >
              Workload
              <div className="relative mt-1 w-1/2 rounded-md shadow-sm">
                <input
                  required
                  type="number"
                  inputMode="numeric"
                  name="workload"
                  min={1}
                  max={100}
                  value={workload ?? ""}
                  onChange={(e) => {
                    if (!e.currentTarget.value) {
                      setWorkload(undefined);
                    } else if (+e.currentTarget.value) {
                      setWorkload(+e.currentTarget.value);
                    }
                  }}
                  id="workload"
                  className="block w-full rounded-md border-gray-300 pr-28 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  aria-describedby="workload-unit"
                  placeholder="12"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-500 sm:text-sm">hours / week</span>
                </div>
              </div>
            </label>
            <p className="mt-2 text-sm text-gray-500" id="workload-unit">
              How much time <span className="sr-only">(in hours per week)</span>{" "}
              did you invest in this course?
            </p>
            <label
              htmlFor="body"
              className="mt-6 block text-sm font-medium text-gray-700"
            >
              Review
              <div className="mt-1">
                <textarea
                  required
                  id="body"
                  name="body"
                  value={body}
                  onChange={(e) => setBody(e.currentTarget.value)}
                  rows={6}
                  className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </label>
            <p className="mt-2 text-sm text-gray-500">
              So, how was this course?
            </p>
          </div>
          <div className="pt-8" aria-live="polite">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Authentication
            </h3>
            {codeRequestState.status === "complete" &&
              !codeRequestState.errors && (
                <Alert
                  variant="success"
                  onDismiss={() => onDismissSendCodeAlert()}
                >
                  <p className="text-sm font-medium ">
                    {`Sent code to ${username}@gatech.edu!`} This code is valid
                    for 10 minutes. Click &apos;Send code&apos; again if you
                    need a new code.
                  </p>
                </Alert>
              )}
            {codeRequestState.status === "complete" &&
              codeRequestState.errors && (
                <Alert
                  variant="failure"
                  onDismiss={() => onDismissSendCodeAlert()}
                >
                  <p className="text-sm font-medium ">
                    {codeRequestState.errors[0]}
                  </p>
                </Alert>
              )}
            <div className="mt-1 text-sm text-gray-500">
              <span className="block">
                Only verified GATech students can leave reviews at this time.
              </span>
              <details className="inline-block">
                <summary className="cursor-pointer text-xs text-indigo-600 hover:text-indigo-900 md:text-sm">
                  How does this work?
                </summary>
                Enter your GT username below. If you need a code, you can
                request one be sent to your email. Enter your code below before
                you submit your review.
              </details>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700"
                >
                  GT Account
                  <div className="mt-1 flex flex-wrap gap-4">
                    <div className="flex shrink-0">
                      <input
                        required
                        type="text"
                        name="username"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.currentTarget.value)}
                        autoComplete="none"
                        placeholder="david.joyner"
                        className="relative block min-w-0 rounded-none rounded-l-md border-gray-300 font-normal placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      <span className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                        @gatech.edu
                      </span>
                    </div>
                    {username && (
                      <button
                        type="button"
                        {...(codeRequestState.status === "pending"
                          ? { disabled: true }
                          : {})}
                        onClick={() => {
                          sendCode().catch(() => {});
                        }}
                        className="rounded-md border border-transparent bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700 shadow-sm hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
                      >
                        {codeRequestState.status === "pending"
                          ? "Sending..."
                          : "Send code"}
                      </button>
                    )}
                  </div>
                </label>
                <p className="mt-2 text-sm text-gray-500">
                  Who are you, fellow student?
                </p>
              </div>
              <div className="sm:col-span-4">
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-gray-700"
                >
                  Code
                  <div className="mt-1">
                    <input
                      required
                      type="text"
                      minLength={6}
                      maxLength={6}
                      pattern="\d+"
                      inputMode="numeric"
                      name="code"
                      id="code"
                      value={code}
                      onChange={(e) => setCode(e.currentTarget.value)}
                      placeholder="123456"
                      className="relative block min-w-0 rounded border-gray-300 font-normal placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </label>
                <p className="mt-2 text-sm text-gray-500">
                  Please enter your one-time six-digit code.
                </p>
              </div>
            </div>
          </div>
          <div className="pt-5">
            <div className="flex justify-end">
              <button
                {...(reviewRequestState.status === "pending"
                  ? { disabled: true }
                  : {})}
                type="submit"
                className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {reviewRequestState.status === "pending"
                  ? "Submitting..."
                  : "Submit"}
              </button>
            </div>
          </div>
        </form>
      </div>
      <Transition.Root show={isSuccessModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => closeSuccessModal()}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                  <div>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                      <CheckIcon
                        className="h-6 w-6 text-green-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900"
                      >
                        Submission successful
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Thanks, {username}! It&apos;s so awesome you took the
                          time to write a review.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6">
                    <Link
                      href={`/courses/${
                        selectedCourse?.slug ?? "CS-0000"
                      }/reviews`}
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm"
                    >
                      View my review
                    </Link>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </section>
  );
}
