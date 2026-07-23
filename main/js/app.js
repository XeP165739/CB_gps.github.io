/**
 * @file app.js
 * @description Frontend controller for CMI_CB_GPS -XeP. Maps dropdown selectors,
 * coordinates graph route data, feeds state values to the visual rendering viewer,
 * and tracks procedural asynchronous route animations.
 */

/**
 * Human-readable dictionary translating character codes into action strings.
 * @constant {Object}
 */
const ACTION_NAMES = { u: 'Up', d: 'Down', l: 'Left', r: 'Right', f: 'Forward', b: 'Backward' };

/**
 * Global registry map containing pretty descriptive labels for campus rooms.
 * Loaded dynamically from room_name.json.
 * @type {Object}
 */
let ROOM_NAMES = {};

// App state containers and DOM hook references
let allRooms = [];
let campusMap = {};
let startSelect;
let targetSelect;
let computeButton;

/**
 * Populates and dynamic filters the target destination selector array.
 * Ensures the currently selected starting room cannot be picked as the target destination.
 */
function filterTargetDropdown() {
    const selectedStart = startSelect.value;
    const previousTargetValue = targetSelect.value;

    // Clear all existing target dropdown choices
    targetSelect.innerHTML = ''; 

    // Rebuild the target selection option items array list layout
    allRooms.forEach(room => {
        const option = document.createElement('option');
        option.value = room;
        option.textContent = (ROOM_NAMES[room] || room.toUpperCase());

        // Disable matching start coordinates so users can't travel to their current location
        if (room === selectedStart) {
            option.disabled = true;
            option.style.color = '#64748b'; // Muted grey style indication
        }

        targetSelect.appendChild(option);
    });

    // Keep the previously chosen room selected if it's still valid, otherwise reset to the first available room
    if (previousTargetValue === selectedStart || !previousTargetValue) {
        const firstValidRoom = allRooms.find(room => room !== selectedStart);
        if (firstValidRoom) {
            targetSelect.value = firstValidRoom;
        }
    } else {
        targetSelect.value = previousTargetValue;
    }

    // Initialize viewport image to look at the new initial departure layout frame
    updateImageViewer(selectedStart, selectedStart);
}

/**
 * Updates the screen navigation element assets with matching camera directional photos.
 * 
 * @param {string} roomKey - The unique key identifying the room node folder location.
 * @param {string} direction - The sub-action direction key target file frame code (e.g., 'f').
 */
function updateImageViewer(roomKey, direction) {
    const imgElement = document.getElementById('nav-display');
    const imagePath = `../School-GPS/${roomKey}/${direction}.jpeg`;
    
    // Fallback: If a specific perspective asset fails to load, gracefully assign the global placeholder frame
    imgElement.onerror = () => {
        imgElement.onerror = null;
        imgElement.src = 'https://xep165739.github.io/CB_gps.github.io/School-GPS/default/default.jpeg';
    };

    imgElement.src = imagePath;

    // Dynamic label rendering framework banner update
    const readableName = ROOM_NAMES[roomKey] || roomKey.toUpperCase();
    document.getElementById('room-name').innerText = `LOCATION: ${readableName}`;
}

/**
 * Simple asynchronous delay utility using native ES6 Promise resolution mechanics.
 * @param {number} ms - Time target value delay setting unit measured in milliseconds.
 * @returns {Promise}
 */
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Primary navigation runner event engine. Pulls parameters, resolves the 
 * underlying BFS tracking model, and drives the async loop animation framework.
 */
async function calculateRoute() {
    const start = startSelect.value;
    const target = targetSelect.value;
    const outputBox = document.getElementById('path-output');

    // Run the global pathfinder function linked from your walk.js engine
    const route = BFS(campusMap, start, target);

    // Abort processing operations cleanly if no edges connect the rooms
    if (!route) {
        outputBox.innerHTML = `<span style="color: #f87171;">❌ No path found to target room.</span>`;
        return;
    }

    // Set initial text breadcrumb display state
    let pathString = ROOM_NAMES[start] || start.toUpperCase();
    outputBox.innerHTML = `<strong>Shortest Route:</strong><br>${pathString}`;

    // Frame 1 position update
    updateImageViewer(start, start);

    // Sequentially step through the calculated navigation trail array
    for (const step of route) {
        await sleep(1000); // 1-second pause to simulate realistic movement pacing
        
        // Update photo view container based on the action required for this edge transition
        updateImageViewer(step.room, step.action);
        
        // Append next verified room node onto the text tracking path breadcrumb trail
        const nextRoomReadable = ROOM_NAMES[step.next] || step.next.toUpperCase();
        pathString += ` ➔ ${nextRoomReadable}`;
        outputBox.innerHTML = `<strong>Shortest Route:</strong><br>${pathString}`;
    }

    // Final target arrival verification hook sequence frame update
    await sleep(1000);
    updateImageViewer(target, target);
}

/**
 * Post-routing cleanup helper. Automatically shifts the new starting position 
 * layout to match the user's last arrived target destination for continuous navigation.
 */
function initialize_next() {
    startSelect.value = targetSelect.value;
    filterTargetDropdown();
}

/**
 * Main application initialization pipeline setup. Fires instantly when the 
 * DOM tree structure finishes loading.
 */
window.addEventListener("DOMContentLoaded", async () => {
    /**
     * Global registry file path configurations.
     * Points to the structured JSON configuration data assets within the main architecture.
     * @constant {string}
     */
    const ROOM_NAME_PATH = './main/json/room_name.json';
    const CAMPUS_MAP_PATH = './main/json/campus_map.json';

    // Bind global layout interface target selectors
    startSelect = document.getElementById('startRoom');
    targetSelect = document.getElementById('targetRoom');
    computeButton = document.getElementById('compute_route');

    // Fetch and register descriptive room dictionary labels
    ROOM_NAMES = await (async () => {
        try {
            const response = await fetch(ROOM_NAME_PATH);
            return await response.json();
        } catch (error) {
            console.log("❌ Reading json file failed. " + error);
            return {};
        }
    })();

    // Fetch and register network map edge structures
    campusMap = await (async () => {
        try {
            const response = await fetch(CAMPUS_MAP_PATH);
            return await response.json();
        } catch (error) {
            console.log("❌ Reading json file failed. " + error);
            return {};
        }
    })();

    // Extract raw room identifier keys array list collection
    allRooms = Object.keys(campusMap);

    // Populate initial dataset choice options inside the start departure dropdown box
    allRooms.forEach(room => {
        const option = document.createElement('option');
        option.value = room;
        option.textContent = (ROOM_NAMES[room] || room.toUpperCase());
        startSelect.appendChild(option);
    });

    // Run primary evaluation configuration checks setup tasks
    filterTargetDropdown();

    // Attach active listener change handlers onto target items list
    startSelect.addEventListener('change', filterTargetDropdown);
    
    // Flag preventing multi-click event collision errors
    let isCalculating = false;

    // Execution route button configuration listener hook handler setup tasks
    computeButton.addEventListener('click', async () => {
        if (isCalculating) return; // Ignore input actions if a search routine is active
        
        isCalculating = true;
        computeButton.disabled = true;

        try {
            await calculateRoute();
        } catch (error) {
            console.error(error);
        } finally {
            // Re-enable interactive elements and update position metrics data fields
            initialize_next();
            isCalculating = false;
            computeButton.disabled = false;
        }
    });
});