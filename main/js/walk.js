/**
 * @file walk.js
 * @description Pathfinding engine for CMI_CB_GPS -XeP. 
 * Implements a Breadth-First Search (BFS) algorithm to calculate the shortest path
 * between campus rooms and exports it safely for both Node.js and Browser environments.
 */

let fs;
let prompt;

// Environment Setup: Load Node.js specific modules only if running server-side
if (typeof require !== 'undefined') {
    fs = require('fs');
    prompt = require('prompt-sync')();
}

/**
 * Human-readable translations for directional action codes.
 * @constant {Object}
 */
const ACTION_NAMES = { u: 'Up', d: 'Down', l: 'Left', r: 'Right', f: 'Forward', b: 'Backward' };

/**
 * Calculates the shortest path between two room nodes using Breadth-First Search (BFS).
 * 
 * @param {Object} campusMap - The graph object containing room nodes and their connected edges.
 * @param {string} start - The key code of the source room (e.g., "101").
 * @param {string} target - The key code of the destination room (e.g., "main").
 * @returns {Array|null} Array of step objects [{room, action, next}] if found, [] if start matches target, or null if trapped.
 */
function BFS(campusMap, start, target) {
    // Edge Case: If the user is already at the destination, no movement is required
    if (start === target) return [];

    // Initialize the FIFO (First-In-First-Out) queue with the starting node configuration
    const queue = [ { currentRoom: start, path: [] } ];
    
    // Track visited nodes to prevent the algorithm from looping infinitely in cyclic pathways
    const visited = new Set([start]);

    // Process the queue layer by layer until all reachable paths are exhausted
    while (queue.length > 0) {
        // Dequeue the front element to evaluate its neighbors
        const { currentRoom, path } = queue.shift();

        // Retrieve connected neighbors; default to an empty array if the room code doesn't exist in the graph
        const neighbors = campusMap[currentRoom] || [];

        // Traverse all directional neighbors branching off the current room
        for (const neighborObj of neighbors) {
            // Extract the neighbor's room key and the specific directional action required to get there
            const nextRoom = Object.keys(neighborObj)[0];
            const actionTaken = neighborObj[nextRoom];

            // Only process the branch if the neighbor node hasn't been evaluated yet
            if (!visited.has(nextRoom)) {
                // Record this step into a new immutable historical trajectory path array
                const newPath = [...path, { room: currentRoom, action: actionTaken, next: nextRoom }];

                // Target Check: If this node is the destination, return the completed path immediately
                if (nextRoom === target) {
                    return newPath; 
                }

                // Otherwise, mark it as visited and queue it up to search deeper on the next pass
                visited.add(nextRoom);
                queue.push({ currentRoom: nextRoom, path: newPath });
            }
        }
    }
    
    // Return null if the queue empties out completely without ever discovering the target node
    return null; 
}

/**
 * Terminal helper function that routes the raw BFS array path and logs it out 
 * to the terminal console as a clean, human-readable breadcrumb trail.
 * 
 * @param {Object} campusMap - The layout graph network object.
 * @param {string} start - The departure room key code.
 * @param {string} target - The arrival room key code.
 */
function find_path(campusMap, start, target) {
    const travelHistory = BFS(campusMap, start, target);

    if (travelHistory) {
        // Map the step objects into clean descriptive transition blocks: "➔ (Action) ➔ NextRoom"
        const pathStrings = travelHistory.map(step => `➔  (${ACTION_NAMES[step.action]}) ➔  ${step.next}`);
        console.log(`Your Traveled Path: ${start} ` + pathStrings.join(" ") + "\n");
    } else {
        console.log(`❌ No path found between ${start} and ${target}.`);
    }
}

/**
 * Cross-Platform Environment Guard
 * Safely exposes the BFS module to CommonJS runtimes (Node.js) or maps it
 * onto the global Window container layout when parsed inside web browsers.
 */
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = { BFS }; // Node.js export module pattern
} else {
    window.BFS = BFS;         // Web browser global injection pattern
}

/**
 * Autonomous Local CLI Debugging Sandbox
 * Triggers automatically ONLY when running the file directly via node terminal command (`node walk.js`)
 */
if (typeof require !== 'undefined' && require.main === module) {
    const campusMap = (() => {
        try {
            // Synchronously load and parse the graph data layout directly from your asset tree
            const fileData = fs.readFileSync('./main/json/campus_map.json', 'utf8');
            return JSON.parse(fileData);
        } catch (error) {
            console.log("❌ Reading json file failed. " + error);
            return {};
        }
    })();

    // Run a sandbox path routine check from Room 101 to the Main Entrance
    find_path(campusMap, "101", "main");
}