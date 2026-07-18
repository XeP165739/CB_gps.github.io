# Indoor GPS Navigation - CMI College Building

A lightweight, console-based indoor navigation system that calculates the shortest path between rooms in the CMI College Building using the Breadth-First Search (BFS) algorithm.

## Features
* **Shortest Path Calculation:** Guarantees the absolute fewest room steps or corridor connections using BFS.
* **Indoor Mapping:** Tailored specifically for the layout, corridors, and rooms of the CMI College Building.
* **Interactive CLI:** Prompt-driven command-line interface for selecting starting points and destinations.

## How It Works
1. **The Map as a Graph:** Rooms and intersections are modeled as nodes, while connecting hallways are edges.
2. **BFS Optimization:** Since indoor corridors generally have uniform distances, Breadth-First Search (BFS) is the ideal algorithm to find the shortest hop-count path.

## Installation
Clone the repository and install the dependencies:
```bash
git clone https://github.com
cd cmi-gps-bfs
npm install
```

## Usage
Start the navigation system using:
```bash
npm start
```

### Example Run

## Tech Stack
* **Runtime:** Node.js
* **Dependencies:** `inquirer` (for interactive CLI prompts)
* **Algorithm:** Breadth-First Search (BFS) using an Adjacency List graph structure

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
