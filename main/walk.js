const fs = require('fs');
const prompt = require('prompt-sync')();

const ACTION_NAMES = { u: 'Up', d: 'Down', l: 'Left', r: 'Right', f: 'Forward', b: 'Backward' };

const campusMap = (() => {
    try {
        const fileData = fs.readFileSync('./js/graph.json', 'utf8');
        return JSON.parse(fileData);
    } catch (error) {
        console.log("❌ Reading json file failed. " + error);
        return {};
    }
})();

function BFS(start, target) {
    if (start === target) return [];

    // The queue stores the current room and the total path taken to reach it
    const queue = [ { currentRoom: start, path: [] } ];
    const visited = new Set([start]);

    while (queue.length > 0) {
        const { currentRoom, path } = queue.shift();

        // Fetch children/edges from the graph configuration
        const neighbors = campusMap[currentRoom] || [];

        for (const neighborObj of neighbors) {
            const nextRoom = Object.keys(neighborObj)[0];
            const actionTaken = neighborObj[nextRoom];

            if (!visited.has(nextRoom)) {
                // Keep track of the room and the visual direction action used to get there
                const newPath = [...path, { room: nextRoom, action: actionTaken }];

                if (nextRoom === target) {
                    return newPath; // Return immediately upon finding the target
                }

                visited.add(nextRoom);
                queue.push({ currentRoom: nextRoom, path: newPath });
            }
        }
    }
    return null; // Return null if there is no possible path
}

function find_path(start, target) {
    const travelHistory = BFS(start, target);

    if (travelHistory) {
        const pathStrings = travelHistory.map(step => `(${ACTION_NAMES[step.action]}) ➔  ${step.room}`);
        console.log(`Your Traveled Path: ${start} ` + pathStrings.join(" ") + "\n");
    } else {
        console.log(`❌ No path found between ${start} and ${target}.`);
    }
}

module.exports = { BFS }

if (require.main === module){
    find_path("fcr3", "audi");
}