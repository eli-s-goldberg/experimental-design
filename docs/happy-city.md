---
toc: true
---

```js
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import {
  geoPolyhedralWaterman,
  geoInterruptedHomolosine,
} from "https://cdn.jsdelivr.net/npm/d3-geo-projection@4/+esm";
import { geoCentroid } from "https://cdn.jsdelivr.net/npm/d3-geo@3/+esm";
```

<script src="https://cdn.jsdelivr.net/npm/d3-array@3"></script>
<script src="https://cdn.jsdelivr.net/npm/d3-geo@3"></script>
<script src="https://cdn.jsdelivr.net/npm/d3-geo-projection@4"></script>

<!-- FORMATTING -->

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
<!-- IMPORT DATA -->

```js
const happycity = FileAttachment("./data/happy_city_ranking.csv").csv({
  typed: true,
});

const americanviolence = FileAttachment("./data/gunviolence-2024.csv").csv({
  typed: true,
});

// 10M GEOJSON DATA
const us = FileAttachment("./data/us-counties-10m.json").json();
```

```js
// manipulate the happy city data to get the centroids. This doesn't need to be done but was a holdout from a seperate activity.
const arrowDataUS = happycity
  .filter((d) => d.country === "United States")
  .map((city) => {
    const country = nation.features.find(
      (feature) => feature.properties.name === city.country
    );
    const centroid = d3.geoCentroid(country);
    return {
      country: city.country,
      cityName: city.city,
      centroidLon: -98.5833,
      centroidLat: 39.8333,
      cityLon: city.longitude,
      cityLat: city.latitude,
      rank: city.rank,
    };
  });
```

```js
const nation = topojson.feature(us, us.objects.nation);
const statemesh = topojson.mesh(us, us.objects.states);
```

```js
// Extract data for Washington D.C.
const washingtonDC = arrowDataUS.filter(
  (d) => d.cityName === "Washington D.C"
)[0];

// Extract data for Baltimore
const baltimore = arrowDataUS.filter((d) => d.cityName === "Baltimore")[0];

// Exclude Washington D.C. and Baltimore from the original data
const remainingData = arrowDataUS.filter(
  (d) => d.cityName !== "Washington D.C" && d.cityName !== "Baltimore"
);
```

<!-- GENERIC FUNCTIONS -->

```js
function slice(...options) {
  return (array) => array.slice(...options);
}

function take(values, index) {
  return values.constructor.from(index, (i) => values[i]);
}
```

# Is Minneapolis 'happier' than Boston?

So, this is a terrible title, but do let me explain. Recently, a close friend recently forwarded me the "happy city index" rankings. His contention was that Minneaplis, which is a 'gold' ranked city, is better than Boston, which is a 'silver' ranked city. I thought I would dig in a bit as it's an interesting dataset and give some thoughts.

## What is the Happy City Index?

The [Happy City Index](https://happy-city-index.com/) ranks cities based on happiness-related factors like education, inclusive policies, economy, mobility, environmental protection, and access to green areas. It emphasizes that happiness varies greatly by demographic and that no single city can be deemed the happiest. Instead, it highlights a group of cities committed to enhancing residents' quality of life. Rankings and detailed scores for numerous cities are provided annually.

The index methods are somewhat opaque and, to be honest, I am extremely skeptical of Boston's ratings. In particular, the lower economic and mobility scores are a little surprising. However, I'm not about to entirely redo their analysis (although I'm occasionally super vindictive, so I reserve the right to do so in the future). That said, let's add in some additional data to rationalize and offer another angle to the Minneapolis superiority argument.

## All the happiness are belong to us

Here's the location and 'rank' for the American cities. Madison is bronze, which is suprising. There's a lot of silber on the east coast, in general. Also, salt lake city is a kind of a shock, as well, but I'll refrain from commenting my thoughts on _why_.

```js
const americal_happiness_plot = Plot.plot({
  projection: "albers-usa",
  color: {
    type: "categorical",
    domain: ["bronze", "silver", "gold"],
    range: ["#CD7F32", "silver", "gold"],
    legend: true,
  },
  inset: 10,
  marks: [
    // Plot.frame(),
    Plot.text(remainingData, {
      x: "cityLon",
      y: "cityLat",
      text: "cityName",
      textAnchor: "start",
      // dy: -10,
      dx: 10,
      fontSize: 12,
      fill: "black",
      stroke: "white",
      strokeWidth: 3,
    }),
    Plot.text([baltimore], {
      x: "cityLon",
      y: "cityLat",
      text: "cityName",
      textAnchor: "start",
      dx: 10,
      fontSize: 12,
      fill: "black",
      stroke: "white",
      strokeWidth: 3,
    }),
    Plot.text([washingtonDC], {
      x: "cityLon",
      y: "cityLat",
      text: "cityName",
      textAnchor: "start",
      dy: 10,
      dx: 10,
      fontSize: 12,
      fill: "black",
      stroke: "white",
      strokeWidth: 3,
    }),

    Plot.geo(nation, { strokeOpacity: 0.6 }),
    Plot.geo(statemesh, { stroke: "black", strokeOpacity: 0.2 }),
    Plot.dot(
      happycity.filter((d) => d.country === "United States"),
      {
        x: "longitude",
        y: "latitude",
        fill: "rank",
        stroke: "black",
        strokeWidth: 0.5,
        r: 5,
        fillOpacity: 1,
      }
    ),
  ],
});

view(americal_happiness_plot);
```

Ok. That's cool and all, but I'm curious. What if we were to look at gun violence as a category?

To do so, let's create a density plot using the location and mass shooting statistics to see if we think differently. Data is available for download from the [Gun Violence Archive](https://www.gunviolencearchive.org/).

<div class = "warning" >

NOTE: I'm only grabbing mass shootings across the US in whatever order the Gun Violence Archive people think is appropriate. Also, I'm limiting myself to ~2000 incidents in total, because while I like messing with my friends, it's not worth eating up too much money geocoding locations.

</div>

```js
const rankColors = {
  bronze: "#CD7F32",
  silver: "silver",
  gold: "gold",
};
```

```js
const violence_plot = Plot.plot({
  projection: "albers",
  color: {
    scheme: "Viridis",
    // type: "quantize",
    legend: true,
    opacity: 0.6,
  },
  inset: 10,
  marks: [
    Plot.density(americanviolence, {
      x: "longitude",
      y: "latitude",
      strokeWidth: 0.5,
      stroke: "black",
      bandwidth: bandwidth,
      thresholds: thresholds,
      strokeOpacity: 0.0,
      weight: violence_metric,
      fill: "density",
      fillOpacity: 0.2,
      clip: true,
    }),
    // Plot.frame(),
    Plot.dot(americanviolence, {
      x: "longitude",
      y: "latitude",
      r: (d) => d[violence_metric],
      fill: "red",
      stroke: null,
      fillOpacity: 0.1,
    }),
    Plot.dot(remainingData, {
      x: "cityLon",
      y: "cityLat",
      r: 5,
      fill: (d) => rankColors[d.rank], // Apply custom color scheme
      stroke: "black",
      strokeWidth: 0.5,
    }),
    Plot.dot([baltimore], {
      x: "cityLon",
      y: "cityLat",
      r: 5,
      fill: (d) => rankColors[d.rank], // Apply custom color scheme
      stroke: "black",
      strokeWidth: 0.5,
    }),
    Plot.dot([washingtonDC], {
      x: "cityLon",
      y: "cityLat",
      r: 5,
      fill: (d) => rankColors[d.rank], // Apply custom color scheme
      stroke: "black",
      strokeWidth: 0.5,
    }),

    Plot.text(remainingData, {
      x: "cityLon",
      y: "cityLat",
      text: "cityName",
      textAnchor: "start",
      // dy: -10,
      dx: 10,
      fontSize: 12,
      fill: "black",
      stroke: "white",
      strokeWidth: 3,
    }),
    Plot.text([baltimore], {
      x: "cityLon",
      y: "cityLat",
      text: "cityName",
      textAnchor: "start",
      dx: 10,
      fontSize: 12,
      fill: "black",
      stroke: "white",
      strokeWidth: 3,
    }),
    Plot.text([washingtonDC], {
      x: "cityLon",
      y: "cityLat",
      text: "cityName",
      textAnchor: "start",
      dy: 10,
      dx: 10,
      fontSize: 12,
      fill: "black",
      stroke: "white",
      strokeWidth: 3,
    }),
    Plot.geo(nation, { strokeOpacity: 0.6 }),
    Plot.geo(statemesh, { stroke: "green", strokeOpacity: 0.2 }),
  ],
});
view(violence_plot);
```

Play with these to tweak the viz. Slide the thresholds to '0' to see the location of each event.

```js
const bandwidth = view(
  Inputs.range([0, 40], { step: 0.25, label: "bandwidth", value: 20 })
);
const thresholds = view(
  Inputs.range([0, 100], { step: 0.5, label: "thresholds", value: 10 })
);

const violence_metric = view(
  Inputs.radio(
    [
      "Victims Killed",
      "Victims Injured",
      "Suspects Killed",
      "Suspects Injured",
      "Suspects Arrested",
    ],
    { label: "Metric", value: "Suspects Injured" }
  )
);
```

### Aggregated Data by City

```js
// aggregating by city
const aggregatedData = {};

// Iterate through the dataset
americanviolence.forEach((entry) => {
  const city = entry["City Or County"];
  const lat = entry["latitude"];
  const long = entry["longitude"];
  const date = entry["Incident Date"];

  // Initialize the city in the aggregatedData object if it doesn't exist
  if (!aggregatedData[city]) {
    aggregatedData[city] = {
      City: city,
      "Victims Killed": 0,
      "Victims Injured": 0,
      "Suspects Killed": 0,
      "Suspects Injured": 0,
      "Suspects Arrested": 0,
      latitude: lat,
      longitude: long,
      date: date,
    };
  }

  // Sum the values for each metric
  aggregatedData[city]["Victims Killed"] += entry["Victims Killed"];
  aggregatedData[city]["Victims Injured"] += entry["Victims Injured"];
  aggregatedData[city]["Suspects Killed"] += entry["Suspects Killed"];
  aggregatedData[city]["Suspects Injured"] += entry["Suspects Injured"];
  aggregatedData[city]["Suspects Arrested"] += entry["Suspects Arrested"];
});

const aggregatedDataRes = Object.values(aggregatedData);

const longFormatData = [];
aggregatedDataRes.forEach((cityData) => {
  Object.keys(cityData).forEach((key) => {
    if (key !== "City" && key !== "latitude" && key !== "longitude") {
      longFormatData.push({
        City: cityData["City"],
        latitude: cityData["latitude"],
        longitude: cityData["longitude"],
        violence_metric: key,
        value: cityData[key],
      });
    }
  });
});
```

```js
// Parse the dates and aggregate incidents by date and city for each metric
const aggregatedDataDate = {};

americanviolence.forEach((entry) => {
  const date = new Date(entry["Incident Date"]).toISOString().split("T")[0];
  const city = entry["City Or County"];

  if (!aggregatedDataDate[city]) {
    aggregatedDataDate[city] = {};
  }
  if (!aggregatedDataDate[city][date]) {
    aggregatedDataDate[city][date] = {
      incidents: 0,
      victimsKilled: 0,
      victimsInjured: 0,
      suspectsKilled: 0,
      suspectsInjured: 0,
      suspectsArrested: 0,
    };
  }

  aggregatedDataDate[city][date].incidents += 1;
  aggregatedDataDate[city][date].victimsKilled += entry["Victims Killed"];
  aggregatedDataDate[city][date].victimsInjured += entry["Victims Injured"];
  aggregatedDataDate[city][date].suspectsKilled += entry["Suspects Killed"];
  aggregatedDataDate[city][date].suspectsInjured += entry["Suspects Injured"];
  aggregatedDataDate[city][date].suspectsArrested += entry["Suspects Arrested"];
});

// Convert the aggregated data into a long format array suitable for plotting
const timeSeriesData = [];

Object.keys(aggregatedDataDate).forEach((city) => {
  let cumulativeVictimsKilled = 0;
  let cumulativeVictimsInjured = 0;
  let cumulativeSuspectsKilled = 0;
  let cumulativeSuspectsInjured = 0;
  let cumulativeSuspectsArrested = 0;

  Object.keys(aggregatedDataDate[city])
    .sort((a, b) => new Date(a) - new Date(b))
    .forEach((date) => {
      const entry = aggregatedDataDate[city][date];
      cumulativeVictimsKilled += entry.victimsKilled;
      cumulativeVictimsInjured += entry.victimsInjured;
      cumulativeSuspectsKilled += entry.suspectsKilled;
      cumulativeSuspectsInjured += entry.suspectsInjured;
      cumulativeSuspectsArrested += entry.suspectsArrested;

      timeSeriesData.push({
        city: city,
        date: new Date(date),
        metric: "Victims Killed",
        value: cumulativeVictimsKilled,
      });
      timeSeriesData.push({
        city: city,
        date: new Date(date),
        metric: "Victims Injured",
        value: cumulativeVictimsInjured,
      });
      timeSeriesData.push({
        city: city,
        date: new Date(date),
        metric: "Suspects Killed",
        value: cumulativeSuspectsKilled,
      });
      timeSeriesData.push({
        city: city,
        date: new Date(date),
        metric: "Suspects Injured",
        value: cumulativeSuspectsInjured,
      });
      timeSeriesData.push({
        city: city,
        date: new Date(date),
        metric: "Suspects Arrested",
        value: cumulativeSuspectsArrested,
      });
    });
});

timeSeriesData.sort((a, b) => a.date - b.date);
```

Ok. So, despite that this chart is quite quantitative, it's somehow _unsatisfying_ for understanding a direct comparison in violence between cities. Noting that the populaton differences between these two metropolitan areas is relatively similar:

- [Boston had a population of 675,647 in the 2020 census](https://www.census.gov/quickfacts/fact/table/bostoncitymassachusetts,US/POP010220)
- [Minneapolis had a population of 429,954 in the 2020 census](https://www.census.gov/quickfacts/fact/dashboard/minneapoliscityminnesota,hennepincountyminnesota/PST045221)

Now, it's likely that I didn't grab _all_ the data from the gun violence archive (I only did the most recent 2000 incidents), but it does appear that things are not trending super well for Minneapolis in comparison to Boston this year.

```js
const violence_by_city = Plot.plot({
  marginLeft: 90,
  x: { label: null, axis: false },
  y: { label: null },
  facet: {
    data: longFormatData,
    x: "violence_metric",
    axis: true,
  },
  fx: {
    label: null,
    padding: 0.3,
    domain: [
      "Suspects Arrested",
      "Suspects Injured",
      "Suspects Killed",
      "Victims Injured",
      "Victims Killed",
    ],
  },
  marks: [
    Plot.barX(longFormatData, {
      y: "City",
      x: "value",
      fill: (d) =>
        d.City === "Boston" || d.City === "Minneapolis" ? "red" : "steelblue",
      sort: { y: "x", reverse: true, limit: 60 },
    }),
    Plot.text(longFormatData, {
      y: "City",
      x: "value",
      text: (d) => d.value,

      fill: (d) =>
        d.City === "Boston" || d.City === "Minneapolis" ? "red" : "black",
      dx: 12,
    }),
  ],
});

view(violence_by_city);
```

Let's take a look at how our two cities are stacking up over time.

```js
const timeSeriesPlot = Plot.plot({
  x: {
    label: "Date",

    type: "time",
  },
  y: {
    label: "Number of Incidents",
    domain: [0, 105],
  },
  color: { legend: true },
  inset: 20,
  marginRight: 100,
  fx: { label: "" },
  marks: [
    Plot.lineY(timeSeriesData, {
      x: "date",
      y: "value",
      fx: "metric",
      stroke: (d) => (d.city === "Minneapolis" ? "red" : null),
    }),

    Plot.line(timeSeriesData, {
      x: "date",
      y: "value",
      fx: "metric",
      stroke: (d) => (d.city === "Boston" ? "green" : null),
    }),
  ],
});

view(timeSeriesPlot);
```

<b>Ouch.</b> Minneapolis definetly leads Boston in Mass shootings with respect to victims injured, killed, and suspects injured. I will note that boston does lead in suspects arresed and injured, but somehow that seems less terrible...but only slightly.

I'll note further that I could have calculated this per capita, but the reality is that I think this would make it look even _worse_ for Minneapolis, as it has a lower population and worse mass shooting stats than Boston.

## Conclusion

I'll admit that it's not an _overwhelming_ win for Boston re: mass shootings and gun violence, Boston definetly does win in the "mass shooting" category. The fact that I even have to consider this makes me physically ill. I want off this American timeline or we'll end up in the Star Wars universe instead of the _Star Trek_ universe.

<div class = "horizontal-line ">

### Methods

Most of the methods are available by inspecting the `js` associated with this github repo's markdown.

For those of you who were interested in how I was using the GoogleAPI to automate geocoding of locations. Here's my full AppScript (sans my API key).

```javascript
var apiKey = "YOURAPIKEY"; // Replace with your actual API key
var cache = CacheService.getScriptCache();

function GOOGLEMAPS_LATLONG(address, city, state) {
  var fullAddress = address + ", " + city + ", " + state + ", USA";
  var cached = cache.get(fullAddress);
  if (cached) {
    return JSON.parse(cached);
  } else {
    try {
      var response = UrlFetchApp.fetch(
        "https://maps.googleapis.com/maps/api/geocode/json?address=" +
          encodeURIComponent(fullAddress) +
          "&key=" +
          apiKey
      );
      var json = JSON.parse(response.getContentText());
      if (json.status == "OK" && json.results.length > 0) {
        var lat = json.results[0].geometry.location.lat;
        var lng = json.results[0].geometry.location.lng;
        var result = [lat, lng];
        cache.put(fullAddress, JSON.stringify(result), 21600); // Cache for 6 hours
        return result;
      } else {
        return ["Not Found", "Not Found"];
      }
    } catch (e) {
      return ["Error", "Error"];
    }
  }
}
```

In the google sheet, and assuning that `address` is in Column A and `city` is in Column B, and `state` is in Column C, you can extract the latitude and longitude as such:

- Latitude: `=INDEX(GOOGLEMAPS_LATLONG(A1, B1, C1), 1)`
- Longitude: `=INDEX(GOOGLEMAPS_LATLONG(A1, B1, C1), 2)`
