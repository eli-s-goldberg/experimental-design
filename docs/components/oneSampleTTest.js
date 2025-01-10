import { require } from "d3-require";
const jStat = await require("jstat@1.9.4");

export function oneSampleTTest(data, column, hypothesizedMean) {
  const values = data.map((row) => row[column]);
  const n = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const stdDev = Math.sqrt(
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (n - 1)
  );
  const tValue = (mean - hypothesizedMean) / (stdDev / Math.sqrt(n));
  const pValue = 2 * (1 - jStat.studentt.cdf(Math.abs(tValue), n - 1));

  return { mean, stdDev, tValue, pValue, df: n - 1 };
}

// Example usage
// const data = [{ value: 10 }, { value: 12 }, { value: 14 }, { value: 11 }];
// const result = oneSampleTTest(data, "value", 12);
// console.log(result);
