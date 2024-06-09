---
toc: false
---

```js
import * as numeric from "https://unpkg.com/numeric/numeric-1.2.6.min.js";
```

# Let's do some PBPK Modeling

Quantifying Hepatic Enzyme Kinetics of (-)-∆9-Tetrahydrocannabinol (THC) and Its Psychoactive Metabolite, 11-OH-THC... [Patiliea-Vrana and Unadkat, 2019](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6556521/)

```js
const metabolites = [
  { name: "THC", CLint: 0.2356 },
  { name: "CBD", CLint: 0.15 },
  { name: "CBN", CLint: 0.18 },
];
```

```js
// Slider for selecting CLint of the chosen metabolite
const selectedMetabolite = view(
  Inputs.select(metabolites, {
    label: "Select Metabolite",
    format: (m) => m.name,
  })
);
```

<!-- // const selectedMetabolite_ = Generators.input(selectedMetabolite); -->

```js
const clintSlider = view(
  Inputs.range([0.1, 0.3], {
    label: `Intrinsic Clearance (CLint) for ${selectedMetabolite.name} in mg/day`,
    step: 0.01,
    value: selectedMetabolite.CLint,
    disabled: true,
  })
);

// Range selectors for inflow rate and initial concentration
const inflowRate = view(
  Inputs.range([0, 20], {
    label: `Inflow Rate for ${selectedMetabolite.name} (mg/day)`,
    step: 0.00001,
    value: 5,
  })
);
```

```js
const accumulationTime = view(
  Inputs.range([0, 365 * 3], {
    label: "Accumulation Time (days)",
    value: 365, // Default value
    step: 1,
  })
);

const degredationTime = view(
  Inputs.range([0, 365 * 3], {
    label: "Degredation Time (days)",
    value: 30, // Default value
    step: 1,
  })
);

const dt = 0.1;
```

```js
function linspace(start, end, num) {
  const arr = new Array(num);
  const step = (end - start) / (num - 1);
  for (let i = 0; i < num; i++) {
    arr[i] = start + step * i;
  }
  return arr;
}
```

```js
function solveODEEuler(CLint, IC, totalTime, dt, inflowRate) {
  const k = CLint; // Use CLint directly
  let C = IC; // Start with the initial concentration

  const f = function (t, y) {
    return inflowRate - k * y; // Modified to use CLint directly
  };

  const times = linspace(0, totalTime, totalTime / dt + 1);
  const results = [C]; // Array to store concentration values, starting with the initial concentration

  for (let i = 0; i < times.length - 1; i++) {
    const t = times[i];
    const y = results[i];
    const y_next = y + dt * f(t, y); // Euler method step
    results.push(y_next);
  }

  return times.map((time, index) => ({
    time: time,
    concentration: results[index],
  }));
}
```

```js
const accumulation_results = solveODEEuler(
  selectedMetabolite.CLint,
  0,
  accumulationTime,
  dt,
  inflowRate
);
```

```js
const accumulation_data = accumulation_results.map((item) => ({
  time: item.time,
  concentration: item.concentration,
}));
```

```js
const accumPlot = Plot.plot({
  title: "Metabolite Concentration Over Time",
  x: {
    label: "Time (days)",
  },
  y: {
    label: "Concentration (mg)",
  },
  marks: [
    Plot.line(accumulation_data, { x: "time", y: "concentration" }),
    Plot.gridY({
      strokeDasharray: "0.75,2", // dashed
      strokeOpacity: 1, // opaque
    }),
  ],
});
```

```js
const lastElement = accumulation_data[accumulation_data.length - 1];
const initialConcentrationForNextPhase = lastElement.concentration;
```

```js
const degresults = solveODEEuler(
  selectedMetabolite.CLint,
  lastElement.concentration,
  degredationTime,
  dt,
  0
);
```

```js
const degradPlot = Plot.plot({
  title: "Metabolite Concentration Over Time",
  x: {
    label: "Time (days)",
  },
  y: {
    label: "Concentration (mg)",
  },
  marks: [
    Plot.line(degresults, { x: "time", y: "concentration" }),

    Plot.gridY({
      strokeDasharray: "0.75,2", // dashed
      strokeOpacity: 1, // opaque
    }),
  ],
});
```

```js
// Adjusting time values for degradation data
const lastAccumulationTime =
  accumulation_data[accumulation_data.length - 1].time;
const adjustedDegradationData = degresults.map((item) => ({
  time: item.time + lastAccumulationTime,
  concentration: item.concentration,
}));

// Concatenating both datasets
const combinedData = accumulation_data.concat(adjustedDegradationData);
```

```js
const combinedPlot = Plot.plot({
  title: "Metabolite Concentration Over Time",
  x: {
    label: "Time (days)",
  },
  y: {
    label: "Concentration (mg)",
  },
  marks: [
    Plot.line(combinedData, { x: "time", y: "concentration" }),
    Plot.gridY({
      strokeDasharray: "0.75,2", // dashed
      strokeOpacity: 1, // opaque
    }),
  ],
});
```

${combinedPlot}
