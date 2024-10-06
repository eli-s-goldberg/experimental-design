---
toc: true
---

# Diddy did it, didn't he... .

Sean Combs AKA P. Diddy, Puff Daddy, Puffy, or just Diddy, has faced several controversies throughout his career. Let's do a bit of a visual journey as an opportunity to play around with the timeline.

FYI - I modified this timeline script that uses an LLM to extract information from wikipedia and plot it in a timline by [WinkJS](https://observablehq.com/@winkjs) It's pretty magical, and I love the concept of doing it on the fly, but I didn't think the LLM was that performant. Instead, I extracted it using a variety of articles and prompts with openAI's API and then custom made a data element to illustrate this example.

[How to visualize timeline of a Wiki article?](https://observablehq.com/@winkjs/how-to-visualize-timeline-of-a-wiki-article).

## Timeline of a predator

<style>
.article-name {
  text-align: center;
  color: #6C307D;
  background-color: white;
  margin: 0 auto;
  display: block;
  font-family: sans-serif;
  font-size: 12px;
}

mark {
  background-color: #fc3;
}

.timeline {
  margin: 10;
  overflow: hidden;
  margin-bottom: 100px;
  font-size: 12px;
  position: relative; /* Ensure the line is positioned relative to this div */
  padding: 20px 0;  /* Add some padding to ensure line fits nicely */
}

.timeline:before {
  content: '';
  position: absolute;
  top: 0; /* Start from the top of the div */
  bottom: 0; /* Extend to the bottom of the div */
  left: 50%; /* Center the line */
  transform: translateX(-50%);
  width: 4px;
  background-color: #6C307D;
  z-index: -1; /* Behind other elements */
}

.timeline .entries {
  width: calc(100% - 80px);
  max-width: 800px;
  margin: auto;
  position: relative;
}

.timeline .entries .entry {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding: 0 20px;
  position: relative;
}

.timeline .entries .entry .body {
  flex-grow: 1;
  padding: 20px;
  max-width: 45%;
}

.timeline .entries .entry img {
  width: 300px;
  height: 300px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  margin-left: 20px;
}

.timeline .entries .entry:nth-child(2n) {
  flex-direction: row-reverse;
}

.timeline .entries .entry .title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 4px;
  color: #222;
  position: relative;
}

.timeline .entries .entry .title.big {
  font-size: 20px;
}
</style>

```js
const data = [
  {
    date: "1990-01-01",
    incident:
      "Sean Combs and Aaron Hall allegedly sexually assaulted an unnamed victim at a music event.",
    evidence: [
      {
        source: "Wikipedia",
        quote:
          "Combs and Hall allegedly sexually abused a woman in the early 1990s, with Combs recording the incident.",
        link: "https://en.wikipedia.org/wiki/Sean_Combs#Sexual_misconduct_allegations_and_lawsuits",
      },
      {
        source: "NPR",
        quote: "Combs recorded the alleged sexual assault of the victim.",
        link: "https://www.npr.org/2024/02/29/1234684758/sean-combs-diddy-allegations-timeline",
      },
    ],
    outcome:
      "Lawsuit surfaced in November 2023; part of ongoing legal action involving multiple plaintiffs.",
    photo_link:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Sean_Combs_2010.jpg/512px-Sean_Combs_2010.jpg?20110818070527",
  },
  {
    date: "1999-12-27",
    incident:
      "Club New York shooting, involving Sean Combs, Jennifer Lopez, and rapper Shyne.",
    evidence: [
      {
        source: "Wikipedia",
        quote:
          "Combs was acquitted of all charges related to the shooting. Shyne was convicted and served time.",
        link: "https://en.wikipedia.org/wiki/Sean_Combs#Legal_issues",
      },
      {
        source: "Rolling Stone",
        quote:
          "Combs faced trial, ultimately acquitted; Shyne served 10 years.",
        link: "https://www.rollingstone.com/music/music-features/sean-diddy-combs-controversies-timeline-1234889043",
      },
    ],
    outcome:
      "Combs settled with his driver Wardel Fenderson in February 2004 for undisclosed terms.",
    photo_link:
      "https://www.newsnationnow.com/wp-content/uploads/sites/108/2024/02/GettyImages-78011390.jpg?w=1400",
  },
  {
    date: "2017-05-01",
    incident:
      "Combs’s former personal chef Cindy Rueda sued him for sexual harassment and retaliation.",
    evidence: [
      {
        source: "Wikipedia",
        quote:
          "Cindy Rueda, who served as Combs's personal chef, accused him of sexual harassment and retaliation, ultimately settling the lawsuit for an undisclosed amount.",
        link: "https://en.wikipedia.org/wiki/Sean_Combs#Sexual_misconduct_allegations_and_lawsuits",
      },
      {
        source: "Hollywood Reporter",
        quote:
          "Rueda alleged inappropriate sexual behavior while working for Combs.",
        link: "https://www.hollywoodreporter.com",
      },
    ],
    outcome:
      "The lawsuit was settled in February 2019 for an undisclosed amount.",
    photo_link:
      "https://static1.straitstimes.com.sg/s3fs-public/styles/large30x20/public/articles/2017/05/10/42426652_-_02_05_2017_-_usa_met_gala_red_carpet.jpg?VersionId=Ffsxj4b18SlI9gsxlZ871Oic_3bPJHZv&itok=l497ZF48",
  },
  {
    date: "2018-09-01",
    incident:
      "Cassie Ventura accused Combs of sexual misconduct, including coercion, during their relationship.",
    evidence: [
      {
        source: "Wikipedia",
        quote:
          "Cassie filed a lawsuit alleging years of rape, sex trafficking, and abuse by Combs. The case was settled out of court the day after it was filed.",
        link: "https://en.wikipedia.org/wiki/Sean_Combs#Sexual_misconduct_allegations_and_lawsuits",
      },
      {
        source: "Rolling Stone",
        quote:
          "Cassie accused Combs of controlling and coercive behavior, ultimately reaching a settlement.",
        link: "https://www.rollingstone.com",
      },
      {
        source: "NPR",
        quote:
          "Cassie’s lawsuit detailed long-term abuse and was settled quickly.",
        link: "https://www.npr.org",
      },
    ],
    outcome:
      "The lawsuit was filed on November 16, 2023, but settled one day later for an undisclosed amount.",
    photo_link:
      "https://www.rollingstone.com/wp-content/uploads/2023/11/sean-combs-cassie-rape-lawsuit.jpg?w=1600&h=900&crop=1",
  },
  {
    date: "2022-01-01",
    incident:
      "Anonymous woman accused Combs of drugging and impregnating her, later coercing her into an abortion.",
    evidence: [
      {
        source: "Wikipedia",
        quote:
          "The woman alleges Combs forced her to take ketamine, impregnated her, and coerced her into an abortion after the stress of the abuse caused her to miscarry.",
        link: "https://en.wikipedia.org/wiki/Sean_Combs#Sexual_misconduct_allegations_and_lawsuits",
      },
      {
        source: "NPR",
        quote:
          "Combs forced her to take ketamine and later coerced her to abort the pregnancy.",
        link: "https://www.npr.org",
      },
    ],
    outcome: "This lawsuit is ongoing as of 2024.",
    photo_link:
      "https://img-s-msn-com.akamaized.net/tenant/amp/entityid/AA1rlkht.img?w=768&h=432&m=6",
  },
  {
    date: "2024-03-04",
    incident:
      "Producer Rodney 'Lil Rod' Jones filed a lawsuit accusing Combs of sexual assault and cover-up of a shooting involving his son Justin Combs.",
    evidence: [
      {
        source: "Wikipedia",
        quote:
          "Jones accused Combs of forcing him to solicit sex workers and helping cover up a shooting at Combs’s studio involving his son Justin.",
        link: "https://en.wikipedia.org/wiki/Sean_Combs#Sexual_misconduct_allegations_and_lawsuits",
      },
      {
        source: "NPR",
        quote:
          "Combs and his son were accused of covering up a shooting and forcing Jones to engage in illicit activities.",
        link: "https://www.npr.org",
      },
    ],
    outcome: "This case remains unresolved as of mid-2024.",
    photo_link:
      "https://www.rollingstone.com/wp-content/uploads/2024/08/lil-rod-diddy-updated.jpg?w=1581&h=1054&crop=1",
  },
  {
    date: "2024-09-01",
    incident:
      "Over 120 sexual misconduct lawsuits were filed against Combs, many involving minors. Allegations include drugging and offering hush money.",
    evidence: [
      {
        source: "Wikipedia",
        quote:
          "Combs faces 120 lawsuits for assaults in the 2000s and 2010s, with some victims claiming they were drugged or offered hush money. 25 of the plaintiffs are minors.",
        link: "https://en.wikipedia.org/wiki/Sean_Combs#Sexual_misconduct_allegations_and_lawsuits",
      },
      {
        source: "Washington Post",
        quote:
          "Lawyers have filed suits against Combs for over 120 allegations of assault, primarily in New York State.",
        link: "https://www.washingtonpost.com",
      },
      {
        source: "Rolling Stone",
        quote:
          "Combs faces over 120 new lawsuits, many involving drugging and minors.",
        link: "https://www.rollingstone.com",
      },
    ],
    outcome:
      "Combs’s legal team denied the charges; cases are ongoing, with Combs accused of sexual misconduct, trafficking, and drugging.",
    photo_link:
      "https://cdn.abcotvs.com/dip/images/15383327_100224-wpvi-sean-diddy-combs-new-lawsuits-4a-vo-video-vid.jpg?w=1600",
  },

  {
    date: "2024-11-23",
    incident:
      "Two further lawsuits are filed against Combs for sexual assault and revenge porn.",
    evidence: [
      {
        source: "Wikipedia",
        quote:
          "Two more women came forward accusing Combs of sexual assault, one involving revenge porn and another from the early 1990s.",
        link: "https://en.wikipedia.org/wiki/Sean_Combs#Sexual_misconduct_allegations_and_lawsuits",
      },
      {
        source: "Rolling Stone",
        quote:
          "Two more lawsuits accuse Combs of sexual assault and recording revenge porn.",
        link: "https://www.rollingstone.com/music/music-features/sean-diddy-combs-controversies-timeline-1234889043",
      },
    ],
    outcome: "These lawsuits are pending as of late 2024.",
    photo_link:
      "https://www.nydailynews.com/wp-content/uploads/2024/03/AP23264611402250.jpg?w=1024",
  },
  {
    date: "2024-06-01",
    incident:
      "Combs steps down from his role as chairman of **Revolt TV** and faces boycotts from various brands and organizations.",
    evidence: [
      {
        source: "Wikipedia",
        quote:
          "Brands like Macy’s and Hulu severed ties with Combs after the flood of allegations. He also stepped down from his role at Revolt TV.",
        link: "https://en.wikipedia.org/wiki/Sean_Combs#Sexual_misconduct_allegations_and_lawsuits",
      },
      {
        source: "Rolling Stone",
        quote:
          "Combs stepped back from his role at Revolt TV and several brands cut ties with him.",
        link: "https://www.rollingstone.com/music/music-features/sean-diddy-combs-controversies-timeline-1234889043",
      },
    ],
    outcome:
      "Combs continues to face reputational decline, with various institutions cutting ties with him.",
    photo_link:
      "https://ca-times.brightspotcdn.com/dims4/default/86d7190/2147483647/strip/true/crop/4116x2560+0+0/resize/1200x746!/quality/75/?url=https%3A%2F%2Fcalifornia-times-brightspot.s3.amazonaws.com%2F52%2F09%2F16998f974c1799fd60f1bbbb8d33%2Ftca-sean-combs-revolt-tv.JPEG",
  },
];
```

```js
// Function to generate the timeline and insert into the target div
function timeliner(data, targetId) {
  let htmlElements = [
    `<h1 class="article-name"></h1><div id="timeline" class="timeline"><div class="entries">`,
  ];
  let lastYear = "";

  data.forEach((t, index) => {
    let className = "";
    let year = t.date.split("-")[0]; // Extracting year for century check

    // Determine if the century has changed to apply 'big' class
    if (lastYear !== year) {
      lastYear = year;
      className = "big";
    }

    // Create the HTML structure for each entry
    htmlElements.push(`
          <div class="entry">
            <div class="body">
              <div class="title ${className}">${t.date}</div>
              <p><strong>Incident:</strong> ${t.incident}</p>
              <p><strong>Sources:</strong></p>
              <ul>
                ${t.evidence
                  .map(
                    (e) =>
                      `<li><a href="${e.link}" target="_blank">${e.source}: "${e.quote}"</a></li>`
                  )
                  .join("")}
              </ul>
            </div>
            <img src="${t.photo_link}" alt="Photo related to ${t.incident}" />
          </div>
        `);
  });

  htmlElements.push("</div></div>");
  // Inject HTML into the target div with the given ID
  let targetDiv = document.getElementById(targetId);
  if (targetDiv) {
    targetDiv.innerHTML = htmlElements.join("");
  } else {
    console.error(`Element with ID ${targetId} not found.`);
  }
}
```

```js
// Ensure the function runs after the DOM has fully loaded
timeliner(data, "timeline-container");
```

<div id="timeline-container"></div>

## Who will go down with diddy?

The natural question, however, is _"Who will go down with diddy"?_ His parties were famous. Some friends and I have been taking bets.

```js
const betting_contingency = [
  {
    Person: "Kanye West",
    Jackie: "Yes",
    Sarah: "Yes",
    Wayne: "No",
    Eli: "Yes",
    Count: 3,
    Odds: "Low",
  },
  {
    Person: "Justin Bieber",
    Jackie: "Yes",
    Sarah: "No",
    Wayne: "No",
    Eli: "No",
    Count: 1,
    Odds: "High",
  },
  {
    Person: "Odell Beckham Jr.",
    Jackie: "Yes",
    Sarah: "No",
    Wayne: "No",
    Eli: "No",
    Count: 1,
    Odds: "High",
  },
  {
    Person: "Ray Jay Norwood",
    Jackie: "Yes",
    Sarah: "No",
    Wayne: "No",
    Eli: "No",
    Count: 1,
    Odds: "High",
  },
  {
    Person: "Lil' Kim (Kimberly Jones)",
    Jackie: "Yes",
    Sarah: "Yes",
    Wayne: "No",
    Eli: "No",
    Count: 2,
    Odds: "Medium",
  },
  {
    Person: "Busta Rhymes (Trevor Smith Jr.)",
    Jackie: "Yes",
    Sarah: "No",
    Wayne: "No",
    Eli: "No",
    Count: 1,
    Odds: "High",
  },
  {
    Person: "Mase (Mason Betha)",
    Jackie: "Yes",
    Sarah: "No",
    Wayne: "No",
    Eli: "No",
    Count: 1,
    Odds: "High",
  },
  {
    Person: "Tyrese Gibson",
    Jackie: "Yes",
    Sarah: "No",
    Wayne: "No",
    Eli: "No",
    Count: 1,
    Odds: "High",
  },
  {
    Person: "Leonardo DiCaprio",
    Jackie: "Yes",
    Sarah: "No",
    Wayne: "No",
    Eli: "Yes",
    Count: 2,
    Odds: "Medium",
  },
  {
    Person: "Kevin Hart",
    Jackie: "No",
    Sarah: "Yes",
    Wayne: "Yes",
    Eli: "No",
    Count: 2,
    Odds: "Medium",
  },
  {
    Person: "Will Smith",
    Jackie: "No",
    Sarah: "Yes",
    Wayne: "No",
    Eli: "Yes",
    Count: 2,
    Odds: "Medium",
  },
  {
    Person: "Tom Cruise",
    Jackie: "No",
    Sarah: "Yes",
    Wayne: "No",
    Eli: "No",
    Count: 1,
    Odds: "High",
  },
  {
    Person: "Usher Raymond (Singer)",
    Jackie: "No",
    Sarah: "No",
    Wayne: "Yes",
    Eli: "No",
    Count: 1,
    Odds: "High",
  },
  {
    Person: "Kamala Harris",
    Jackie: "No",
    Sarah: "No",
    Wayne: "Yes",
    Eli: "No",
    Count: 1,
    Odds: "High",
  },
  {
    Person: "Athletes (Lakers)",
    Jackie: "No",
    Sarah: "No",
    Wayne: "Yes",
    Eli: "No",
    Count: 1,
    Odds: "High",
  },
  {
    Person: "Stedman Graham",
    Jackie: "No",
    Sarah: "No",
    Wayne: "Yes",
    Eli: "No",
    Count: 1,
    Odds: "High",
  },
  {
    Person: "Rudy Giuliani",
    Jackie: "No",
    Sarah: "No",
    Wayne: "Yes",
    Eli: "No",
    Count: 1,
    Odds: "High",
  },
  {
    Person: "Gene Simmons",
    Jackie: "No",
    Sarah: "No",
    Wayne: "Yes",
    Eli: "No",
    Count: 1,
    Odds: "High",
  },
  {
    Person: "Junior Mafia (Group)",
    Jackie: "No",
    Sarah: "No",
    Wayne: "No",
    Eli: "Yes",
    Count: 1,
    Odds: "High",
  },
  {
    Person: "Oprah Winfrey",
    Jackie: "No",
    Sarah: "No",
    Wayne: "No",
    Eli: "Yes",
    Count: 1,
    Odds: "High",
  },
  {
    Person: "Jamie Foxx",
    Jackie: "No",
    Sarah: "No",
    Wayne: "No",
    Eli: "Yes",
    Count: 1,
    Odds: "High",
  },
  {
    Person: "Ashton Kutcher",
    Jackie: "No",
    Sarah: "No",
    Wayne: "No",
    Eli: "Yes",
    Count: 1,
    Odds: "High",
  },
  {
    Person: "Jay Z (Shawn Carter)",
    Jackie: "No",
    Sarah: "No",
    Wayne: "No",
    Eli: "Yes",
    Count: 1,
    Odds: "High",
  },
];

const diddy_contingency = Plot.plot({
  padding: 0,
  grid: true,
  marginLeft: 160,
  inset: 20,
  x: {
    axis: "top",
    label: "",
    domain: ["Jackie", "Sarah", "Wayne", "Eli"],
    grid: false,
  },
  y: {
    axis: "left",
    label: null,
    grid: false,
    domain: betting_contingency.map((d) => d.Person),
  },
  marks: [
    Plot.dot(
      betting_contingency.flatMap((d) =>
        ["Jackie", "Sarah", "Wayne", "Eli"]
          .filter((key) => d[key] === "Yes")
          .map((key) => ({
            Person: d.Person,
            Voter: key,
            Count: d.Count,
            Odds: d.Odds,
          }))
      ),
      { x: "Voter", y: "Person", fill: "black", title: "Person" }
    ),
  ],
});
```

```js
const diddy_arrow_plot = Plot.plot({
  padding: 0,
  grid: true,
  inset: 20,
  marginLeft: 160,
  x: {
    axis: "top",
    label: "Number of Votes",
    grid: false,
  },
  y: {
    axis: "left",
    label: null,
    grid: false,
    domain: betting_contingency.map((d) => d.Person),
  },
  marks: [
    // Create the arrow plot where x1 is always 0 and x2 is based on the count of votes
    Plot.arrow(betting_contingency, {
      x1: 0, // All arrows start from 0 on the x-axis
      x2: "Count", // Arrows end at the count of votes
      y1: "Person", // Diddy Associate on the y-axis (starting point)
      y2: "Person", // Diddy Associate on the y-axis (ending point, same as y1)
      stroke: "black", // All arrows are black
      strokeWidth: 2, // Arrow thickness
      headLength: 5, // Arrowhead size
      title: (d) => `Votes: ${d.Count}`, // Tooltip showing the count value
    }),
  ],
});
```

<div class="grid grid-cols-1">
  <div ><h1>

```js
view(diddy_contingency);
```

</h1></div>
  <div><h1>
  
  ```js
  view(diddy_arrow_plot);
  ```
  
  </h1></div>
</div>
