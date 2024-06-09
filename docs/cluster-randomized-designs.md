---
theme: light
title: Cluster Randomized Designs
toc: true
---

```js
import {
  calculateSampleSizeForMeans,
  calculateSampleSizeForProportions,
  calculateVarianceFormulaIndividualRandomized,
  calculateVarianceFormulaClusterRandomized,
  generateVarianceData,
  generateUnifiedVarianceData,
} from "./components/parallelmethods.js";
```

```js
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import * as numeric from "https://cdnjs.cloudflare.com/ajax/libs/numeric/1.2.6/numeric.min.js";
import { require } from "d3-require";
const jStat = await require("jstat@1.9.4");
```

<style>
      body {
      font: 13.5px/1.5 var(--serif);
      margin: 0;
      max-width: 90%;
      }

      table {
          border-collapse: collapse;
          table-layout:fixed;
          width: 100%;
          height: 20%;
          font: 13.5px/1.5 var(--serif);

      }
      th {
          font: 13.5px/1.5 var(--serif);
          font-weight: bold;
          border-top: 1px solid black;
          border-bottom: 1px solid black;
    }
    tr:last-child td {
        /* font-weight: bold; */
        border-bottom: 1px solid black;
        /* background-color: lightyellow; */
    }
    /* tr:nth-last-child(2) {
        border-bottom: 1px dashed black;
    } */
    td, th {
        text-align: left;
        border-collapse: collapse;
        padding:2px;
        font-size:0.8em;
    }

    .horizontal-line {
    border-top: 0.5px solid #d3d3d3; /* Creates a thin gray line */
    width: 100%; /* Spans the width of the container/page */
    margin-top:10px;
    margin-bottom:10px
    }

    .katex { font-size: 1em; }

      p { max-width: 90% }


</style>

<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/9.4.2/math.min.js"> </script>

# Clustr Random Designs

Derived from this video [S4b Sample size and power for cluster randomised trial](https://www.youtube.com/watch?v=JOtwZyaJZpk)

<iframe width="560" height="315" src="https://www.youtube.com/embed/JOtwZyaJZpk" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

<div class = "horizontal-line"></div>
## Notes

4.b Parallel arm cluster randomization (no repeated measure)
4.c Loongitudinal cluster randomization (repeated measure)

# Cluster Randomized

**Question:** why do the formula's change when using a cluster randomized trial (CRT) design from this:

```js
const equation_3 = tex.block`\begin{equation} \text{Var}(\overline{Y}) = \frac{\sigma^2}{n} \end{equation}`;
const equation_4 = tex.block`\begin{equation} \text{Var}(\overline{Y}) = \frac{\sigma^2}{k \cdot m} \left[ 1 + (m - 1) \cdot \rho \right] \end{equation}`;
```

```js
view(equation_3);
```

Where ${tex`\sigma^2`}is the variance of the outcome variable, and ${tex`n`}: is the total number of individuals.

To this?

```js
view(equation_4);
```

Where ${tex`\sigma^2`} is the variance of the outcome variable, ${tex`m`} is the average cluster size (number of individuals per cluster), ${tex`\rho`} is the intracluster correlation coefficient (ICC), and ${tex`K`} is the total number of clusters per arm.

**Answer:** Subjects within the same cluster may be more similar to each other than to subjects in other clusters. This correlation leads to an increase in the variance compared to simple random sampling.

This: ${tex`\left[ 1 + (m - 1) \rho \right]`} is known as the **inflation effect** or **design effect**

What is the difference? Does this matter?

```js
const sigma_var = Inputs.range([0, 10], {
  value: 0.1,
  step: 0.1,
  label: tex`\text{standard dev.}:~\sigma`,
});
view(sigma_var);

const n_var = Inputs.range([0, 1000], {
  value: 30,
  step: 0.1,
  label: tex`\text{num subjects}:~n`,
});
view(n_var);

const k_var = Inputs.range([0, 10], {
  value: 3,
  step: 1,
  label: tex`\text{num of clusters}:~k`,
});
view(k_var);

const m_var = Inputs.range([0, 10], {
  value: 5,
  step: 1,
  label: tex`\text{subj. per cluster}:~m`,
});
view(m_var);

const rho_var = Inputs.range([0, 1], {
  value: 0.1,
  step: 0.05,
  label: tex`\text{ICC}:~\rho`,
});
view(rho_var);
```

```js
const sigma_var_selection = Generators.input(sigma_var);
const n_var_selection = Generators.input(n_var);
const k_var_selection = Generators.input(k_var);
const m_var_selection = Generators.input(m_var);
const rho_var_selection = Generators.input(rho_var);
```

For equivalence, set ${tex`n=k \cdot m`}

```js
const variance1 = calculateVarianceFormulaIndividualRandomized(
  sigma_var_selection,
  n_var_selection
);
const variance2 = calculateVarianceFormulaClusterRandomized(
  sigma_var_selection,
  k_var_selection,
  m_var_selection,
  rho_var_selection
);
```

^ ICC: intra-cluster correlation coefficient.
${tex`\text{Var}_\text{Individual}=` } ${variance1.toFixed(3)}
${tex`\text{Var}_\text{cluster}=` } ${variance2.toFixed(3)}

```js
const variables = [
  { name: tex`n`, variable: "n", range: d3.range(1, 100, 0.1) },
  { name: tex`k`, variable: "k", range: d3.range(1, 10, 0.1) },
  { name: tex`m`, variable: "m", range: d3.range(1, 20, 0.1) },
  { name: tex`\rho`, variable: "rho", range: d3.range(0, 1.1, 0.1) },
];
const favorite = Inputs.radio(variables, {
  label: "Pick a variable",
  format: (x) => x.name,
  value: variables[2],
});
view(favorite);
const favorite_selection = Generators.input(favorite);
```

```js
// Generate data
const unifiedData = generateUnifiedVarianceData(
  favorite_selection.variable,
  favorite_selection.range,
  sigma_var_selection,
  k_var_selection,
  m_var_selection,
  rho_var_selection,
  n_var_selection
);
```

```js
const variance_comparison = Plot.plot({
  grid: true,
  marginLeft: 80,
  x: { label: favorite_selection.variable },
  y: { label: "Variance" },
  color: {
    legend: true,
    domain: ["Individual Variance", "Cluster Variance", "Variance Delta"],
  },
  marks: [
    Plot.line(unifiedData, {
      x: "x",
      y: "variance",
      stroke: "variance_type",
    }),
    Plot.frame(),
    Plot.gridY({
      strokeDasharray: "0.75,2", // dashed
      strokeOpacity: 1, // opaque
    }),
    Plot.axisY([0]),
  ],
});
view(variance_comparison);
```
