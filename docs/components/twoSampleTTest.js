import { require } from "d3-require";
const jStat = await require("jstat@1.9.4");

export function twoSampleTTest(data, column, groupColumn, group1, group2) {
  const group1Data = data.filter((row) => row[groupColumn] === group1);
  const group2Data = data.filter((row) => row[groupColumn] === group2);

  const mean1 =
    group1Data.reduce((sum, row) => sum + row[column], 0) / group1Data.length;
  const mean2 =
    group2Data.reduce((sum, row) => sum + row[column], 0) / group2Data.length;

  const var1 =
    group1Data.reduce((sum, row) => sum + Math.pow(row[column] - mean1, 2), 0) /
    (group1Data.length - 1);
  const var2 =
    group2Data.reduce((sum, row) => sum + Math.pow(row[column] - mean2, 2), 0) /
    (group2Data.length - 1);

  const pooledVar =
    ((group1Data.length - 1) * var1 + (group2Data.length - 1) * var2) /
    (group1Data.length + group2Data.length - 2);

  const tValue =
    (mean1 - mean2) /
    Math.sqrt(pooledVar * (1 / group1Data.length + 1 / group2Data.length));
  const df = group1Data.length + group2Data.length - 2;
  const pValue = 2 * (1 - jStat.studentt.cdf(Math.abs(tValue), df));

  return { mean1, mean2, tValue, pValue, df };
}

// Example usage
// const data = [
//   { group: "A", value: 10 },
//   { group: "A", value: 12 },
//   { group: "B", value: 14 },
//   { group: "B", value: 16 },
// ];
// const result = twoSampleTTest(data, "value", "group", "A", "B");
// console.log(result);
