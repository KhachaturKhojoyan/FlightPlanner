function buildGraph(flights, type = "time") {
  const graph = {};

  for (let flight of flights) {
    if (!graph[flight.from]) graph[flight.from] = {};
    if (!graph[flight.to]) graph[flight.to] = {};

    
    graph[flight.from][flight.to] = flight[type];

    
    graph[flight.to][flight.from] = flight[type];
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
  
  { from: "Yerevan",  to: "Moscow",    time: 2.5, price: 220 },
  { from: "Yerevan",  to: "Istanbul",  time: 2,   price: 180 },
  { from: "Yerevan",  to: "Paris",     time: 5,   price: 500 },
  { from: "Yerevan",  to: "Dubai",     time: 3,   price: 260 },
  { from: "Yerevan",  to: "Belgrade",  time: 2.5, price: 190 },

  
  { from: "Moscow",   to: "Berlin",    time: 3,   price: 280 },
  { from: "Moscow",   to: "Istanbul",  time: 3,   price: 250 },

  { from: "Belgrade", to: "Berlin",    time: 2,   price: 170 },
  { from: "Belgrade", to: "Rome",      time: 1.5, price: 140 },
  { from: "Belgrade", to: "Paris",     time: 2.5, price: 180 },

  
  { from: "Berlin",   to: "Paris",     time: 2,   price: 170 },
  { from: "Berlin",   to: "London",    time: 2,   price: 180 },
  { from: "Berlin",   to: "Rome",      time: 2,   price: 160 },

  { from: "Paris",    to: "London",    time: 1,   price: 120 },
  { from: "Paris",    to: "Rome",      time: 2,   price: 160 },
  { from: "Paris",    to: "Madrid",    time: 2,   price: 150 },

  { from: "Rome",     to: "Madrid",    time: 2,   price: 140 },

  
  { from: "Istanbul", to: "Dubai",     time: 4,   price: 350 },

  
  { from: "London",   to: "New York",  time: 7,   price: 600 },
  { from: "Madrid",   to: "New York",  time: 8,   price: 650 },
  { from: "Paris",    to: "New York",  time: 8,   price: 700 },
  { from: "Dubai",    to: "New York",  time: 14,  price: 900 }
];


//test
const graphByTime  = buildGraph(flights, "time");
const graphByPrice = buildGraph(flights, "price");

console.log("Fastest route (Yerevan → Berlin):");
console.log(dijkstra(graphByTime, "Yerevan", "Berlin"));

console.log("\nCheapest route (Yerevan → Berlin):");
console.log(dijkstra(graphByPrice, "Yerevan", "Berlin"));