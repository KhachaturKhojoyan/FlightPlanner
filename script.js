const cityCoords = {
  "Yerevan": { x: 0.75, y: 0.28 },
  "Moscow": { x: 0.68, y: 0.16 },
  "Paris": { x: 0.43, y: 0.25 },
  "Berlin": { x: 0.50, y: 0.19 },
  "London": { x: 0.39, y: 0.21 },
  "Rome": { x: 0.50, y: 0.32 },
  "Dubai": { x: 0.80, y: 0.40 },
  "New York": { x: 0.16, y: 0.28 },
  "Istanbul": { x: 0.60, y: 0.30 },
  "Madrid": { x: 0.34, y: 0.33 },
  "Belgrade":  { x: 0.56, y: 0.24 }
};


let mode = 'time';
let lastResult = null;

const cities = Object.keys(cityCoords);
const fromSel = document.getElementById('fromCity');
const toSel = document.getElementById('toCity');

cities.forEach(c => {
  fromSel.add(new Option(c, c));
  toSel.add(new Option(c, c));
});
fromSel.value = 'Yerevan';
toSel.value = 'Berlin';

function setMode(m) {
  mode = m;
  document.getElementById('btnTime').classList.toggle('active', m === 'time');
  document.getElementById('btnPrice').classList.toggle('active', m === 'price');
  if (lastResult) drawMap(lastResult.path, lastResult.segments);
}

function getSegmentValue(from, to, type) {
  const f = flights.find(fl =>
    (fl.from === from && fl.to === to) ||
    (fl.from === to && fl.to === from)
  );

  return f ? f[type] : 0;
}

function findRoute() {
  const from = fromSel.value, to = toSel.value;
  document.getElementById('errMsg').textContent = '';
  document.getElementById('resultPanel').classList.remove('show');

  if (from === to) {
    document.getElementById('errMsg').textContent = 'Please choose different cities.';
    return;
  }

  const graph = buildGraph(flights, mode);
  const res = dijkstra(graph, from, to);

  if (res.path.length === 0) {
    document.getElementById('errMsg').textContent = 'No route found between these cities.';
    drawMap([], []);
    return;
  }

  const segments = [];
  for (let i = 0; i < res.path.length - 1; i++) {
    const a = res.path[i], b = res.path[i + 1];
    segments.push({ from: a, to: b, val: getSegmentValue(a, b, mode) });
  }

  lastResult = { path: res.path, segments, distance: res.distance };
  drawMap(res.path, segments);
  showResult(res, segments, from, to);
}

function showResult(res, segments, from, to) {
  document.getElementById('resultPanel').classList.add('show');
  document.getElementById('routeLabel').textContent = from + ' → ' + to;
  document.getElementById('metricVal').textContent = mode === 'time' ? res.distance + ' h' : '$' + res.distance;
  document.getElementById('metricLbl').textContent = mode === 'time' ? 'total flight hours' : 'total cost';

  const stops = document.getElementById('stopsList');
  stops.innerHTML = '';

  res.path.forEach((city, i) => {
    const span = document.createElement('span');
    span.className = 'stop-city';
    span.textContent = city;
    stops.appendChild(span);

    if (i < segments.length) {
      const arr = document.createElement('span');
      arr.className = 'stop-arrow';
      arr.textContent = '→';
      stops.appendChild(arr);

      const detail = document.createElement('span');
      detail.className = 'stop-seg';
      detail.textContent = mode === 'time' ? segments[i].val + 'h' : '$' + segments[i].val;
      stops.appendChild(detail);

      const arr2 = document.createElement('span');
      arr2.className = 'stop-arrow';
      arr2.textContent = '→';
      stops.appendChild(arr2);
    }
  });
}

// ── Canvas map ──────────────────────────────────────────────────────────────
const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');
const W = 660, H = 340;

function proj(coord) {
  return { x: coord.x * W, y: coord.y * H };
}

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function drawMap(routePath, segments) {
  ctx.clearRect(0, 0, W, H);

  const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const accent = dark ? '#EF9F27' : '#BA7517';

  const pathSet = new Set();
  for (let i = 0; i < routePath.length - 1; i++)
    pathSet.add(routePath[i] + '|' + routePath[i + 1]);

  // Background
  ctx.fillStyle = dark ? '#111110' : '#f4f2ec';
  ctx.fillRect(0, 0, W, H);

  // All connections (faint dashed)
  flights.forEach(f => {
    const a = proj(cityCoords[f.from]);
    const b = proj(cityCoords[f.to]);
    if (pathSet.has(f.from + '|' + f.to)) return;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 - 20;
    ctx.quadraticCurveTo(mx, my, b.x, b.y);
    ctx.strokeStyle = dark ? '#2e2e2a' : '#dbd8d0';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
  });

  // Highlighted route
  if (routePath.length > 1) {
    for (let i = 0; i < routePath.length - 1; i++) {
      const a = proj(cityCoords[routePath[i]]);
      const b = proj(cityCoords[routePath[i + 1]]);
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2 - 28;

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo(mx, my, b.x, b.y);
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = accent;
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Arrowhead at 60% of curve
      const t = 0.6;
      const qx = (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * mx + t * t * b.x;
      const qy = (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * my + t * t * b.y;
      const dx = 2 * (1 - t) * (mx - a.x) + 2 * t * (b.x - mx);
      const dy = 2 * (1 - t) * (my - a.y) + 2 * t * (b.y - my);
      ctx.save();
      ctx.translate(qx, qy);
      ctx.rotate(Math.atan2(dy, dx));
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-9, -4);
      ctx.lineTo(-9, 4);
      ctx.closePath();
      ctx.fillStyle = accent;
      ctx.fill();
      ctx.restore();

      // Segment label
      if (segments[i]) {
        const label = mode === 'time' ? segments[i].val + 'h' : '$' + segments[i].val;
        ctx.font = '500 11px "DM Mono", monospace';
        ctx.fillStyle = accent;
        ctx.textAlign = 'center';
        ctx.fillText(label, (a.x + b.x) / 2 + 6, (a.y + b.y) / 2 - 32);
      }
    }
  }

  // City dots + labels
  Object.entries(cityCoords).forEach(([name, coord]) => {
    const p = proj(coord);
    const onRoute = routePath.includes(name);

    if (onRoute) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 11, 0, Math.PI * 2);
      ctx.fillStyle = dark ? 'rgba(239,159,39,0.15)' : 'rgba(186,117,23,0.15)';
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, onRoute ? 6 : 4, 0, Math.PI * 2);
    ctx.fillStyle = onRoute ? accent : (dark ? '#4a4a45' : '#c0bdb3');
    ctx.fill();

    ctx.font = onRoute ? '500 12px sans-serif' : '400 11px sans-serif';
    ctx.fillStyle = onRoute ? (dark ? '#e8e6de' : '#1a1a18') : (dark ? '#5a5a55' : '#9a9890');
    ctx.textAlign = 'center';
    const offsetY = (name === 'Dubai' || name === 'Rome') ? 20 : -12;
    ctx.fillText(name, p.x, p.y + offsetY);
  });
}

drawMap([], []);
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (lastResult) drawMap(lastResult.path, lastResult.segments);
  else drawMap([], []);
});