const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.buymeacoffee.com",
        port: "",
        pathname: "/button-api/",
      },
    ],
  },
  reactStrictMode: true,
  experimental: {
    instrumentationHook: true,
  },
  async redirects() {
    return [
      {
        destination: "/courses/special-topics-quantum-computing/reviews",
        permanent: true,
        source: "/courses/CS-8803-O13/reviews",
      },
      {
        destination: "/courses/seminar-computational-sociology-seminar/reviews",
        permanent: true,
        source: "/courses/CS-8001-OSO/reviews",
      },
      {
        destination: "/courses/special-topics-digital-public-policy/reviews",
        permanent: true,
        source: "/courses/PUBP-8813/reviews",
      },
      {
        destination: "/courses/seminar-cs-educators-seminar/reviews",
        permanent: true,
        source: "/courses/CS-8001-OED/reviews",
      },
      {
        destination:
          "/courses/cyber-physical-security-in-electric-energy-systems/reviews",
        permanent: true,
        source: "/courses/ECE-6374/reviews",
      },
      {
        destination: "/courses/seminar-women-in-tech-seminar/reviews",
        permanent: true,
        source: "/courses/CS-8001-OWN/reviews",
      },
      {
        destination: "/courses/seminar-computing-in-python-seminar/reviews",
        permanent: true,
        source: "/courses/CS-8001-OCS/reviews",
      },
      {
        destination:
          "/courses/special-topics-introduction-to-computer-law/reviews",
        permanent: true,
        source: "/courses/CS-8803-O15/reviews",
      },
      {
        destination:
          "/courses/special-topics-geopolitics-of-cybersecurity/reviews",
        permanent: true,
        source: "/courses/PUBP-8823/reviews",
      },
      {
        destination: "/courses/special-topics-global-entrepreneurship/reviews",
        permanent: true,
        source: "/courses/CS-8803-O17/reviews",
      },
      {
        destination: "/courses/introduction-to-information-security/reviews",
        permanent: true,
        source: "/courses/CS-6035/reviews",
      },
      {
        destination: "/courses/computing-for-good/reviews",
        permanent: true,
        source: "/courses/CS-6150/reviews",
      },
      {
        destination:
          "/courses/graduate-introduction-to-operating-systems/reviews",
        permanent: true,
        source: "/courses/CS-6200/reviews",
      },
      {
        destination: "/courses/advanced-operating-systems/reviews",
        permanent: true,
        source: "/courses/CS-6210/reviews",
      },
      {
        destination: "/courses/secure-computer-systems/reviews",
        permanent: true,
        source: "/courses/CS-6238/reviews",
      },
      {
        destination: "/courses/computer-networks/reviews",
        permanent: true,
        source: "/courses/CS-6250/reviews",
      },
      {
        destination: "/courses/applied-cryptography/reviews",
        permanent: true,
        source: "/courses/CS-6260/reviews",
      },
      {
        destination: "/courses/network-security/reviews",
        permanent: true,
        source: "/courses/CS-6262/reviews",
      },
      {
        destination:
          "/courses/introduction-to-cyber-physical-systems-security/reviews",
        permanent: true,
        source: "/courses/CS-6263/reviews",
      },
      {
        destination:
          "/courses/information-security-lab-system-and-network-defenses/reviews",
        permanent: true,
        source: "/courses/CS-6264/reviews",
      },
      {
        destination:
          "/courses/information-security-lab-binary-exploitation/reviews",
        permanent: true,
        source: "/courses/CS-6265/reviews",
      },
      {
        destination: "/courses/high-performance-computer-architecture/reviews",
        permanent: true,
        source: "/courses/CS-6290/reviews",
      },
      {
        destination: "/courses/embedded-systems-optimization/reviews",
        permanent: true,
        source: "/courses/CS-6291/reviews",
      },
      {
        destination: "/courses/software-development-process/reviews",
        permanent: true,
        source: "/courses/CS-6300/reviews",
      },
      {
        destination: "/courses/software-architecture-and-design/reviews",
        permanent: true,
        source: "/courses/CS-6310/reviews",
      },
      {
        destination:
          "/courses/advanced-topics-in-software-analysis-and-testing/reviews",
        permanent: true,
        source: "/courses/CS-6340/reviews",
      },
      {
        destination: "/courses/database-systems-concepts-and-design/reviews",
        permanent: true,
        source: "/courses/CS-6400/reviews",
      },
      {
        destination: "/courses/introduction-to-health-informatics/reviews",
        permanent: true,
        source: "/courses/CS-6440/reviews",
      },
      {
        destination: "/courses/video-game-design-and-programming/reviews",
        permanent: true,
        source: "/courses/CS-6457/reviews",
      },
      {
        destination:
          "/courses/educational-technology-conceptual-foundations/reviews",
        permanent: true,
        source: "/courses/CS-6460/reviews",
      },
      {
        destination: "/courses/computational-journalism/reviews",
        permanent: true,
        source: "/courses/CS-6465/reviews",
      },
      {
        destination: "/courses/computational-photography/reviews",
        permanent: true,
        source: "/courses/CS-6475/reviews",
      },
      {
        destination: "/courses/introduction-to-computer-vision/reviews",
        permanent: true,
        source: "/courses/CS-6476/reviews",
      },
      {
        destination: "/courses/introduction-to-graduate-algorithms/reviews",
        permanent: true,
        source: "/courses/CS-6515/reviews",
      },
      {
        destination: "/courses/artificial-intelligence/reviews",
        permanent: true,
        source: "/courses/CS-6601/reviews",
      },
      {
        destination: "/courses/ai-ethics-and-society/reviews",
        permanent: true,
        source: "/courses/CS-6603/reviews",
      },
      {
        destination:
          "/courses/advanced-internet-computing-systems-and-applications/reviews",
        permanent: true,
        source: "/courses/CS-6675/reviews",
      },
      {
        destination: "/courses/cyber-security-practicum/reviews",
        permanent: true,
        source: "/courses/CS-6727/reviews",
      },
      {
        destination: "/courses/advanced-topics-in-malware-analysis/reviews",
        permanent: true,
        source: "/courses/CS-6747/reviews",
      },
      {
        destination: "/courses/human-computer-interaction/reviews",
        permanent: true,
        source: "/courses/CS-6750/reviews",
      },
      {
        destination: "/courses/introduction-to-cognitive-science/reviews",
        permanent: true,
        source: "/courses/CS-6795/reviews",
      },
      {
        destination: "/courses/distributed-computing/reviews",
        permanent: true,
        source: "/courses/CS-7210/reviews",
      },
      {
        destination:
          "/courses/network-science-methods-and-applications/reviews",
        permanent: true,
        source: "/courses/CS-7280/reviews",
      },
      {
        destination: "/courses/mobile-and-ubiquitous-computing/reviews",
        permanent: true,
        source: "/courses/CS-7470/reviews",
      },
      {
        destination: "/courses/game-artificial-intelligence/reviews",
        permanent: true,
        source: "/courses/CS-7632/reviews",
      },
      {
        destination: "/courses/knowledge-based-ai/reviews",
        permanent: true,
        source: "/courses/CS-7637/reviews",
      },
      {
        destination:
          "/courses/artificial-intelligence-techniques-for-robotics/reviews",
        permanent: true,
        source: "/courses/CS-7638/reviews",
      },
      {
        destination: "/courses/cyber-physical-design-and-analysis/reviews",
        permanent: true,
        source: "/courses/CS-7639/reviews",
      },
      {
        destination: "/courses/machine-learning/reviews",
        permanent: true,
        source: "/courses/CS-7641/reviews",
      },
      {
        destination:
          "/courses/reinforcement-learning-and-decision-making/reviews",
        permanent: true,
        source: "/courses/CS-7642/reviews",
      },
      {
        destination: "/courses/deep-learning/reviews",
        permanent: true,
        source: "/courses/CS-7643/reviews",
      },
      {
        destination: "/courses/machine-learning-for-trading/reviews",
        permanent: true,
        source: "/courses/CS-7646/reviews",
      },
      {
        destination:
          "/courses/special-topics-compilers-theory-and-practice/reviews",
        permanent: true,
        source: "/courses/CS-8803-O08/reviews",
      },
      {
        destination:
          "/courses/special-topics-systems-issues-in-cloud-computing/reviews",
        permanent: true,
        source: "/courses/CS-8803-O0A/reviews",
      },
      {
        destination:
          "/courses/security-operations-and-incidence-response/reviews",
        permanent: true,
        source: "/courses/CS-8803-OCY/reviews",
      },
      {
        destination:
          "/courses/computing-for-data-analysis-methods-and-tools/reviews",
        permanent: true,
        source: "/courses/CSE-6040/reviews",
      },
      {
        destination: "/courses/high-performance-computing/reviews",
        permanent: true,
        source: "/courses/CSE-6220/reviews",
      },
      {
        destination: "/courses/data-and-visual-analytics/reviews",
        permanent: true,
        source: "/courses/CSE-6242/reviews",
      },
      {
        destination: "/courses/big-data-analytics-for-healthcare/reviews",
        permanent: true,
        source: "/courses/CSE-6250/reviews",
      },
      {
        destination: "/courses/modeling-simulation-and-military-gaming/reviews",
        permanent: true,
        source: "/courses/CSE-6742/reviews",
      },
      {
        destination:
          "/courses/introduction-to-cyber-physical-electric-energy-systems/reviews",
        permanent: true,
        source: "/courses/ECE-8803/reviews",
      },
      {
        destination:
          "/courses/side-channels-and-their-role-in-cybersecurity/reviews",
        permanent: true,
        source: "/courses/ECE-8843/reviews",
      },
      {
        destination: "/courses/international-security/reviews",
        permanent: true,
        source: "/courses/INTA-6103/reviews",
      },
      {
        destination: "/courses/data-analytics-and-security/reviews",
        permanent: true,
        source: "/courses/INTA-6450/reviews",
      },
      {
        destination: "/courses/time-series-analysis/reviews",
        permanent: true,
        source: "/courses/ISYE-6402/reviews",
      },
      {
        destination:
          "/courses/statistical-modeling-and-regression-analysis/reviews",
        permanent: true,
        source: "/courses/ISYE-6414/reviews",
      },
      {
        destination: "/courses/computational-statistics/reviews",
        permanent: true,
        source: "/courses/ISYE-6416/reviews",
      },
      {
        destination:
          "/courses/introduction-to-theory-and-practice-of-bayesian-statistics/reviews",
        permanent: true,
        source: "/courses/ISYE-6420/reviews",
      },
      {
        destination: "/courses/introduction-to-analytics-modeling/reviews",
        permanent: true,
        source: "/courses/ISYE-6501/reviews",
      },
      {
        destination: "/courses/simulation/reviews",
        permanent: true,
        source: "/courses/ISYE-6644/reviews",
      },
      {
        destination:
          "/courses/probabilistic-models-and-their-applications/reviews",
        permanent: true,
        source: "/courses/ISYE-6650/reviews",
      },
      {
        destination: "/courses/deterministic-optimization/reviews",
        permanent: true,
        source: "/courses/ISYE-6669/reviews",
      },
      {
        destination:
          "/courses/computational-data-analysis-learning-mining-and-computation/reviews",
        permanent: true,
        source: "/courses/ISYE-6740/reviews",
      },
      {
        destination: "/courses/data-mining-and-statistical-learning/reviews",
        permanent: true,
        source: "/courses/ISYE-7406/reviews",
      },
      {
        destination:
          "/courses/special-topics-high-dimensional-data-analytics/reviews",
        permanent: true,
        source: "/courses/ISYE-8803/reviews",
      },
      {
        destination: "/courses/data-analytics-in-business/reviews",
        permanent: true,
        source: "/courses/MGT-6203/reviews",
      },
      {
        destination: "/courses/digital-marketing/reviews",
        permanent: true,
        source: "/courses/MGT-6311/reviews",
      },
      {
        destination: "/courses/privacy-for-professionals/reviews",
        permanent: true,
        source: "/courses/MGT-6727/reviews",
      },
      {
        destination: "/courses/applied-analytics-practicum/reviews",
        permanent: true,
        source: "/courses/MGT-6748/reviews",
      },
      {
        destination:
          "/courses/special-topics-business-fundamentals-for-analytics/reviews",
        permanent: true,
        source: "/courses/MGT-8803/reviews",
      },
      {
        destination: "/courses/special-topics-financial-modeling/reviews",
        permanent: true,
        source: "/courses/MGT-8813/reviews",
      },
      {
        destination:
          "/courses/special-topics-data-analysis-for-continuous-improvement/reviews",
        permanent: true,
        source: "/courses/MGT-8823/reviews",
      },
      {
        destination: "/courses/internet-and-public-policy/reviews",
        permanent: true,
        source: "/courses/PUBP-6111/reviews",
      },
      {
        destination: "/courses/information-policy-and-management/reviews",
        permanent: true,
        source: "/courses/PUBP-6501/reviews",
      },
      {
        destination:
          "/courses/information-and-communications-technology-policy/reviews",
        permanent: true,
        source: "/courses/PUBP-6502/reviews",
      },
      {
        destination:
          "/courses/information-security-policies-and-strategies/reviews",
        permanent: true,
        source: "/courses/PUBP-6725/reviews",
      },
      {
        source: "/courses",
        destination: "/",
        permanent: true,
      },
      {
        source: "/course/:id",
        destination: "/courses/:id/reviews",
        permanent: true,
      },
      {
        source: "/reviews",
        destination: "/reviews/recent",
        permanent: true,
      },
    ];
  },
};

/**
 * Copied from https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#extend-your-nextjs-configuration
 */


// Injected content via Sentry wizard below

module.exports = withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // An auth token is required for uploading source maps.
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
