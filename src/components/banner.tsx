export function Banner(): JSX.Element {
  return (
    <div className="relative bg-indigo-600">
      <div className="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
        <div className="text-center ">
          <p className="font-medium text-white">
            <span className="inline">The reddit AMA is live!</span>
            <span className="ml-2 inline-block">
              <a
                href="https://www.reddit.com/r/OMSCS/comments/wnf87i/hey_omscs_i_am_the_new/"
                className="text-white font-bold border-b"
              >
                {" "}
                Ask me anything <span aria-hidden="true">&rarr;</span>
              </a>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
