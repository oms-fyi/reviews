import {
  FormEvent, useEffect, useMemo, useState, Fragment,
} from 'react';

import { Dialog, Transition, Combobox } from '@headlessui/react';

import type { GetStaticProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { CheckIcon, SelectorIcon } from '@heroicons/react/solid';

import classNames from 'classnames';

import { Course, Review, Semester } from '../../src/@types';
import { getCourseNames, getRecentSemesters } from '../../src/sanity';
import Alert from '../../components/Alert';

interface NewReviewFormProps {
  courses: Pick<Course, 'id' | 'code' | 'name'>[];
  semesters: Semester[];
}

type RequestState = {
  status: 'init' | 'pending' | 'complete',
  errors?: string[],
};

export const getStaticProps: GetStaticProps<NewReviewFormProps> = async () => {
  const courses = await getCourseNames();
  const semesters = await getRecentSemesters();

  return { props: { courses, semesters } };
};

export default function NewReviewForm({ courses, semesters }: NewReviewFormProps): JSX.Element {
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const [courseId, setCourseId] = useState<Course['id']>('');
  const [semesterId, setSemesterId] = useState<Semester['id']>('');
  const [rating, setRating] = useState<NonNullable<Review['rating']>>();
  const [difficulty, setDifficulty] = useState<NonNullable<Review['difficulty']>>();
  const [workload, setWorkload] = useState<NonNullable<Review['workload']>>();
  const [body, setBody] = useState<Review['body']>('');
  const [username, setUsername] = useState<string>('');
  const [code, setCode] = useState<string>('');

  const [codeRequestState, setCodeRequestState] = useState<RequestState>({ status: 'init' });
  const [reviewRequestState, setReviewRequestState] = useState<RequestState>({ status: 'init' });

  const selectedCourse = useMemo<typeof courses[0] | undefined>(
    () => courses.find(({ id }) => id === courseId),
    [courseId, courses],
  );

  useEffect(() => {
    const { course: courseCode } = router.query;

    if (typeof courseCode === 'string') {
      setCourseId(
        courses.find((course) => course.code === courseCode)?.id ?? '',
      );
    }
  }, [router, courses]);

  useEffect(() => {
    if (reviewRequestState.status === 'complete' && reviewRequestState.errors) {
      window.scroll({ top: 0, behavior: 'smooth' });
    }
  }, [reviewRequestState]);

  const filteredCourses = useMemo(
    () => (query === ''
      ? courses
      : courses.filter((course) => course.name.toLowerCase().includes(query.toLowerCase()))),
    [query, courses],
  );

  function onDismissSendCodeAlert() {
    setCodeRequestState({ status: 'init' });
  }

  function onDismissCreateReviewAlert() {
    setReviewRequestState({ status: 'init' });
  }

  function closeSuccessModal() {
    setCourseId('');
    setSemesterId('');
    setRating(undefined);
    setDifficulty(undefined);
    setWorkload(undefined);
    setBody('');
    setUsername('');
    setCode('');

    setIsSuccessModalOpen(false);
  }

  async function sendCode() {
    if (!username) { return; }

    setCodeRequestState({ status: 'pending' });

    try {
      const response = await fetch('/api/verifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      const { error } = await response.json() as { error?: string };

      if (error) {
        setCodeRequestState({ status: 'complete', errors: [error] });
      } else {
        setCodeRequestState({ status: 'complete' });
      }
    } catch (error: unknown) {
      setCodeRequestState({
        status: 'complete',
        errors: ['Something went wrong. Please try again.'],
      });
    }
  }

  async function createReview(e: FormEvent) {
    e.preventDefault();

    setReviewRequestState({ status: 'pending' });

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
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
          'Content-Type': 'application/json',
        },
      });

      const { errors } = await response.json() as { errors?: string[] };

      if (!errors) {
        setIsSuccessModalOpen(true);
      }

      setReviewRequestState({ status: 'complete', errors });
    } catch (error: unknown) {
      setCodeRequestState({
        status: 'complete',
        errors: ['Something went wrong. Please try again.'],
      });
    }
  }

  return (
    <main className="bg-white py-10 px-5 sm:px-20 max-w-2xl mt-10 mx-auto">
      <div className="space-y-8 divide-y divide-gray-200">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0" aria-live="polite">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Add A Review
              {' '}
              {selectedCourse ? `for ${selectedCourse.code}` : ''}
            </h1>
            <div className="text-sm font-medium">
              { reviewRequestState.status === 'complete' && reviewRequestState.errors && (
                <div className="-mb-4">
                  <Alert variant="failure" onDismiss={() => onDismissCreateReviewAlert()}>
                    {reviewRequestState.errors.length > 1
                      ? (
                        <>
                          <span>Please fix the following errors:</span>
                          <ul className="list-disc list-inside">
                            {reviewRequestState.errors.map((err) => <li key={err}>{err}</li>)}
                          </ul>
                        </>
                      )
                      : <p>{reviewRequestState.errors[0]}</p>}
                  </Alert>
                </div>
              )}
            </div>
          </div>
        </div>
        <form onSubmit={(e) => { createReview(e).catch(() => {}); }} className="space-y-8 divide-y divide-gray-200">
          <div className="pt-8">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Course
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Let&apos;s start with some information about the course want
              to review.
            </p>
            <Combobox as="div" className="mt-6" value={courseId} onChange={setCourseId}>
              <Combobox.Label className="block text-sm font-medium text-gray-700">
                Course Name
              </Combobox.Label>
              <div className="relative mt-1">
                <Combobox.Input
                  required
                  className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                  onChange={(event) => setQuery(event.target.value)}
                  displayValue={() => selectedCourse?.name ?? ''}
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
                      className={({ active }) => classNames(
                        'relative cursor-default select-none py-2 pl-3 pr-9',
                        {
                          'bg-indigo-600 text-white': active,
                          'text-gray-900': !active,
                        },
                      )}
                    >
                      {({ active, selected }) => (
                        <>
                          <span
                            className={classNames('block truncate', {
                              'font-semibold': selected,
                            })}
                          >
                            {course.name}
                          </span>

                          {selected && (
                          <span
                            className={classNames(
                              'absolute inset-y-0 right-0 flex items-center pr-4',
                              {
                                'text-white': active,
                                'text-indigo-600': !active,
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
              <legend className="text-sm font-medium text-gray-900">Semester</legend>
              <p className="text-sm leading-5 text-gray-500 mb-4">
                When did you take
                {' '}
                {selectedCourse?.code ?? 'this course'}
                ?
              </p>
              <div className="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                {semesters.map(({ id, term, startDate }) => (
                  <div key={id}>
                    <label
                      htmlFor={`semester-${term}-${startDate}`}
                      className="flex flex-row-reverse justify-end items-center gap-3 block text-sm font-medium text-gray-700 capitalize"
                    >
                      {`${term} ${new Date(startDate).getFullYear()}`}
                      <input
                        required
                        checked={semesterId === id}
                        onChange={() => setSemesterId(id)}
                        id={`semester-${term}-${startDate}`}
                        name="semester"
                        type="radio"
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                      />
                    </label>
                  </div>
                ))}
              </div>
            </fieldset>
          </div>
          <div className="pt-8">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Review
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Please share your experience along with some quick stats about
              {' '}
              {selectedCourse?.code ?? 'this course'}
              .
            </p>
            <fieldset className="mt-6">
              <legend className="text-sm font-medium text-gray-900">
                Rating
              </legend>
              <p className="text-sm leading-5 text-gray-500 mb-4">
                Overall, how would you rate
                {' '}
                {selectedCourse?.code ?? 'this course'}
                {' '}
                on a scale of
                1-5?
              </p>
              <div className="flex items-center space-x-7 md:space-x-10">
                {[1, 2, 3, 4, 5].map((num) => (
                  <div className="flex items-center" key={num}>
                    <label
                      htmlFor={`rating-${num}`}
                      className="flex flex-row-reverse gap-3 items-center block text-sm font-medium text-gray-700"
                    >
                      {num}
                      <input
                        required
                        id={`rating-${num}`}
                        name="rating"
                        type="radio"
                        checked={rating === num}
                        onChange={() => setRating(num)}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
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
              <p className="text-sm leading-5 text-gray-500 mb-4">
                How difficult was
                {' '}
                {selectedCourse?.code ?? 'this course'}
                {' '}
                on a scale of 1-5?
              </p>
              <div className="flex items-center space-x-7 md:space-x-10">
                {[1, 2, 3, 4, 5].map((num) => (
                  <div className="flex items-center" key={num}>
                    <label
                      htmlFor={`difficulty-${num}`}
                      className="flex flex-row-reverse gap-3 items-center block text-sm font-medium text-gray-700"
                    >
                      {num}
                      <input
                        required
                        id={`difficulty-${num}`}
                        name="difficulty"
                        type="radio"
                        checked={difficulty === num}
                        onChange={() => setDifficulty(num)}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
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
              <div className="mt-1 relative rounded-md shadow-sm w-1/2">
                <input
                  required
                  type="number"
                  inputMode="numeric"
                  name="workload"
                  min={1}
                  max={100}
                  value={workload ?? ''}
                  onChange={(e) => {
                    if (!e.currentTarget.value) {
                      setWorkload(undefined);
                    } else if (+e.currentTarget.value) {
                      setWorkload(+e.currentTarget.value);
                    }
                  }}
                  id="workload"
                  className="focus:ring-indigo-500 placeholder-gray-400 focus:border-indigo-500 block w-full pr-28 sm:text-sm border-gray-300 rounded-md"
                  aria-describedby="workload-unit"
                  placeholder="12"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">
                    hours / week
                  </span>
                </div>
              </div>
            </label>
            <p className="mt-2 text-sm text-gray-500" id="workload-unit">
              How much time
              {' '}
              <span className="sr-only">(in hours per week)</span>
              {' '}
              did you
              invest in
              {' '}
              {selectedCourse?.code ?? 'this course'}
              ?
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
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                />
              </div>
            </label>
            <p className="mt-2 text-sm text-gray-500">
              So, how was
              {' '}
              {selectedCourse?.code ?? 'the course'}
              ?
            </p>
          </div>
          <div className="pt-8" aria-live="polite">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Authentication
            </h3>
            {codeRequestState.status === 'complete' && !codeRequestState.errors
            && (
              <Alert variant="success" onDismiss={() => onDismissSendCodeAlert()}>
                <p className="text-sm font-medium ">
                  {`Sent code to ${username}@gatech.edu!`}
                  {' '}
                  This code is valid for 10 minutes. Click &apos;Send code&apos;
                  again if you need a new code.
                </p>
              </Alert>
            ) }
            {codeRequestState.status === 'complete' && codeRequestState.errors
            && (
              <Alert variant="failure" onDismiss={() => onDismissSendCodeAlert()}>
                <p className="text-sm font-medium ">
                  {codeRequestState.errors[0]}
                </p>
              </Alert>
            ) }
            <div className="mt-1 text-sm text-gray-500">
              <span className="block">
                Only verified GATech students can leave reviews at this time.
              </span>
              <details className="inline-block">
                <summary className="text-indigo-600 cursor-pointer text-xs md:text-sm hover:text-indigo-900">
                  How does this work?
                </summary>
                Enter your GT username below. If you need a code, you can request
                one be sent to your email. Enter your code below before you submit
                your review.
              </details>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700"
                >
                  GT Account
                  <div className="mt-1 flex gap-4 flex-wrap">
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
                        className="relative font-normal placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 block min-w-0 rounded-none rounded-l-md sm:text-sm border-gray-300"
                      />
                      <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                        @gatech.edu
                      </span>
                    </div>
                    {
                      username
                      && (
                      <button
                        type="button"
                        {...(codeRequestState.status === 'pending' ? { disabled: true } : {})}
                        onClick={() => { sendCode().catch(() => {}); }}
                        className="py-1 px-2 border border-transparent shadow-sm text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400"
                      >
                        { codeRequestState.status === 'pending' ? 'Sending...' : 'Send code' }
                      </button>
                      )
                    }

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
                      className="relative font-normal placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 block min-w-0 rounded sm:text-sm border-gray-300"
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
                {...(reviewRequestState.status === 'pending' ? { disabled: true } : {})}
                type="submit"
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                { reviewRequestState.status === 'pending' ? 'Submitting...' : 'Submit' }
              </button>
            </div>
          </div>
        </form>
      </div>
      <Transition.Root show={isSuccessModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => closeSuccessModal()}>
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

          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-sm sm:w-full sm:p-6">
                  <div>
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                      <CheckIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                        Submission successful
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Thanks,
                          {' '}
                          {username}
                          !
                          {' '}
                          It&apos;s so awesome you took the time to review
                          {' '}
                          {selectedCourse?.code ?? ''}
                          .
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6">
                    <Link href={`/courses/${selectedCourse?.code ?? 'CS-0000'}/reviews`} passHref>
                      <a
                        href="replace"
                        className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                      >
                        View my review
                      </a>
                    </Link>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </main>
  );
}
