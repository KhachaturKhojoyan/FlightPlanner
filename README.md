# Flight Route Finder

An interactive flight route planner that finds the fastest or cheapest path between cities, built with vanilla JavaScript and rendered on an HTML5 Canvas. Under the hood it uses **Dijkstra's algorithm** to compute the optimal route through a small network of flights.

## Screenshot

<img width="722" height="803" alt="image" src="https://github.com/user-attachments/assets/9c9750bb-e169-4369-aa3f-a73ad6f8ea24" />
<img width="718" height="804" alt="image" src="https://github.com/user-attachments/assets/333f0073-552b-4332-824a-abde91865cc0" />


## Features

- Choose a **departure** and **destination** city from a dropdown
- Switch between two optimization modes:
  - **Fastest route** (minimizes total flight hours)
  - **Cheapest route** (minimizes total cost)
- Visualizes the whole flight network on a canvas map, with the optimal route highlighted, animated arrowheads, and per-leg labels (hours or price)
- Shows a step-by-step breakdown of the route (e.g. `Yerevan → Moscow → Berlin`) with the total time/cost
- Handles unreachable destinations and same-city selection gracefully
- Automatically adapts to light/dark mode (`prefers-color-scheme`)

## How the algorithm works

The core logic lives in `dijkstra.js` and is split into two parts: building a graph from the flight data, and running Dijkstra's shortest-path algorithm on it.

### 1. Building the graph — `buildGraph(flights, type)`

The raw data is a flat list of flights, each with a `from`, `to`, `time`, and `price`:

```js
{ from: "Yerevan", to: "Moscow", time: 2, price: 200 }
```

`buildGraph` turns this list into an **adjacency list** (a weighted directed graph), where `type` (`"time"` or `"price"`) decides which value is used as the edge weight:

```js
graph = {
  Yerevan: { Moscow: 2, Paris: 5 },
  Moscow:  { Berlin: 4, Dubai: 4 },
  ...
}
```

If multiple flights exist between the same two cities, only the cheapest/fastest one is kept, so the graph always stores the best known direct edge between any two cities.

### 2. Finding the shortest path — `dijkstra(graph, start, end)`

This is a classic implementation of Dijkstra's algorithm:

1. **Initialize distances.** Every city starts with a distance of `Infinity`, except the start city, which is `0`. A `previous` map will later let us reconstruct the path, and a `visited` set tracks which cities are finalized.

2. **Repeatedly pick the closest unvisited city.** On each iteration, the algorithm scans all unvisited cities and picks the one with the smallest known distance so far (`closest`). This is the "greedy" step: since edge weights are non-negative, the closest unvisited node's distance can never be improved later, so it's safe to lock it in.

3. **Stop conditions.**
   - If no reachable unvisited city remains (`closest === null` or its distance is still `Infinity`), the rest of the graph is unreachable from `start` → stop.
   - If the `closest` node is the `end` city, the shortest path has been found → stop early (no need to explore further).

4. **Relax the neighbours.** For every neighbour of the current city, compute the distance if you traveled there *through* the current city (`distances[closest] + weight`). If that's shorter than the neighbour's currently known distance, update it and remember that we reached it via `closest` (this is the "relaxation" step).

5. **Mark the current city as visited** and repeat from step 2.

6. **Reconstruct the path.** Once the loop ends, if `distances[end]` is still `Infinity`, there's no route. Otherwise, the algorithm walks backwards from `end` to `start` using the `previous` map, collecting cities along the way, then reverses that list into the final path from `start` to `end`.

The result is an object like:

```js
{ distance: 6, path: ["Yerevan", "Moscow", "Berlin"] }
```

### Why run it twice?

Because edge weights depend on what you're optimizing for, the app builds **two separate graphs** — one weighted by `time`, one weighted by `price` — and runs Dijkstra independently on whichever one matches the mode the user selected. The fastest route and the cheapest route can therefore go through completely different cities.

### Complexity

This implementation scans all unvisited nodes on every iteration to find the closest one, giving **O(V²)** time complexity (V = number of cities). This is simple and perfectly fine for small graphs like this one; a production version with a large number of cities would typically use a min-priority queue to bring this down to **O((V + E) log V)**.

## Visualizing the route (`script.js`)

`script.js` wires the algorithm up to the UI:

- Reads the selected cities and mode, builds the graph, and calls `dijkstra(...)`
- Draws every possible flight connection as a faint dashed curve on the canvas
- Draws the resulting shortest path as a bold, glowing, arrowed curve on top, with per-leg time/cost labels
- Renders each city as a dot (highlighted if it's on the route) with its name
- Displays a text summary of the route and the total time/cost

## Project Structure

```
FlightPlanner/
├── index.html      # Page structure, styling, and UI controls
├── script.js       # Wires up UI, draws the canvas map
└── dijkstra.js      # Graph builder + Dijkstra's algorithm
```

## Getting Started

No build step or dependencies needed — it's plain HTML/CSS/JS.

1. Clone the repo:
   ```bash
   git clone https://github.com/KhachaturKhojoyan/FlightPlanner.git
   cd FlightPlanner
   ```
2. Open `index.html` directly in your browser, or serve it locally:
   ```bash
   npx serve .
   ```

You can also open `dijkstra.js` in Node to see the console-based example output:
```bash
node dijkstra.js
```


## Status

🚧 Personal/learning project exploring graph algorithms and canvas-based data visualization. Feedback welcome!

## License

This project currently has no license specified.
