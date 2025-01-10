---
toc: false
theme: [air, wide]
title: Summary
---

```js
import { DataFrame } from "./components/DataFrame.js";
```

```js
import { defaultStyles } from "./components/styles.js";
const styleElement = html`<style>
  ${defaultStyles}
</style>`;
document.head.appendChild(styleElement);
```

```js
const data = FileAttachment("./data/us-state-population-2010-2019.csv").csv({
  typed: true,
});
```

```js
const murder = FileAttachment("./data/gunviolence-2024.csv").csv({
  typed: true,
});
```

```js
import { SummaryTable } from "./components/SummaryTable.js";
```

```js
view(
  SummaryTable(data, {
    width: 800,
    tableStyles: {
      rowHeight: "100px",
      headerHeight: "50px",
      headerBackground: "#333333",
      headerTextColor: "#ffffff",
      tableBorderRadius: "18px",
    },
  })
);
```

```js
view(
  SummaryTable(murder, {
    width: 800,
    tableStyles: {
      rowHeight: "100px",
      headerHeight: "50px",
      headerBackground: "#333333",
      headerTextColor: "#ffffff",
      tableBorderRadius: "18px",
    },
  })
);
```
