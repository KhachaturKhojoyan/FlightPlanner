function buildGraph(flights, type = "time") {
  const graph = {};

  for (let flight of flights) {
    if (!graph[flight.from]) graph[flight.from] = {};
    if (!graph[flight.to]) graph[flight.to] = {};

    if (
      graph[flight.from][flight.to] === undefined ||
      flight[type] < graph[flight.from][flight.to]
    ) {
      graph[flight.from][flight.to] = flight[type];
    }
  }

  return graph;
}

function dijkstra(graph, start, end) {
  const distances = {};
  const previous = {};
  const visited = new Set();

  for (let node in graph) {
    distances[node] = Infinity;
    previous[node] = null;
  }

  distances[start] = 0;

  while (true) {
    let closest = null;

    for (let node in distances) {
      if (!visited.has(node)) {
        if (closest === null || distances[node] < distances[closest]) {
          closest = node;
        }
      }
    }

    if (closest === null || distances[closest] === Infinity) break;
    if (closest === end) break;

    for (let neighbour in graph[closest]) {
      let newDist = distances[closest] + graph[closest][neighbour];
      if (newDist < distances[neighbour]) {
        distances[neighbour] = newDist;
        previous[neighbour] = closest;
      }
    }

    visited.add(closest);
  }

  if (distances[end] === Infinity) {
    return { distance: Infinity, path: [] };
  }

  const path = [];
  let current = end;
  while (current) {
    path.unshift(current);
    current = previous[current];
  }

  return { distance: distances[end], path };
}

const flights = [
  { from: "Yerevan",  to: "Moscow",   time: 2,  price: 200 },
  { from: "Yerevan",  to: "Paris",    time: 5,  price: 500 },
  { from: "Moscow",   to: "Berlin",   time: 4,  price: 300 },
  { from: "Paris",    to: "Berlin",   time: 1,  price: 150 },
  { from: "Berlin",   to: "Rome",     time: 2,  price: 180 },
  { from: "Moscow",   to: "Dubai",    time: 4,  price: 350 },
  { from: "Paris",    to: "London",   time: 1,  price: 120 },
  { from: "London",   to: "New York", time: 7,  price: 600 },
  { from: "Dubai",    to: "New York", time: 14, price: 900 },
  { from: "Rome",     to: "New York", time: 9,  price: 700 },
];

// Example usage:
const graphByTime  = buildGraph(flights, "time");
const graphByPrice = buildGraph(flights, "price");

console.log("Fastest route (Yerevan → Berlin):");
console.log(dijkstra(graphByTime, "Yerevan", "Berlin"));

console.log("\nCheapest route (Yerevan → Berlin):");
console.log(dijkstra(graphByPrice, "Yerevan", "Berlin"));