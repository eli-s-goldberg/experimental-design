// See https://observablehq.com/framework/config for documentation.
export default {
  // The project’s title; used in the sidebar and webpage titles.
  title: "Data Matters",

  // The pages and sections in the sidebar. If you don’t specify this option,
  // all pages will be listed in alphabetical order. Listing pages explicitly
  // lets you organize them into sections and have unlisted pages.
  pages: [
    {
      name: "Introduction",
      path: "/index",
    },
    {
      name: "Experimental Design",
      pages: [
        {
          name: "Experimental Design ",
          path: "/experimental-design",
        },
        {
          name: "Individual Randomized Parallel Designs",
          path: "/parallel-arm-designs",
        },
        {
          name: "Individual Randomized Cluster Designs",
          path: "/cluster-randomized-designs",
        },
      ],
    },
    {
      name: "Data Science Experiments",
      pages: [
        {
          name: "Random Forests",
          path: "/random-forest",
        },
        {
          name: "Mass Balance Business Models",
          path: "/mass-balance-business-models",
        },
        {
          name: "Live Tables",
          path: "/live-table-data",
        },
        {
          name: "Distribution Modeling",
          path: "/distp-demo",
        },
        // {
        //   name: "CapTable",
        //   path: "/cap-table",
        // },
        {
          name: "Yet Another JS DataFrame",
          path: "/as-close-to-python-as-possible",
        },
      ],
    },
    {
      name: "Transport Modeling",
      pages: [
        {
          name: "Drug Elimination",
          path: "/pbpk",
        },
      ],
    },
    {
      name: "Ukelele Modeling",
      pages: [
        {
          name: "Chord Maker",
          path: "/ukulele",
        },
        {
          name: "Blackbird - The Beatles",
          path: "/ukutabs/blackbird",
        },
      ],
    },
    {
      name: "Miscellaneous Visualizations",
      pages: [
        {
          name: "Is Minneapolis 'happier' than Boston?",
          path: "/happy-city",
        },
        {
          name: "Diddy didn't, did he?",
          path: "/diddy-did-he",
        },
        {
          name: "FEMA Votes",
          path: "/fema-votes",
        },
      ],
    },
    {
      name: "Healthcare Diatribes",
      pages: [
        {
          name: "What are stars?",
          path: "/stars-hedis-insanity",
        },
      ],
    },
    {
      name: "Self Aggrandizing",
      pages: [
        {
          name: "Podcasts & Presentations",
          path: "/podcasts",
        },
      ],
    },
  ],

  // Some additional configuration options and their defaults:
  // theme: "default", // try "light", "dark", "slate", etc.
  // header: "", // what to show in the header (HTML)
  // footer: "Built with Observable.", // what to show in the footer (HTML)
  // toc: true, // whether to show the table of contents
  // pager: true, // whether to show previous & next links in the footer
  // root: "docs", // path to the source root for preview
  // output: "dist", // path to the output root for build
  // search: true, // activate search
};
