---
toc: true
---

# FEMA

<div class ="note">
Ok. This is _obviously_ unfinished, but I'm going to upload it anyway... 
</div>

Hurricanes are absoultely NO joke. Helene was super destructive. However, what may be even _more_ destructive, is a voting body that puts party over people.

Let's do some investigation of voting record for FEMA.

## The Act in question: H.R.255 - Federal Disaster Assistance Coordination Act

https://www.congress.gov/bill/118th-congress/house-bill/255/text

## The plot

```js
function row_assignments() {
  let arr = [];
  let r = 0;
  const row_max = [8, 9, 10, 11, 12];
  const row_count = [0, 0, 0, 0, 0];

  for (let i = 0; i < 50; i++) {
    while (row_count[r] == row_max[r]) r = (r + 1) % 5;
    row_count[r] += 1;
    arr[i] = r;
    r = (r + 1) % 5;
  }

  return arr;
}

// const width = 800; // Adjust as needed
const height = 500; // Adjust as needed
const senator_radius = 4; // Adjust as needed
```

```js
// let's cobble together the original method into one that works in framework.
async function get_senators() {
  const data = await d3.json(
    "https://theunitedstates.io/congress-legislators/legislators-current.json"
  );

  const senators = data
    .map(({ name, id, terms }) => ({
      name,
      bioguide: id.bioguide,
      ...terms[terms.length - 1],
    }))
    .filter((d) => d.type === "sen")
    .sort((a, b) => (a.party < b.party ? -1 : 1))
    .reverse();

  return senators;
}

const senators = await get_senators();
```

```js
const senator_radius = 14;
const images = true;

const legendItems = ["Democrat", "Republican", "Independent"];

function color(party) {
  switch (party) {
    case "Democrat":
      return "blue";
    case "Republican":
      return "red";
    case "Independent":
      return "green";
    default:
      return "gray";
  }
}

function angle(i) {
  return -(Math.PI / 2) * (position_in_row(i) / (senators_in_row(i) - 1));
}

function senators_in_row(i) {
  return 8 + row(i);
}

function position_in_row(i) {
  let pos = 0;
  for (let j = 50; j > i; j--) {
    if (row(j) == row(i)) pos++;
  }
  return pos;
}

function row(i) {
  return row_assignments()[i];
}

function radius(i) {
  return row(i) * senator_radius * 6 + 200;
}

function row_assignments() {
  let arr = [];
  let r = 0;
  const row_max = [8, 9, 10, 11, 12];
  const row_count = [0, 0, 0, 0, 0];

  for (let i = 0; i < 50; i++) {
    while (row_count[r] == row_max[r]) r = (r + 1) % 5;
    row_count[r] += 1;
    arr[i] = r;
    r = (r + 1) % 5;
  }

  return arr;
}

function x(i) {
  const j = i < 50 ? i : i - 50;
  const offset = Math.cos(angle(j)) * radius(j) + senator_radius * 3;
  return width / 2 + (i < 50 ? offset : -offset);
}

function y(i) {
  const j = i < 50 ? i : i - 50;
  return height - senator_radius + 50 + Math.sin(angle(j)) * radius(j);
}

function senate_plot(senators) {
  const height = 2000;
  const width = 2000;
  // const margin = { top: 200, right: 20, bottom: 20, left: 20 };

  const svg = d3.create("svg").attr("width", width).attr("height", height);
  // .attr("transform", `translate(${margin.left},${margin.top})`);

  svg
    .append("defs")
    .append("clipPath")
    .attr("id", "clip-circle")
    .append("circle")
    .attr("cx", senator_radius)
    .attr("cy", senator_radius)
    .attr("r", senator_radius);

  const sens = svg
    .selectAll("g.senator")
    .data(senators)
    .enter()
    .append("g")
    .attr("class", "senator")
    .attr("transform", (d, i) => `translate(${x(i)}, ${y(i)})`);

  // Outer circle with party color
  sens
    .append("circle")
    .attr("r", senator_radius + 2)
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("fill", (d) => color(d.party))
    .append("title")
    .text((d) => d.name.official_full);

  // Inner white circle
  sens
    .append("circle")
    .attr("r", senator_radius + 1)
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("fill", "rgba(255, 255, 255, 0.8)")
    .append("title")
    .text((d) => d.name.official_full);

  // Senator's image
  if (images) {
    sens
      .append("g")
      .attr("clip-path", "url(#clip-circle)")
      .attr("transform", `translate(${-senator_radius}, ${-senator_radius})`)
      .append("image")
      .attr(
        "xlink:href",
        (d) =>
          `https://theunitedstates.io/images/congress/225x275/${d.bioguide}.jpg`
      )
      .attr("width", senator_radius * 2)
      .attr("height", senator_radius * 2)
      .append("title")
      .text((d) => d.name.official_full);
  }

  // Add labels beneath each image
  sens
    .append("text")
    .attr("x", 0)
    .attr("y", senator_radius + 12) // Increased spacing
    .attr("text-anchor", "middle")
    .attr("font-size", "8px") // Increased font size
    .attr("fill", "black") // Ensure text is visible
    .text((d) => d.name.last)
    .append("title")
    .text((d) => d.name.official_full);

  // // Append the legend
  // const legend = svg
  //   .append("g")
  //   .attr("transform", `translate(${width - 125}, 20)`)
  //   .selectAll("g.legend")
  //   .data(legendItems)
  //   .enter()
  //   .append("g")
  //   .attr("class", "legend")
  //   .attr("transform", (d, i) => `translate(0, ${i * 25})`);

  // legend
  //   .append("rect")
  //   .attr("x", 0)
  //   .attr("y", -5)
  //   .attr("width", 10)
  //   .attr("height", 10)
  //   .attr("fill", (d) => color(d));

  // legend
  //   .append("text")
  //   .attr("x", 15)
  //   .attr("alignment-baseline", "middle")
  //   .text((d) => d);

  return svg.node();
}
```

<style>
.aspectwrapper {
  display: inline-block; /* shrink to fit */
  width: 100%;           /* whatever width you like */
  position: relative;    /* so .content can use position: absolute */
}
.aspectwrapper::after {
  padding-top: 56.25%; /* percentage of containing block _width_ */
  display: block;
  content: '';
}
.content {
  position: absolute;
  top: 0; bottom: 0; right: 0; left: 0;  /* follow the parent's edges */
  outline: thin dashed green;            /* just so you can see the box */
}
</style>

<div class="aspectwrapper">
  <div class="content" style="width: 100%; height: 100%;">

```js
view(senate_plot(senators));
```

  </div>
</div>
