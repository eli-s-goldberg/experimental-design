import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import { html } from "htl";
import _ from "lodash";

const colorMap = new Map(
  [
    ["ordinal", "rgba(78, 121, 167, 1)"],
    ["continuous", "rgba(242, 142, 44, 1)"],
    ["date", "rgba(225, 87, 89, 1)"],
  ].map((d) => {
    const col = d3.color(d[1]);
    const color_copy = _.clone(col);
    color_copy.opacity = 0.6;
    return [d[0], { color: col.formatRgb(), brighter: color_copy.formatRgb() }];
  })
);

function getType(data, column) {
  for (const d of data) {
    const value = d[column];
    if (value == null) continue;
    if (typeof value === "number") return "continuous";
    if (value instanceof Date) return "date";
    return "ordinal";
  }
  return "ordinal";
}

function addTooltips(chart, styles) {
  const stroke_styles = { stroke: "blue", "stroke-width": 3 };
  const fill_styles = { fill: "blue", opacity: 0.5 };

  const type = d3.select(chart).node().tagName;
  let wrapper =
    type === "FIGURE" ? d3.select(chart).select("svg") : d3.select(chart);

  const svgs = d3.select(chart).selectAll("svg");
  if (svgs.size() > 1) wrapper = d3.select([...svgs].pop());
  wrapper.style("overflow", "visible");

  wrapper.selectAll("path").each(function () {
    if (
      d3.select(this).attr("fill") === null ||
      d3.select(this).attr("fill") === "none"
    ) {
      d3.select(this).style("pointer-events", "visibleStroke");
      if (styles === undefined) styles = stroke_styles;
    }
  });

  if (styles === undefined) styles = fill_styles;

  const tip = wrapper
    .selectAll(".hover")
    .data([1])
    .join("g")
    .attr("class", "hover")
    .style("pointer-events", "none")
    .style("text-anchor", "middle");

  const id = id_generator();

  d3.select(chart).classed(id, true);

  wrapper.selectAll("title").each(function () {
    const title = d3.select(this);
    const parent = d3.select(this.parentNode);
    const t = title.text();
    if (t) {
      parent.attr("__title", t).classed("has-title", true);
      title.remove();
    }

    parent
      .on("pointerenter pointermove", function (event) {
        const text = d3.select(this).attr("__title");
        const pointer = d3.pointer(event, wrapper.node());
        if (text) tip.call(hover, pointer, text.split("\n"));
        else tip.selectAll("*").remove();

        d3.select(this).raise();
        const tipSize = tip.node().getBBox();
        if (pointer[0] + tipSize.x < 0)
          tip.attr(
            "transform",
            `translate(${tipSize.width / 2}, ${pointer[1] + 7})`
          );
        else if (pointer[0] + tipSize.width / 2 > wrapper.attr("width"))
          tip.attr(
            "transform",
            `translate(${wrapper.attr("width") - tipSize.width / 2}, ${
              pointer[1] + 7
            })`
          );
      })
      .on("pointerout", function () {
        tip.selectAll("*").remove();
        d3.select(this).lower();
      });
  });

  wrapper.on("touchstart", () => tip.selectAll("*").remove());

  chart.appendChild(html`<style>
    .${id} .has-title { cursor: pointer;  pointer-events: all; }
    .${id} .has-title:hover { ${Object.entries(styles)
      .map(([key, value]) => `${key}: ${value};`)
      .join(" ")} }
    .hover {
      position: fixed;
      pointer-events: none;
      z-index: 1000;
    }
    .hover rect { background: white; }
    .hover text { fill: black; }
  </style>`);

  return chart;
}

function hover(tip, pos, text) {
  const side_padding = 10;
  const vertical_padding = 5;
  const vertical_offset = 15;

  tip.selectAll("*").remove();

  tip
    .style("text-anchor", "middle")
    .style("pointer-events", "none")
    .attr("transform", `translate(${pos[0]}, ${pos[1] + 7})`)
    .selectAll("text")
    .data(text)
    .join("text")
    .style("dominant-baseline", "ideographic")
    .text((d) => d)
    .attr("y", (d, i) => (i - (text.length - 1)) * 15 - vertical_offset)
    .style("font-weight", (d, i) => (i === 0 ? "bold" : "normal"));

  const bbox = tip.node().getBBox();

  tip
    .append("rect")
    .attr("y", bbox.y - vertical_padding)
    .attr("x", bbox.x - side_padding)
    .attr("width", bbox.width + side_padding * 2)
    .attr("height", bbox.height + vertical_padding * 2)
    .style("fill", "white")
    .style("stroke", "#d3d3d3")
    .lower();
}

function id_generator() {
  var S4 = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return "a" + S4() + S4();
}

function SmallStack(categoryData, col, maxCategories = 100) {
  let chartData = categoryData;
  if (chartData.length > maxCategories) {
    chartData = categoryData.slice(0, maxCategories);
    const total = d3.sum(categoryData, (d) => d.count);
    const otherCount = total - d3.sum(chartData, (d) => d.count);
    chartData.push({
      [col]: "Other categories...",
      count: otherCount,
      pct: otherCount / total,
    });
  }

  const pct_format = d3.format(".1%");
  return addTooltips(
    Plot.plot({
      height: 30,
      width: 205,
      x: { axis: null },
      color: {
        scheme: "blues",
        reverse: true,
      },
      marks: [
        Plot.barX(chartData, {
          x: "count",
          fill: col,
          title: (d) => `${d[col]}\n${pct_format(d.pct)}`,
        }),
        Plot.text([0, 0], {
          x: 0,
          frameAnchor: "bottom",
          dy: 10,
          text: () => `${d3.format(",.0f")(chartData.length)} categories`,
        }),
      ],
      style: {
        paddingTop: "0px",
        paddingBottom: "15px",
        textAnchor: "start",
        overflow: "visible",
      },
      y: {
        axis: null,
        range: [30, 3],
      },
    }),
    { fill: "darkblue" }
  );
}

function Histogram(data, col, type = "continuous") {
  const barColor = colorMap.get(type).brighter;
  const mean = d3.mean(data, (d) => d[col]);

  const extent = d3.extent(data, (d) => d[col]);
  const format =
    type === "date"
      ? getDateFormat(extent)
      : Math.floor(extent[0]) === Math.floor(extent[1])
      ? d3.format(",.2f")
      : d3.format(",.0f");

  return addTooltips(
    Plot.plot({
      height: 55,
      width: 240,
      x: {
        label: "",
        ticks: extent,
        tickFormat: format,
      },
      y: { axis: null },
      marks: [
        Plot.rectY(
          data,
          Plot.binX(
            {
              y: "count",
              title: (elems) => {
                const [start, end] = d3.extent(elems, (d) => d[col]);
                return `${elems.length} rows\n[${format(start)} to ${format(
                  end
                )}]`;
              },
            },
            { x: col, fill: barColor }
          )
        ),
        Plot.ruleY([0]),
        Plot.ruleX([{ value: mean }], {
          strokeWidth: 1,
          title: () => `mean ${col}: ${format(mean)}`,
        }),
      ],
      style: {
        marginLeft: -17,
        background: "none",
        overflow: "visible",
      },
    }),
    { opacity: 1, fill: colorMap.get(type).color }
  );
}

function SummaryCard(data, label = "Summary") {
  const sample = data[0] || {};
  const cols = data.columns || Object.keys(sample);
  const col_data = cols.map((d) => {
    return {
      label: d === "" ? "unlabeled" : d,
      type: getType(data, d),
    };
  });
  const n_columns = col_data.length;
  const n_rows = data.length;

  const header_plot = addTooltips(
    Plot.cellX(col_data, {
      fill: (d) => colorMap.get(d.type).color,
      title: (d) => `${d.label}\n(${d.type})`,
    }).plot({
      x: { axis: null },
      width: 100,
      height: 10,
      color: {
        domain: [...colorMap.values()].map((d) => d.color),
      },
      style: {
        overflow: "visible",
      },
    }),
    { stroke: "black", "stroke-width": "3px" }
  );

  const col_plot = Plot.cellX(col_data, {
    fill: (d) => colorMap.get(d.type).color,
    fillOpacity: 0.3,
  }).plot({
    x: { axis: null },
    width: 100,
    height: 80,
    color: {
      domain: [...colorMap.values()].map((d) => d.color),
    },
  });

  const arrow_styles = {
    display: "inline-block",
    verticalAlign: "top",
    transformOrigin: "0 0",
    transform: "rotate(90deg)",
    marginTop: "20px",
    position: "absolute",
    left: "114px",
    top: "54px",
  };

  const ele = html`<div
    style="font-family:sans-serif; font-size:13px; margin-right:10px;"
  >
    <span style="font-size:1.3em">${label}</span>
    <div>${d3.format(",.0f")(n_columns)} ⟶</div>
    ${header_plot}
    <span style="display:inline-block">${col_plot}</span>
    <span style="display:inline-block; vertical-align:top;"
      >${d3.format(",.0f")(n_rows)}<br
    /></span>
    <span style=${arrow_styles}>⟶</span>
  </div>`;

  ele.value = { n_rows, n_columns };
  return ele;
}

function SummarizeColumn(data, col, tableStyles = {}) {
  let content,
    value,
    format,
    finiteFormat,
    el,
    chart,
    missing_label,
    pct_missing,
    min,
    max,
    median,
    mean,
    sd;
  const notFiniteFormat = d3.format(",.0f");

  const type = getType(data, col);

  const col1 = html`<td
    style="white-space: nowrap;vertical-align:middle;padding-right:5px;padding-left:3px;"
  >
    ${icon_fns[type]()}<strong style="vertical-align:middle;"
      >${col === "" ? "unlabeled" : col}</strong
    >
  </td>`;

  switch (type) {
    case "ordinal":
      format = d3.format(",.0f");

      const categories = d3
        .rollups(
          data,
          (v) => ({ count: v.length, pct: v.length / data.length || 1 }),
          (d) => d[col]
        )
        .sort((a, b) => b[1].count - a[1].count)
        .map((d) => {
          let obj = {};
          obj[col] = d[0] === null || d[0] === "" ? "(missing)" : d[0];
          obj.count = d[1].count;
          obj.pct = d[1].pct;
          return obj;
        });

      pct_missing =
        data.filter((d) => d[col] === null || d[col] === "").length /
        data.length;

      const stack_chart = SmallStack(categories, col);

      el = html`<tr style="font-family:sans-serif;font-size:13px;">
        ${col1}
        <td><div style="position:relative;">${stack_chart}</div></td>
        <td>${pct_format(pct_missing)}</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </tr>`;

      value = {
        column: col,
        type,
        min: null,
        max: null,
        mean: null,
        median: null,
        sd: null,
        missing: pct_missing,
        n_categories: categories.length,
      };
      break;

    case "date":
      const start = d3.min(data, (d) => +d[col]);
      const end = d3.max(data, (d) => +d[col]);
      mean = d3.mean(data, (d) => +d[col]);
      median = d3.median(data, (d) => +d[col]);
      sd = d3.deviation(data, (d) => +d[col]);

      pct_missing =
        data.filter((d) => d[col] === null || d[col] === "").length /
        data.length;
      chart = Histogram(data, col, type);

      el = html`<tr style="font-family:sans-serif;font-size:13px;">
        ${col1}
        <td><div style="position:relative;">${chart}</div></td>
        <td>${pct_format(pct_missing)}</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </tr>`;
      value = {
        column: col,
        type,
        min: start,
        max: end,
        mean: null,
        median: null,
        sd: null,
        missing: pct_missing,
        n_categories: null,
      };
      break;

    default:
      min = d3.min(data, (d) => +d[col]);
      max = d3.max(data, (d) => +d[col]);
      mean = d3.mean(data, (d) => +d[col]);
      median = d3.median(data, (d) => +d[col]);
      sd = d3.deviation(data, (d) => +d[col]);
      if (Number.isFinite(sd)) {
        finiteFormat = d3.format(",." + d3.precisionFixed(sd / 10) + "f");
        format = (x) =>
          Number.isFinite(x) ? finiteFormat(x) : notFiniteFormat(x);
      } else {
        format = notFiniteFormat;
      }
      pct_missing =
        data.filter((d) => d[col] === null || isNaN(d[col])).length /
        data.length;

      chart = Histogram(data, col, type);
      el = html`<tr style="font-family:sans-serif;font-size:13px;">
        ${col1}
        <td><div style="position:relative;top:3px;">${chart}</div></td>
        <td>${pct_format(pct_missing)}</td>
        <td>${format(mean)}</td>
        <td>${format(median)}</td>
        <td>${format(sd)}</td>
      </tr>`;

      value = {
        column: col,
        type,
        min,
        max,
        mean,
        median,
        sd,
        missing: pct_missing,
        n_categories: null,
      };
      break;
  }
  el.value = value;
  el.appendChild(
    html`<style>
      td {
        vertical-align: middle;
      }
    </style>`
  );
  return el;
}

export function SummaryTable(
  dataObj,
  { label = "Summary", width = 800, tableStyles = {} } = {}
) {
  const data =
    typeof dataObj.numRows === "function"
      ? dataObj.objects()
      : typeof dataObj.toArray === "function"
      ? dataObj.toArray().map((r) => Object.fromEntries(r))
      : dataObj;
  const sample = data[0] || {};
  const cols = data.columns || Object.keys(sample);
  let value = [];

  const summaryCard = SummaryCard(data, label);
  value.n_rows = summaryCard.value.n_rows;
  value.n_columns = summaryCard.value.n_columns;
  value.columns = cols;

  // Apply table styles
  const customStyles = html`<style>
    .summary-table {
      border-collapse: collapse;
      width: 100%;
      border-radius: ${tableStyles.tableBorderRadius || "8px"};
      overflow: hidden;
      position: relative;
    }
    .summary-table thead {
      position: sticky;
      top: 0;
      z-index: 100;
      background-color: ${tableStyles.headerBackground || "#f5f5f5"};
    }
    .summary-table thead th {
      background-color: ${tableStyles.headerBackground || "#f5f5f5"};
      color: ${tableStyles.headerTextColor || "#333"};
      height: ${tableStyles.headerHeight || "40px"};
      padding: 8px 12px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #ddd;
    }
    .summary-table tbody td {
      padding: 8px 12px;
      background-color: white;
      border-bottom: 1px solid #ddd;
      height: ${tableStyles.rowHeight || "auto"};
      vertical-align: ${tableStyles.verticalAlign || "middle"};
    }
    .summary-table tbody tr:last-child td {
      border-bottom: none;
    }
  </style>`;

  const element = html`<div style="display:inline-block; vertical-align:top;">
      ${summaryCard}
    </div>
    <div
      style="display:inline-block; max-width:${width < 500
        ? width
        : width - 160}px"
    >
      ${customStyles}
      <table
        class="summary-table"
        style="vertical-align:middle; display:block;overflow-x:auto; max-width:${width}px;"
      >
        <thead>
          <th>Column</th>
          <th style="min-width:250px">Snapshot</th>
          <th>Missing</th>
          <th>Mean</th>
          <th>Median</th>
          <th>SD</th>
        </thead>
        ${cols.map((d) => {
          const ele = SummarizeColumn(data, d, tableStyles);
          value.push(ele.value);
          return ele;
        })}
      </table>
    </div>`;
  element.value = value;
  return element;
}

function pct_format(x) {
  return d3.format(".1%")(x);
}

function getDateFormat(extent) {
  const formatMillisecond = d3.utcFormat(".%L"),
    formatSecond = d3.utcFormat(":%S"),
    formatMinute = d3.utcFormat("%I:%M"),
    formatHour = d3.utcFormat("%I %p"),
    formatDay = d3.utcFormat("%a %d"),
    formatWeek = d3.utcFormat("%b %d"),
    formatMonth = d3.utcFormat("%B"),
    formatYear = d3.utcFormat("%Y");

  return extent[1] > d3.utcYear.offset(extent[0], 1)
    ? formatYear
    : extent[1] > d3.utcMonth.offset(extent[0], 1)
    ? formatMonth
    : extent[1] > d3.utcWeek.offset(extent[0], 1)
    ? formatWeek
    : extent[1] > d3.utcDay.offset(extent[0], 1)
    ? formatDay
    : extent[1] > d3.utcHour.offset(extent[0], 1)
    ? formatHour
    : extent[1] > d3.utcMinute.offset(extent[0], 1)
    ? formatMinute
    : extent[1] > d3.utcSecond.offset(extent[0], 1)
    ? formatSecond
    : formatMillisecond;
}

const icon_fns = {
  ordinal: () => html`<div
    style="display:inline-block; border-radius:100%; width: 16px; height: 16px; background-color: ${colorMap.get(
      "ordinal"
    )
      .color}; transform: scale(1.3); vertical-align: middle; align-items: center; margin-right:8px;"
  >
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="4" y="4" width="2" height="2" fill="white" />
      <rect x="7" y="4" width="6" height="2" fill="white" />
      <rect x="4" y="7" width="2" height="2" fill="white" />
      <rect x="7" y="7" width="6" height="2" fill="white" />
      <rect x="4" y="10" width="2" height="2" fill="white" />
      <rect x="7" y="10" width="6" height="2" fill="white" />
    </svg>
  </div>`,

  date: () => html`<div
    style="display:inline-block; border-radius:100%; width: 16px; height: 16px; background-color: ${colorMap.get(
      "date"
    )
      .color}; transform: scale(1.3); vertical-align: middle; align-items: center; margin-right:8px;"
  >
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="4" y="5" width="8" height="1" fill="white" />
      <rect x="5" y="4" width="2" height="1" fill="white" />
      <rect x="9" y="4" width="2" height="1" fill="white" />
      <rect x="4" y="7" width="8" height="5" fill="white" />
    </svg>
  </div>`,

  continuous: () => html`<div
    style="display:inline-block; border-radius:100%; width: 16px; height: 16px; background-color: ${colorMap.get(
      "continuous"
    )
      .color}; transform: scale(1.3); vertical-align: middle; align-items: center; margin-right:8px;"
  >
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="4"
        y="12"
        width="4"
        height="2"
        transform="rotate(-90 4 12)"
        fill="white"
      />
      <rect
        x="7"
        y="12"
        width="6"
        height="2"
        transform="rotate(-90 7 12)"
        fill="white"
      />
      <rect
        x="10"
        y="12"
        width="8"
        height="2"
        transform="rotate(-90 10 12)"
        fill="white"
      />
    </svg>
  </div>`,
};
