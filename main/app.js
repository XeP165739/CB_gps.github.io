const ACTION_NAMES = { u: 'Up', d: 'Down', l: 'Left', r: 'Right', f: 'Forward', b: 'Backward' };

let allRooms = [];
let campusMap = {};
let startSelect;
let targetSelect;
let computeButton;

function filterTargetDropdown() {
    const selectedStart = startSelect.value;
    const previousTargetValue = targetSelect.value;

    targetSelect.innerHTML = ''; // Wipe out existing listings

    allRooms.forEach(room => {
        const option = document.createElement('option');
        option.value = room;
        option.textContent = room.toUpperCase();

        // If the room matches the starting room, grey/black it out and make it unclickable
        if (room === selectedStart) {
            option.disabled = true;
            option.style.color = '#64748b'; // Dim color style for visibility
        }

        targetSelect.appendChild(option);
    });

    // Auto-adjust target if the previously selected target is now disabled
    if (previousTargetValue === selectedStart || !previousTargetValue) {
        // Find the first available room that isn't the starting room
        const firstValidRoom = allRooms.find(room => room !== selectedStart);
        if (firstValidRoom) {
            targetSelect.value = firstValidRoom;
        }
    } else {
        targetSelect.value = previousTargetValue;
    }

    // Set initial image view to mirror selected start location
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

    document.getElementById('room-name').innerText = `LOCATION: ${roomKey.toUpperCase()}`;
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

    let pathString = start.toUpperCase();
    outputBox.innerHTML = `<strong>Shortest Route:</strong><br>${pathString}`;

    updateImageViewer(start, start);

    for (const step of route) {
        await sleep(1000);
        
        pathString += ` ${step.action} ➔ ${step.room.toUpperCase()}`;
        outputBox.innerHTML = `<strong>Shortest Route:</strong><br>${pathString}`;
        
        updateImageViewer(step.room, step.action);
    }

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
            const data = await response.json();
            return data;
        } catch (error) {
            console.log("❌ Reading json file failed. " + error);
            return {};
        }
    })();

    allRooms = Object.keys(campusMap);

    allRooms.forEach(room => {
        const option = document.createElement('option');
        option.value = room;
        option.textContent = room.toUpperCase();
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
