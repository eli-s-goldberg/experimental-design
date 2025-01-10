---
toc: true
title: DataFrame, DataFrame, DataFrame
---

```js
// it's 'noisy' when we have so much CSS in the page
import { defaultStyles } from "./components/styles.js";
const styleElement = html`<style>
  ${defaultStyles}
</style>`;
document.head.appendChild(styleElement);
import { require } from "d3-require";
const jStat = await require("jstat@1.9.4");
const math = await require("mathjs@9.4.2");
```

```js
import { DataFrame } from "./components/DataFrame.js";
```

```js
import { ExperimentalDesign } from "./components/ExperimentalDesign.js";
```

## Let's try to do something useful

Part of why I wanted to create my own dataframe method is so that I could add an easy way to design and evaluate experiments.

Here's some panel data: [Medical Expenditure Panel Survey (MEPS)](https://github.com/HHS-AHRQ/MEPS).

```js
function generateSimplePanelData(numIndividuals = 200, numPeriods = 3) {
  const data = [];

  for (let id = 1; id <= numIndividuals; id++) {
    // Generate time-invariant characteristics
    const age = Math.floor(Math.random() * 40) + 25; // Age 25-64
    const education = Math.floor(Math.random() * 16) + 8; // Education 8-23 years

    // Assignment to treatment with some bias towards higher education
    const propensityScore = 0.1 + (education - 8) * 0.02; // Base 0.1, increases with education
    const treatment = Math.random() < propensityScore ? 1 : 0;

    for (let t = 1; t <= numPeriods; t++) {
      // Time-varying income with:
      // - Positive correlation with education (return to education)
      // - Small positive correlation with age (experience premium)
      // - Random noise
      // - Treatment effect (if in treatment group and after period 1)
      const baseIncome = 30000 + education * 2000 + age * 200;
      const noise = (Math.random() - 0.5) * 10000;
      const treatmentEffect = treatment === 1 && t > 1 ? 5000 : 0;

      const income = Math.round(baseIncome + noise + treatmentEffect);

      data.push({
        id,
        period: t,
        age,
        education,
        treatment,
        income,
      });
    }
  }

  return {
    data,
    summary: {
      numIndividuals,
      numPeriods,
      totalObservations: data.length,
      treatmentGroup: data.filter((d) => d.treatment === 1).length / numPeriods,
      controlGroup: data.filter((d) => d.treatment === 0).length / numPeriods,
    },
  };
}
```

panel next

```js
const data = generateSimplePanelData();
const df = new DataFrame(data.data); // Note: data.data since generateSimplePanelData returns {data, summary}

// Create experimental design instance
const experiment = new ExperimentalDesign(df);

// Create Table 1
const table1 = experiment.createTable1("treatment", "treatment", [
  "age",
  "education",
  // "income",
]);

// Identify control group
const matched = experiment.identifyControlGroup({
  method: "propensityMatching",
  options: {
    treatmentVar: "treatment",
    covariates: ["age", "education", "income"],
  },
});

view(matched);
```

```js
const plot = visualizeMatching(experiment.df, matched);
view(plot);
```

```js
import * as Plot from "@observablehq/plot";

function visualizeMatching(data, matchedControls) {
  // Helper functions
  const isValidNumber = (value) =>
    typeof value === "number" && !isNaN(value) && isFinite(value);

  // Normalize values to [0,1] range for distance calculations
  const normalize = (value, min, max) => (value - min) / (max - min);

  // Convert columnar data to array of objects with validation and normalization
  const makeRowArray = (data, isMatched = false) => {
    const ages = data._data.age;
    const educations = data._data.education;

    // Get min/max for normalization
    const ageExtent = [Math.min(...ages), Math.max(...ages)];
    const eduExtent = [Math.min(...educations), Math.max(...educations)];

    const rows = [];
    for (let i = 0; i < data._length; i++) {
      const age = ages[i];
      const education = educations[i];
      const treatment = data._data.treatment[i];

      if (isValidNumber(age) && isValidNumber(education)) {
        rows.push({
          age,
          education,
          treatment,
          index: i,
          isMatched,
          // Add normalized values for distance calculation
          normAge: normalize(age, ageExtent[0], ageExtent[1]),
          normEdu: normalize(education, eduExtent[0], eduExtent[1]),
        });
      }
    }
    return rows;
  };

  // Get all points
  const treatmentRows = makeRowArray(data).filter((d) => d.treatment === 1);
  const controlRows = makeRowArray(data).filter((d) => d.treatment === 0);

  // Calculate euclidean distance between normalized points
  const distance = (p1, p2) =>
    Math.sqrt(
      Math.pow(p1.normAge - p2.normAge, 2) +
        Math.pow(p1.normEdu - p2.normEdu, 2)
    );

  // Find optimal matches using greedy algorithm with distance threshold
  const maxDistance = 0.3; // Adjust this threshold to control match quality
  const pairs = [];
  const usedControlIndices = new Set();

  treatmentRows.forEach((treatment) => {
    let bestMatch = null;
    let minDist = maxDistance;

    controlRows.forEach((control) => {
      if (!usedControlIndices.has(control.index)) {
        const dist = distance(treatment, control);
        if (dist < minDist) {
          minDist = dist;
          bestMatch = control;
        }
      }
    });

    if (bestMatch) {
      pairs.push({
        treatment,
        control: bestMatch,
        distance: minDist,
      });
      usedControlIndices.add(bestMatch.index);
    }
  });

  // Sort pairs by match quality
  pairs.sort((a, b) => a.distance - b.distance);

  // Create line segments data
  const lineSegments = pairs.map((pair) => ({
    x1: pair.treatment.age,
    y1: pair.treatment.education,
    x2: pair.control.age,
    y2: pair.control.education,
    distance: pair.distance,
  }));

  // Only include matched points
  const pointData = [
    ...pairs.map((p) => ({ ...p.treatment, group: "Treatment" })),
    ...pairs.map((p) => ({ ...p.control, group: "Matched Control" })),
    ...pairs.map((p) => ({ ...p.unmatched, group: "UnMatched Control" })),
  ];

  // Calculate match quality metrics
  const meanDistance =
    pairs.reduce((sum, p) => sum + p.distance, 0) / pairs.length;
  console.log("Match quality metrics:", {
    totalMatches: pairs.length,
    meanDistance: meanDistance.toFixed(3),
    maxDistance: Math.max(...pairs.map((p) => p.distance)).toFixed(3),
    unmatched: treatmentRows.length - pairs.length,
  });

  return Plot.plot({
    style: {
      backgroundColor: "white",
    },
    color: {
      domain: ["Treatment", "Matched Control", "Unmatched Control"],
      range: ["steelblue", "orange", "gray"],
      legend: true,
    },
    height: 600,
    width: 900,
    grid: true,
    marks: [
      Plot.frame(),

      // Draw matching lines
      Plot.link(lineSegments, {
        x1: "x1",
        y1: "y1",
        x2: "x2",
        y2: "y2",
        stroke: "gray",
        strokeOpacity: (d) => 0.3 * (1 - d.distance / maxDistance), // Fade out worse matches
        strokeWidth: (d) => 2 * (1 - d.distance / maxDistance), // Make better matches more prominent
        title: (d) => `Match distance: ${d.distance.toFixed(3)}`,
      }),

      // Scatter plot
      Plot.dot(pointData, {
        x: "age",
        y: "education",
        stroke: "group",
        fill: "group",
        fillOpacity: 0.7,
        r: 3,
      }),
    ],
  });
}
```
