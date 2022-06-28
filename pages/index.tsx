import type { NextPage } from 'next'
import Head from 'next/head'

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>OMS Reviews</title>
        <meta name="description" content="Reviews for OMS courses. By students, for students." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="bg-white min-h-full px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
        <div className="max-w-max mx-auto">
          <main className="sm:flex">
            <p className="text-4xl font-extrabold text-indigo-600 sm:text-5xl">404</p>
            <div className="sm:ml-6">
              <div className="sm:border-l sm:border-gray-200 sm:pl-6">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">No reviews found, yet.</h1>
                <p className="max-w-lg mt-1 text-base text-gray-500">This site is now being managed by <a className="text-indigo-600" href="https://www.linkedin.com/in/matthew-schlenker/">Matt Schlenker</a>, current OMSCS student and creator/maintainer of <a className="text-indigo-600" href="https://omscs-notes.com/">OMSCS Notes</a>.</p>
              </div>
              <div className="mt-10 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6">
                <a
                  href="https://omscs-notes.com/"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Visit OMSCS Notes
                </a>
                <a
                  href="mailto:matt@omscs-notes.com"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Contact Matt
                </a>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  )
}

export default Home
