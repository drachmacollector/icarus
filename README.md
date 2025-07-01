# HF Radio Blackout Risk Mapper (Solar‑Flare Edition)

## What it does
Fetches real‑time solar‑flare alerts
Pulls the latest flare events from NASA’s DONKI Solar Flare (FLR) API—including flare class (C, M, X), UTC timestamp, and heliographic coordinates.

Assesses HF‑band impact
Translates each flare’s intensity into a “blackout severity” tier:

C‑class: no meaningful HF interference

M‑class: localized shortwave “fades”

X‑class: widespread HF blackout across the sunlit hemisphere

Visualizes risk on an interactive globe
Computes Earth’s sunlit half at each flare’s UTC time, then shades that hemisphere in green/yellow/red to show where HF comms are currently degraded.

Time‑scrub & playback
Offers a simple slider or “play” control so users can replay the last 24 hrs of flare activity—watching risk zones sweep across the globe as each event unfolds.

Actionable insights
Empowers pilots, mariners, emergency responders, and ham‑radio operators to see where and when HF radio will be unreliable, so they can switch frequencies or routes proactively.

Core Space API
ruby
Copy
Edit
GET https://api.nasa.gov/DONKI/FLR
  ?startDate=YYYY-MM-DD
  &endDate=YYYY-MM-DD
  &api_key=YOUR_KEY
Returns an array of flare objects with properties like flrID, classType, beginTime, peakTime, and sourceLocation.

Simplified Tech Stack
React (Vite or Create React App)

Globe Visualization: [react-globe.gl] for a 3D, rotatable world

Data Fetch: native fetch() or lightweight axios

Styling: Tailwind CSS or plain CSS modules

Deployment: Vercel or Netlify (one‑click)