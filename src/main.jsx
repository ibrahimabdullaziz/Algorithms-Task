import { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { RefreshCcw, Search, Timer, Trophy } from "lucide-react";
import "./styles.css";

const DATASET_SIZE = 5000;
const VALUE_LIMIT = 10000;

function generateDataset() {
  return Array.from(
    { length: DATASET_SIZE },
    () => Math.floor(Math.random() * VALUE_LIMIT) + 1,
  );
}

function bubbleSort(input) {
  const data = [...input];
  const n = data.length;

  for (let i = 0; i < n - 1; i += 1) {
    let swapped = false;

    for (let j = 0; j < n - i - 1; j += 1) {
      if (data[j] > data[j + 1]) {
        [data[j], data[j + 1]] = [data[j + 1], data[j]];
        swapped = true;
      }
    }

    if (!swapped) break;
  }

  return data;
}

function quickSort(input) {
  const data = [...input];

  function partition(left, right) {
    const pivot = data[right];
    let smallerIndex = left - 1;

    for (let current = left; current < right; current += 1) {
      if (data[current] <= pivot) {
        smallerIndex += 1;
        [data[smallerIndex], data[current]] = [
          data[current],
          data[smallerIndex],
        ];
      }
    }

    [data[smallerIndex + 1], data[right]] = [
      data[right],
      data[smallerIndex + 1],
    ];
    return smallerIndex + 1;
  }

  function sort(left, right) {
    if (left >= right) return;
    const pivotIndex = partition(left, right);
    sort(left, pivotIndex - 1);
    sort(pivotIndex + 1, right);
  }

  sort(0, data.length - 1);
  return data;
}

function linearSearch(data, target) {
  for (let index = 0; index < data.length; index += 1) {
    if (data[index] === target) return index;
  }

  return -1;
}

function binarySearch(sortedData, target) {
  let left = 0;
  let right = sortedData.length - 1;

  while (left <= right) {
    const middle = Math.floor((left + right) / 2);

    if (sortedData[middle] === target) return middle;
    if (sortedData[middle] < target) left = middle + 1;
    else right = middle - 1;
  }

  return -1;
}

function measure(callback) {
  const start = performance.now();
  const result = callback();
  const end = performance.now();

  return {
    result,
    time: end - start,
  };
}

function runAlgorithms(dataset, target) {
  const bubble = measure(() => bubbleSort(dataset));
  const quick = measure(() => quickSort(dataset));
  const linear = measure(() => linearSearch(dataset, target));
  const binary = measure(() => binarySearch(quick.result, target));

  return {
    bubbleSorted: bubble.result,
    quickSorted: quick.result,
    rows: [
      {
        name: "Bubble Sort",
        type: "Sorting",
        complexity: "O(n^2)",
        time: bubble.time,
      },
      {
        name: "Quick Sort",
        type: "Sorting",
        complexity: "O(n log n)",
        time: quick.time,
      },
      {
        name: "Linear Search",
        type: "Searching",
        complexity: "O(n)",
        time: linear.time,
      },
      {
        name: "Binary Search",
        type: "Searching",
        complexity: "O(log n)",
        time: binary.time,
      },
    ],
    search: {
      target,
      linearIndex: linear.result,
      binaryIndex: binary.result,
    },
  };
}

function formatTime(milliseconds) {
  return `${milliseconds.toFixed(10)} ms`;
}

function DataPanel({ title, data }) {
  const preview = data.slice(0, 120).join(", ");

  return (
    <section className="panel data-panel">
      <div className="panel-heading">
        <h2>{title}</h2>
        <span>{data.length.toLocaleString()} integers</span>
      </div>
      <p>
        {preview}
        {data.length > 120 ? ", ..." : ""}
      </p>
    </section>
  );
}

function App() {
  const [dataset, setDataset] = useState(() => generateDataset());
  const [target, setTarget] = useState(
    () => dataset[Math.floor(Math.random() * dataset.length)],
  );

  const results = useMemo(
    () => runAlgorithms(dataset, target),
    [dataset, target],
  );
  const fastestSort = results.rows
    .filter((row) => row.type === "Sorting")
    .reduce((best, row) => (row.time < best.time ? row : best));
  const fastestSearch = results.rows
    .filter((row) => row.type === "Searching")
    .reduce((best, row) => (row.time < best.time ? row : best));

  function regenerate() {
    const nextDataset = generateDataset();
    setDataset(nextDataset);
    setTarget(nextDataset[Math.floor(Math.random() * nextDataset.length)]);
  }

  function chooseRandomTarget() {
    setTarget(dataset[Math.floor(Math.random() * dataset.length)]);
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <h1>Algorithms Practical Exam</h1>
          <p className="intro">
            Bubble Sort, Quick Sort, Linear Search, and Binary Search measured
            on the same randomly generated dataset.
          </p>
        </div>
        <div className="hero-actions">
          <button type="button" onClick={regenerate}>
            <RefreshCcw size={18} />
            Generate Dataset
          </button>
          <button
            type="button"
            className="secondary"
            onClick={chooseRandomTarget}
          >
            <Search size={18} />
            New Target
          </button>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <Timer size={22} />
          <div>
            <span>Dataset Size</span>
            <strong>{DATASET_SIZE.toLocaleString()}</strong>
          </div>
        </article>
        <article className="stat-card">
          <Search size={22} />
          <div>
            <span>Search Target</span>
            <strong>{target}</strong>
          </div>
        </article>
        <article className="stat-card">
          <Trophy size={22} />
          <div>
            <span>Best Sort</span>
            <strong>{fastestSort.name}</strong>
          </div>
        </article>
        <article className="stat-card">
          <Trophy size={22} />
          <div>
            <span>Best Search</span>
            <strong>{fastestSearch.name}</strong>
          </div>
        </article>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>Execution Time Comparison</h2>
          <span>performance.now()</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Algorithm</th>
                <th>Category</th>
                <th>Time Complexity</th>
                <th>Execution Time</th>
              </tr>
            </thead>
            <tbody>
              {results.rows.map((row) => (
                <tr key={row.name}>
                  <td>{row.name}</td>
                  <td>{row.type}</td>
                  <td>{row.complexity}</td>
                  <td>{formatTime(row.time)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="search-grid">
        <article className="panel result-card">
          <h2>Linear Search Result</h2>
          <strong>
            {results.search.linearIndex >= 0 ? "Found" : "Not Found"}
          </strong>
          <p>Index in unsorted dataset: {results.search.linearIndex}</p>
        </article>
        <article className="panel result-card">
          <h2>Binary Search Result</h2>
          <strong>
            {results.search.binaryIndex >= 0 ? "Found" : "Not Found"}
          </strong>
          <p>Index in sorted dataset: {results.search.binaryIndex}</p>
        </article>
      </section>

      <section className="data-grid">
        <DataPanel title="Original Data" data={dataset} />
        <DataPanel title="Sorted Data" data={results.quickSorted} />
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
