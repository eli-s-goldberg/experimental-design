import * as Plot from "npm:@observablehq/plot";
import * as d3 from "d3";
import { require } from "d3-require";
const jStat = await require("jstat@1.9.4");
const math = await require("mathjs@9.4.2");
import * as tf from "@tensorflow/tfjs";
import { DataFrame } from "./DataFrame.js";

export class ExperimentalDesign {
  constructor(dataFrame, options = {}) {
    if (!dataFrame || typeof dataFrame !== "object") {
      throw new Error("DataFrame must be provided");
    }

    this.df = dataFrame;
    this.filters = options.filters || [];
  }

  // Create Table 1 with descriptive statistics
  createTable1(treatmentVar, controlVar, covariates) {
    // Validate inputs
    if (!Array.isArray(covariates)) {
      throw new Error("covariates must be an array");
    }
    if (!treatmentVar || !controlVar) {
      throw new Error("treatmentVar and controlVar must be provided");
    }

    const table1 = {};
    const n = this.df._length;

    // Helper function to calculate group statistics
    const calculateGroupStats = (groupVar, groupValue) => {
      const stats = {};
      let groupCount = 0;

      for (const covariate of covariates) {
        const values = [];
        for (let i = 0; i < n; i++) {
          if (this.df._data[groupVar][i] === groupValue) {
            const val = this.df._data[covariate][i];
            if (typeof val === "number" && !isNaN(val)) {
              values.push(val);
            }
          }
        }

        if (values.length > 0) {
          const mean = values.reduce((a, b) => a + b, 0) / values.length;
          const sd = Math.sqrt(
            values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
              (values.length - 1)
          );
          stats[covariate] = {
            n: values.length,
            mean: mean.toFixed(2),
            sd: sd.toFixed(2),
          };
          groupCount = values.length;
        }
      }

      return { stats, count: groupCount };
    };

    // Calculate statistics for treatment and control groups
    const treatmentStats = calculateGroupStats(treatmentVar, 1);
    const controlStats = calculateGroupStats(controlVar, 1);

    // Combine into final table
    for (const covariate of covariates) {
      table1[covariate] = {
        treatment: treatmentStats.stats[covariate],
        control: controlStats.stats[covariate],
      };
    }

    // Add sample sizes
    table1.sampleSize = {
      treatment: treatmentStats.count,
      control: controlStats.count,
    };

    return table1;
  }

  // Identify control group using propensity score matching
  identifyControlGroup(config = {}) {
    // Validate config
    if (!config.method || !config.options) {
      throw new Error("Config must include method and options");
    }

    const { method, options } = config;

    if (method === "propensityMatching") {
      const { treatmentVar, covariates } = options;

      if (
        !treatmentVar ||
        !Array.isArray(covariates) ||
        covariates.length === 0
      ) {
        throw new Error(
          "treatmentVar and covariates array must be provided for propensity matching"
        );
      }

      // Build design matrix
      const { X, y } = this._buildDesignMatrix(covariates, treatmentVar);
      console.log(
        `Built design matrix with ${X.length} rows and ${X[0].length} columns`
      );

      // Fit logistic regression
      const model = this._fitLogisticRegression(X, y);
      console.log("Fitted logistic regression model");

      // Calculate propensity scores
      const scores = X.map((row) => {
        const logit = row.reduce(
          (acc, val, idx) => acc + val * model.beta[idx],
          0
        );
        return 1 / (1 + Math.exp(-logit));
      });

      // Match treatment to control
      const treatmentIndices = [];
      const controlIndices = [];

      for (let i = 0; i < this.df._length; i++) {
        const treatmentValue = this.df._data[treatmentVar][i];
        if (treatmentValue === 1) {
          treatmentIndices.push(i);
        } else if (treatmentValue === 0) {
          controlIndices.push(i);
        }
      }

      console.log(
        `Found ${treatmentIndices.length} treatment cases and ${controlIndices.length} control cases`
      );

      // Find matches using nearest neighbor
      const matches = new Set();
      treatmentIndices.forEach((tIdx) => {
        let bestMatch = -1;
        let minDist = Infinity;

        controlIndices.forEach((cIdx) => {
          if (!matches.has(cIdx)) {
            const dist = Math.abs(scores[tIdx] - scores[cIdx]);
            if (dist < minDist) {
              minDist = dist;
              bestMatch = cIdx;
            }
          }
        });

        if (bestMatch !== -1) {
          matches.add(bestMatch);
        }
      });

      console.log(`Matched ${matches.size} control cases`);

      // Create new DataFrame with matched controls
      const matchedIndices = Array.from(matches);
      const matchedData = {};

      Object.keys(this.df._data).forEach((col) => {
        matchedData[col] = matchedIndices.map((idx) => this.df._data[col][idx]);
      });

      return new DataFrame(matchedData);
    }

    throw new Error(`Unsupported matching method: ${method}`);
  }

  _buildDesignMatrix(predictors, dependentVar) {
    if (!Array.isArray(predictors)) {
      throw new Error("predictors must be an array");
    }

    const X = [];
    const y = [];
    const n = this.df._length;

    for (let i = 0; i < n; i++) {
      const row = [1]; // Intercept term
      let validRow = true;

      // Add predictor values
      for (const predictor of predictors) {
        const value = this.df._data[predictor][i];
        if (typeof value === "number" && !isNaN(value)) {
          row.push(value);
        } else {
          validRow = false;
          break;
        }
      }

      // Add dependent variable value
      const yValue = this.df._data[dependentVar][i];
      if (typeof yValue !== "number" || isNaN(yValue)) {
        validRow = false;
      }

      if (validRow) {
        X.push(row);
        y.push(yValue);
      }
    }

    return { X, y };
  }

  _fitLogisticRegression(X, y) {
    const maxIter = 100;
    const learningRate = 0.1;
    const tol = 1e-6;

    // Initialize coefficients
    let beta = new Array(X[0].length).fill(0);
    let prevLoss = Infinity;

    for (let iter = 0; iter < maxIter; iter++) {
      // Compute predictions
      const preds = X.map((row) => {
        const z = row.reduce((acc, val, idx) => acc + val * beta[idx], 0);
        return 1 / (1 + Math.exp(-z));
      });

      // Compute gradients
      const grads = new Array(beta.length).fill(0);
      for (let i = 0; i < X.length; i++) {
        const error = y[i] - preds[i];
        X[i].forEach((val, idx) => {
          grads[idx] += error * val;
        });
      }

      // Update coefficients
      beta = beta.map((b, idx) => b + learningRate * grads[idx]);

      // Check convergence
      const loss = preds.reduce((acc, p, i) => {
        return acc - (y[i] * Math.log(p) + (1 - y[i]) * Math.log(1 - p));
      }, 0);

      if (Math.abs(loss - prevLoss) < tol) break;
      prevLoss = loss;
    }

    return { beta };
  }

  addFilter(condition) {
    this.filters.push(condition);
    return this;
  }

  applyFilters() {
    let filtered = this.df;
    this.filters.forEach((filter) => {
      filtered = filtered.loc(filter);
    });
    return filtered;
  }
}
