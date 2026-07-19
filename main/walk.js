let fs;
let prompt;

if (typeof require !== 'undefined') {
    fs = require('fs');
    prompt = require('prompt-sync')();
}

const ACTION_NAMES = { u: 'Up', d: 'Down', l: 'Left', r: 'Right', f: 'Forward', b: 'Backward' };

function BFS(campusMap, start, target) {
    if (start === target) return [];

    const queue = [ { currentRoom: start, path: [] } ];
    const visited = new Set([start]);

    while (queue.length > 0) {
        const { currentRoom, path } = queue.shift();

        const neighbors = campusMap[currentRoom] || [];

        for (const neighborObj of neighbors) {
            const nextRoom = Object.keys(neighborObj)[0];
            const actionTaken = neighborObj[nextRoom];

            if (!visited.has(nextRoom)) {
                const newPath = [...path, { room: currentRoom, action: actionTaken, next: nextRoom }];

                if (nextRoom === target) {
                    return newPath; 
                }

                visited.add(nextRoom);
                queue.push({ currentRoom: nextRoom, path: newPath });
            }
        }
    }
    return null; 
}

function find_path(campusMap, start, target) {
    const travelHistory = BFS(campusMap, start, target);

    if (travelHistory) {
        // 🛠️ Re-mapped to output: "CurrentRoom (Action) ➔ NextRoom" structure
        const pathStrings = travelHistory.map(step => `➔  (${ACTION_NAMES[step.action]}) ➔  ${step.next}`);
        console.log(`Your Traveled Path: ${start} ` + pathStrings.join(" ") + "\n");
    } else {
        console.log(`❌ No path found between ${start} and ${target}.`);
    }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    // We are in Node.js environment
    module.exports = { BFS };
} else {
    // We are in the Browser environment
    window.BFS = BFS;
}

if (typeof require !== 'undefined' && require.main === module) {
    const campusMap = (() => {
        try {
            const fileData = fs.readFileSync('./main/graph.json', 'utf8');
            return JSON.parse(fileData);
        } catch (error) {
            console.log("❌ Reading json file failed. " + error);
            return {};
        }
    })();

    find_path(campusMap, "101", "main");
}