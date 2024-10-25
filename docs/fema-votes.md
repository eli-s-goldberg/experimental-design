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
const width = window.innerWidth;
const height = window.innerHeight
const senator_radius = Math.min(width, height) / 25; // Adjust as needed
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
// function calculatePositions(senators) {
//   const positions = [];
//   const seatsPerRow = [16, 22, 29, 33]; // Adjust as needed
//   let index = 0;

//   const centerX = width / 2;
//   const centerY = height / 2;
//   const baseRadius = 50; // Base distance between rows
//   const textOffset = 30; // Distance to offset the text from the image along the radial direction

//   for (let row = 0; row < seatsPerRow.length; row++) {
//     const seats = seatsPerRow[row];
//     const radiusX = (row + 1) * baseRadius * 1.5; // Horizontal stretching factor
//     const radiusY = (row + 1) * baseRadius * 0.7; // Vertical compression factor

//     for (let seat = 0; seat < seats; seat++) {
//       const angle = (Math.PI * (seat - (seats - 1) / 2)) / seats;
//       const x = centerX + radiusX * Math.sin(angle);
//       const y = centerY - radiusY * Math.cos(angle);

//       // Calculate the unit vector in the radial direction
//       const dx = x - centerX;
//       const dy = y - centerY;
//       const length = Math.sqrt(dx * dx + dy * dy);
//       const ux = dx / length;
//       const uy = dy / length;

//       // Calculate text position by extending along the radial direction
//       const text_x = x + textOffset * ux;
//       const text_y = y + textOffset * uy;

//       positions.push({ x, y, text_x, text_y });
//       index++;
//       if (index >= senators.length) break;
//     }
//     if (index >= senators.length) break;
//   }
//   return positions;
// }

function calculatePositions(senators) {
  const positions = [];
  const seatsPerRow = [16, 22, 29, 33]; // Adjust as needed based on actual rows
  let index = 0;

  const centerX = width / 2;
  const centerY = height / 2;
  const baseRadius = 20;      // Base distance between rows
  const textOffset = 5;      // Distance to offset the text from the image along the radial direction
  const nameLineSpacing = 2; // Vertical spacing between first and last names

  for (let row = 0; row < seatsPerRow.length; row++) {
    const seats = seatsPerRow[row];
    const radiusX = (row + 1) * baseRadius * 1.5; // Horizontal stretching factor
    const radiusY = (row + 1) * baseRadius * 0.7; // Vertical compression factor

    for (let seat = 0; seat < seats; seat++) {
      const angle = (Math.PI * (seat - (seats - 1) / 2)) / seats;
      const x = centerX + radiusX * Math.sin(angle);
      const y = centerY - radiusY * Math.cos(angle);

      // Calculate the unit vector in the radial direction
      const dx = x - centerX;
      const dy = y - centerY;
      const length = Math.sqrt(dx * dx + dy * dy);
      const ux = dx / length;
      const uy = dy / length;

      // Calculate text position by extending along the radial direction
      const text_x = x + textOffset * ux;
      const text_y = y + textOffset * uy;

      positions.push({ x, y, text_x, text_y });
      index++;
      if (index >= senators.length) break;
    }
    if (index >= senators.length) break;
  }
  return positions;
}
```


```js
// const positions = calculatePositions(senators)
// const mergedData = senators.map((senator, index) => ({
//   ...senator,
//   x: positions[index].x,
//   y: positions[index].y,
//   text_x: positions[index].text_x,
//   text_y: positions[index].text_y
// }));

const positions = calculatePositions(senators);
const mergedData = senators.map((senator, index) => {
  const fullName = senator.name.official_full.trim();
  
  // Split the name into first and last names
  // This simple split assumes exactly two parts; adjust as needed for middle names, etc.
  const nameParts = fullName.split(' ');
  const firstName = nameParts.slice(0, -1).join(' ');
  const lastName = nameParts.slice(-1).join(' ');

  return {
    ...senator,
    x: positions[index].x,
    y: positions[index].y,
    text_x: positions[index].text_x,
    text_y: positions[index].text_y,
    first_name: firstName,
    last_name: lastName
  };
});

view(mergedData)

```
```js
Plot.plot({
  width: 1000,
  height: 600,
  grid: true,
  inset: 10,
  marginLeft: 40,
  marginTop: 40, 
  marginBottom:40, 
  marginRight:40, 
  x: {label: "", axis: null},
  y: {label: "", axis: null},
  marks: [
    Plot.text(mergedData, {
      x: "text_x",
      y: "text_y",
      text: d => d.first_name,
      textAnchor: "end",
      // fontSize: 12,
      dy: -5 
    }),
    // Last Names
    Plot.text(mergedData, {
      x: "text_x",
      y: "text_y",
      text: d => d.last_name,
      textAnchor: "end",
      // fontSize: 12,
      dy: 5
    }),

    Plot.dot(mergedData, {x: "x", y: "y"}),
    Plot.image(mergedData, {
      x: "x",
      y: "y",
      src: d => `https://theunitedstates.io/images/congress/225x275/${d.bioguide}.jpg`,
      r: 10,
      title: d=> d.name.official_full
    })
  ]
})
```

```js
view(calculatePositions(senators))
```
