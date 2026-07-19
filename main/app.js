const ACTION_NAMES = { u: 'Up', d: 'Down', l: 'Left', r: 'Right', f: 'Forward', b: 'Backward' };
const ROOM_NAMES = {
    "main": "Main Lobby Entrance",

    "main1": "Main Lobby - Floor 1",
    "stair1-l": "Left Stairs - Floor 1",
    "stair1-r": "Right Stairs - Floor 1",
    "mcr1": "Male CR - Floor 1",
    "fcr1": "Female CR - Floor 1",
    "101": "CB 101 - Clinic",
    "102": "CB 102 - Faculty",
    "103": "CB 103 - Classroom",
    "104": "CB 104 - Chemistry Lab",
    "105": "CB 105 - Science Lab",
    "106": "CB 106 - Classroom",
    "107": "CB 107 - Classroom",
    "admin": "Administration Office",

    "main2": "Main Lobby - Floor 2",
    "stair2-l": "Left Stairs - Floor 2",
    "stair2-r": "Right Stairs - Floor 2",
    "mcr2": "Male CR - Floor 2",
    "fcr2": "Female CR - Floor 2",
    "201": "CB 201 - Classroom",
    "202": "CB 202 - Classroom",
    "203": "CB 203 - Classroom",
    "204": "CB 204 - Education Room",
    "205": "CB 205 - Computer Lab 1",
    "206": "CB 206 - Computer Lab 2",
    "207": "CB 207 - Classroom",
    "208": "CB 208 - Classroom",

    "main3": "Main Lobby - Floor 3",
    "stair3-l": "Left Stairs - Floor 3",
    "stair3-r": "Right Stairs - Floor 3",
    "mcr3": "Male CR - Floor 3",
    "fcr3": "Female CR - Floor 3",
    "mini": "Mini Hotel",
    "lib": "Library",
    "speech": "Speech Lab",
    "audi": "Auditorium"
};

let allRooms = [];
let campusMap = {};
let startSelect;
let targetSelect;
let computeButton;

function filterTargetDropdown() {
    const selectedStart = startSelect.value;
    const previousTargetValue = targetSelect.value;

    targetSelect.innerHTML = ''; 

    allRooms.forEach(room => {
        const option = document.createElement('option');
        option.value = room;
        // 🛠️ FIXED: Uses your beautiful descriptive room name dictionary mapping here
        option.textContent = (ROOM_NAMES[room] || room.toUpperCase());

        if (room === selectedStart) {
            option.disabled = true;
            option.style.color = '#64748b'; 
        }

        targetSelect.appendChild(option);
    });

    if (previousTargetValue === selectedStart || !previousTargetValue) {
        const firstValidRoom = allRooms.find(room => room !== selectedStart);
        if (firstValidRoom) {
            targetSelect.value = firstValidRoom;
        }
    } else {
        targetSelect.value = previousTargetValue;
    }

    updateImageViewer(selectedStart, selectedStart);
}

function updateImageViewer(roomKey, direction) {
    const imgElement = document.getElementById('nav-display');
    const imagePath = `../School-GPS/${roomKey}/${direction}.jpeg`;
    
    imgElement.onerror = () => {
        imgElement.onerror = null;
        imgElement.src = '../School-GPS/default/default.jpeg';
    };

    imgElement.src = imagePath;

    const readableName = ROOM_NAMES[roomKey] || roomKey.toUpperCase();
    document.getElementById('room-name').innerText = `LOCATION: ${readableName}`;
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function calculateRoute() {
    const start = startSelect.value;
    const target = targetSelect.value;
    const outputBox = document.getElementById('path-output');

    const route = BFS(campusMap, start, target);

    if (!route) {
        outputBox.innerHTML = `<span style="color: #f87171;">❌ No path found to target room.</span>`;
        return;
    }

    let pathString = ROOM_NAMES[start] || start.toUpperCase();
    outputBox.innerHTML = `<strong>Shortest Route:</strong><br>${pathString}`;

    updateImageViewer(start, start);

    for (const step of route) {
        await sleep(1000);
        
        updateImageViewer(step.room, step.action);
        
        const nextRoomReadable = ROOM_NAMES[step.next] || step.next.toUpperCase();
        pathString += ` ➔ ${nextRoomReadable}`;
        outputBox.innerHTML = `<strong>Shortest Route:</strong><br>${pathString}`;
    }

    await sleep(1000);
    updateImageViewer(target, target);
}

function initialize_next() {
    startSelect.value = targetSelect.value;
    filterTargetDropdown();
}

window.addEventListener("DOMContentLoaded", async () => {
    startSelect = document.getElementById('startRoom');
    targetSelect = document.getElementById('targetRoom');
    computeButton = document.getElementById('compute_route');

    campusMap = await (async () => {
        try {
            const response = await fetch('./graph.json');
            return await response.json();
        } catch (error) {
            console.log("❌ Reading json file failed. " + error);
            return {};
        }
    })();

    allRooms = Object.keys(campusMap);

    allRooms.forEach(room => {
        const option = document.createElement('option');
        option.value = room;
        // 🛠️ FIXED: Displays custom map room titles inside the initialization loop box options
        option.textContent = (ROOM_NAMES[room] || room.toUpperCase());
        startSelect.appendChild(option);
    });

    filterTargetDropdown();

    startSelect.addEventListener('change', filterTargetDropdown);
    let isCalculating = false;

    computeButton.addEventListener('click', async () => {
        if (isCalculating) return;
        
        isCalculating = true;
        computeButton.disabled = true;

        try {
            await calculateRoute();
        } catch (error) {
            console.error(error);
        } finally {
            initialize_next();
            isCalculating = false;
            computeButton.disabled = false;
        }
    });
});