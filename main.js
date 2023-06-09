// TODO: add eat fruit, stop and evaluate.
const PRESET_OPTIONS = [
    { label: 'Focus', minInterval: 25, maxInterval: 120, audioSrc: 'audio/focus.mp3' },
    { label: 'Mindfulness', minInterval: 5, maxInterval: 30, audioSrc: 'audio/mindfulness.mp3' },
    { label: 'Hydration', minInterval: 30, maxInterval: 120, audioSrc: 'audio/hydration.mp3' },
    { label: 'Movement', minInterval: 30, maxInterval: 240, audioSrc: 'audio/movement.mp3' },
    { label: 'Gratitude', minInterval: 120, maxInterval: 720, audioSrc: 'audio/gratitude.mp3' },
    { label: 'Eat Fruit', minInterval: 30, maxInterval: 120, audioSrc: 'audio/eat-fruit.mp3' },
    { label: 'Pause and Evaluate', minInterval: 15, maxInterval: 60, audioSrc: 'audio/pause-and-evaluate.mp3' }
];

let instanceCounter = 0;

let audioIntervalInstances = [];

const DEFAULT_COUNTDOWN_VISIBILITY = false;

function createAudioIntervalInstance({ label, minInterval, maxInterval, audioSrc, isCountdownVisible = DEFAULT_COUNTDOWN_VISIBILITY }) {
    const instanceId = instanceCounter++;
    // Convert the input values from minutes to seconds
    minInterval *= 60;
    maxInterval *= 60;
    // Add the instance to the list of instances
    audioIntervalInstances.push({ instanceId, label, minInterval, maxInterval, audioSrc, isCountdownVisible, volume: 0.5 });

    // Render the instance on the page
    renderAudioIntervalInstance({ instanceId, label, minInterval, maxInterval, audioSrc, isCountdownVisible });
}


function updateInstanceProperty(instanceId, propertyName, newValue) {
    // Update the instance in the list
    const instance = audioIntervalInstances.find(instance => instance.instanceId === instanceId);
    if (instance) {
        instance[propertyName] = newValue;
    }
}

function updateInstanceSetting(instanceId, settingName, newValue) {
    const instance = audioIntervalInstances.find(instance => instance.instanceId === instanceId);
    if (!instance) return;

    instance[settingName] = newValue;

    if (settingName === 'audioSrc') {
        const audioElement = document.getElementById(`audio-${instanceId}`);
        if (audioElement) {
            audioElement.src = newValue;
        }
    }
}

function startAudio(instanceId) {
    const instance = audioIntervalInstances.find(instance => instance.instanceId === instanceId);
    if (!instance) return;

    stopAudio(instanceId); // Ensure any running timers are stopped before starting a new one

    const playWithInterval = () => {
        const interval = getRandomInterval(instance.minInterval, instance.maxInterval);
        instance.timerId = setTimeout(() => {
            playAudio(instanceId);
            playWithInterval();
        }, interval);

        if (instance.countdownIntervalId) {
            clearInterval(instance.countdownIntervalId); // Clear the existing countdown interval
        }

        let remainingTime = interval / 1000;
        if (instance.isCountdownVisible) {
            updateCountdown(instanceId, remainingTime);
        }
        instance.countdownIntervalId = setInterval(() => {
            remainingTime--;
            if (instance.isCountdownVisible) {
                updateCountdown(instanceId, remainingTime);
            }
            if (remainingTime <= 0) {
                clearInterval(instance.countdownIntervalId);
            }
        }, 1000);
    };

    playWithInterval();
}




function updateCountdown(instanceId, remainingTime) {
    const timeElement = document.getElementById(`time-${instanceId}`);
    if (timeElement) {
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        timeElement.textContent = `${minutes}m ${seconds}s`;
    }
}

function getRandomInterval(minInterval, maxInterval) {
    const minMilliseconds = minInterval * 1000;
    const maxMilliseconds = maxInterval * 1000;
    return Math.floor(Math.random() * (maxMilliseconds - minMilliseconds + 1)) + minMilliseconds;
}




function renderAudioIntervalInstance({ instanceId, label, minInterval, maxInterval, audioSrc, isCountdownVisible }) {
    // Convert the minInterval and maxInterval values to minutes for display
    const minIntervalInMinutes = minInterval / 60;
    const maxIntervalInMinutes = maxInterval / 60;
    const instancesContainer = document.getElementById('audio-interval-instances');
    const countdownVisibilityClass = isCountdownVisible ? '' : 'hide';
    const instanceHtml = `
    <div class="audio-interval-instance col-12 col-lg-6" id="instance-${instanceId}">
        <div class="audio-interval-instance-content p-3">
            <div class="text-center mb-3">
                <h4 class="mb-0" id="title-${instanceId}">${label}</h4>
            </div>
            <div class="row">
                <audio id="audio-${instanceId}" src="${audioSrc}"></audio>
                <div class="form-group col-6">
                    <label for="minInterval-${instanceId}">Minimum Interval (minutes):</label>
                    <input type="number" class="form-control" id="minInterval-${instanceId}" value="${minIntervalInMinutes}">
                </div>
                <div class="form-group col-6">
                    <label for="maxInterval-${instanceId}">Maximum Interval (minutes):</label>
                    <input type="number" class="form-control" id="maxInterval-${instanceId}" value="${maxIntervalInMinutes}">
                </div>
                <div class="form-group col-12">
                    <label for="instanceLabel-${instanceId}">Instance Label:</label>
                    <input type="text" class="form-control" id="instanceLabel-${instanceId}" value="${label}">
                </div>
                <div class="form-group col-12">
                    <label for="volumeControl-${instanceId}">Volume:</label>
                    <input type="range" class="form-control-range" id="volumeControl-${instanceId}" min="0" max="1" step="0.01" value="0.5">
                </div>
                <div class="form-group col-12">
                    <label for="audioFile-${instanceId}">Change audio file:</label>
                    <input type="file" class="form-control-file" id="audioFile-${instanceId}" accept="audio/*">
                </div>
                <div class="text-center col-12">
                    <button class="btn btn-success mr-2" onclick="startAudio(${instanceId})">
                        <i class="bi bi-play-fill"></i>
                    </button>
                    <button class="btn btn-danger mr-2" onclick="stopAudio(${instanceId})">
                        <i class="bi bi-stop-fill"></i>
                    </button>
                    <button class="btn btn-warning mr-2" onclick="toggleCountdownVisibility(${instanceId})">
                        <i class="bi bi-clock"></i>
                    </button>
                    <button class="btn btn-danger" onclick="deleteInstance(${instanceId})">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                </div>
            
            </div>
            <div class="row mt-3 ${countdownVisibilityClass}" id="countdown-${instanceId}">
                <div class="col-12">
                    <p class="text-center">Next audio in <span id="time-${instanceId}"></span></p>
                </div>
            </div>
        </div>
    </div>

    `;

    instancesContainer.insertAdjacentHTML('beforeend', instanceHtml);
    // Input elements
    document.getElementById(`minInterval-${instanceId}`).addEventListener('change', (e) => {
        updateInstanceSetting(instanceId, 'minInterval', e.target.value * 60);
    });
    document.getElementById(`maxInterval-${instanceId}`).addEventListener('change', (e) => {
        updateInstanceSetting(instanceId, 'maxInterval', e.target.value * 60);
    });
    document.getElementById(`volumeControl-${instanceId}`).addEventListener('change', (e) => {
        updateInstanceSetting(instanceId, 'volume', e.target.value);
    });
    document.getElementById(`instanceLabel-${instanceId}`).addEventListener('change', (e) => {
        updateInstanceSetting(instanceId, 'label', e.target.value);
    });
    document.getElementById(`audioFile-${instanceId}`).addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const fileURL = URL.createObjectURL(file);
            updateInstanceSetting(instanceId, 'audioSrc', fileURL);
        }
    });
    document.getElementById(`instanceLabel-${instanceId}`).addEventListener('change', (e) => {
        updateInstanceSetting(instanceId, 'label', e.target.value);
        const titleLabel = document.getElementById(`title-${instanceId}`);
        titleLabel.textContent = e.target.value;
    });
}


function stopAudio(instanceId) {
    const instance = audioIntervalInstances.find(instance => instance.instanceId === instanceId);
    if (!instance) return;

    if (instance.timerId) {
        clearInterval(instance.timerId);
        instance.timerId = null;
    }

    // Stop and reset the countdown display
    if (instance.countdownIntervalId) {
        clearInterval(instance.countdownIntervalId);
        instance.countdownIntervalId = null;
        updateCountdown(instanceId, 0);
    }
}



function toggleCountdownVisibility(instanceId, forceShow = false) {
    const instance = audioIntervalInstances.find(instance => instance.instanceId === instanceId);
    if (!instance) return;

    instance.isCountdownVisible = !instance.isCountdownVisible;
    const countdown = document.getElementById(`countdown-${instanceId}`);
    countdown.classList.toggle('hide');
}

function deleteInstance(instanceId) {
    const index = audioIntervalInstances.findIndex(instance => instance.instanceId === instanceId);
    if (index === -1) return;

    stopAudio(instanceId);
    audioIntervalInstances.splice(index, 1);

    const instanceElement = document.getElementById(`instance-${instanceId}`);
    instanceElement.remove();
}

function playAudio(instanceId) {
    const instance = audioIntervalInstances.find(instance => instance.instanceId === instanceId);
    if (!instance) return;

    const audioElement = document.getElementById(`audio-${instanceId}`);
    if (audioElement) {
        audioElement.volume = instance.volume;
        audioElement.play();
    }

    // Reset the countdown after the audio has been played
    const nextInterval = getRandomInterval(instance.minInterval, instance.maxInterval);
    updateCountdown(instanceId, nextInterval);
}

function loadAllPresets() {
    PRESET_OPTIONS.forEach(option => {
        createAudioIntervalInstance(option);
    });
}
function playAll() {
    for (const instance of audioIntervalInstances) {
        startAudio(instance.instanceId);
    }
}

function stopAll() {
    for (const instance of audioIntervalInstances) {
        stopAudio(instance.instanceId);
    }
}

function showAllTimers() {
    for (const instance of audioIntervalInstances) {
        toggleCountdownVisibility(instance.instanceId, true);
    }
}
function deleteAll() {
    for (let i = audioIntervalInstances.length - 1; i >= 0; i--) {
        deleteInstance(audioIntervalInstances[i].instanceId);
    }
}


function initialize() {


    // Add an event listener to the "Load All Presets" button
    const loadAllPresetsButton = document.getElementById('load-all-presets');
    loadAllPresetsButton.addEventListener('click', loadAllPresets);

    // Add an event listener to the "Create Custom Instance" button
    const createCustomInstanceButton = document.getElementById('create-custom-instance');
    createCustomInstanceButton.addEventListener('click', () => {
        createAudioIntervalInstance({
            label: 'Custom Instance',
            minInterval: 1,
            maxInterval: 120,
            audioSrc: 'audio/custom.mp3'
        });
    });
}

// Invoke the initialize function to start the app
initialize();
