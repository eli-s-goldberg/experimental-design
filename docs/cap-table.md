---
title: Cap Table
toc: true
---

```js
import {
  CapTable, Asset, InvestmentStage, InvestmentTimeline
} from "./components/CapTable.js"
```


```js

// Example Usage:

// Initialize Cap Table
const capTable = new CapTable();

// Adding example entries
const employee1 = new Asset("option", "common", "employee");
const employee2 = new Asset("stock", "common", "employee");

capTable.addEntry(employee1, 1000, 10 * 1000, "2024-01-01");
capTable.addEntry(employee2, 500, 10 * 500, "2024-01-01");

// Remove stock/options for leaving employees
// Employee 1 leaves without purchasing options
capTable.removeEntry("employee", 500, false);

// Employee 2 leaves and purchases stock
capTable.removeEntry("employee", 300, true, 15.0); // Purchased at $15/share


```

```js
// Example usage:
const formation = new InvestmentStage("Formation", 100000, 100000, 1.0);
const founder1 = new Asset("stock", "common", "founder");
const founder2 = new Asset("stock", "common", "founder");

formation.addOwnership(founder1, 80000);
formation.addOwnership(founder2, 20000);

const seriesA = new InvestmentStage("Series A", 50000, 500000, 10.0);
const investor = new Asset("stock", "preferred", "investor");
seriesA.addOwnership(investor, 50000);

const timeline = new InvestmentTimeline();
view(capTable)
```