let toneStarted = false;

async function initializeTone() {
    console.log('Initializing Tone...');
    if (!toneStarted) {
        await Tone.start();
        if (Tone.context.state !== 'running') {
            Tone.context.resume();
        }
        toneStarted = true;
    }
}


// Use 'DOMContentLoaded' event instead of 'click'
window.addEventListener('click', initializeTone, { once: true });

// Define the number of steps in the sequencer
const steps = 4;

// Define sequences for drums, bass, and lead separately
const drumSequences = {
    kick: Array.from({length: 1 }, () => new Array(steps).fill(false)),
    snare: Array.from({length: 1 }, () => new Array(steps).fill(false)),
    hihat: Array.from({length: 1 }, () => new Array(steps).fill(false))
};

const bassSequence = Array.from({ length: 12 }, () => new Array(steps).fill(false));
const leadSequence = Array.from({ length: 12 }, () => new Array(steps).fill(false));

// Initialize synth sounds
const kick = new Tone.MembraneSynth().toDestination();
const snare = new Tone.NoiseSynth().toDestination();
const hihat = new Tone.MetalSynth().toDestination();
const bass = new Tone.MonoSynth().toDestination();
const lead = new Tone.PolySynth().toDestination();

// Update grids separately for drums, bass, and lead
function updateDrumGrids() {
    console.log(drumSequences.kick)
    updateGrid('kickGrid', drumSequences.kick);
    updateGrid('snareGrid', drumSequences.snare);
    updateGrid('hihatGrid', drumSequences.hihat);
}

function updateBassGrid() {
    updateGrid('bassGrid', bassSequence);
}

function updateLeadGrid() {
    updateGrid('leadGrid', leadSequence);
}

// Play sequences

function playSequences() {
    Tone.Transport.stop(); // Stop any previous playback
    
    new Tone.Sequence((time, step) => {
        if (drumSequences.kick[step]) {
            kick.triggerAttackRelease('C2', '8n', time);
        }
        if (drumSequences.snare[step]) {
            snare.triggerAttackRelease( '2n', time);
        }
        if (drumSequences.hihat[step]) {
            hihat.triggerAttackRelease('32n', time);
        }
    }, [...Array(steps).keys()], '8n').start();

    new Tone.Sequence((time, step) => {
        bassSequence.forEach((row, index) => {
            if (row[step]) {
                const note = Tone.Frequency('C2').transpose(index);
                bass.triggerAttackRelease(note, '8n', time);
            }
        });
    }, [...Array(steps).keys()], '8n').start();

    new Tone.Sequence((time, step) => {
        leadSequence.forEach((row, index) => {
            if (row[step]) {
                const note = Tone.Frequency('C4').transpose(index);
                lead.triggerAttackRelease(note, '8n', time);
            }
        });
    }, [...Array(steps).keys()], '8n').start();

    Tone.Transport.bpm.value = 120;
    Tone.Transport.start();
}

// Stop playback
function stopPlayback() {
    Tone.Transport.stop();
}

// Event listeners for play and stop buttons
document.getElementById('playButton').addEventListener('click', playSequences);
document.getElementById('stopButton').addEventListener('click', stopPlayback);

// Event listeners for section buttons
document.getElementById('drumButton').addEventListener('click', () => {
    updateDrumGrids(); // Update drum grids
    document.getElementById('drumSection').style.display = 'block';
    document.getElementById('bassSection').style.display = 'none';
    document.getElementById('leadSection').style.display = 'none';
});

document.getElementById('bassButton').addEventListener('click', () => {
    updateBassGrid(); // Update bass grid
    document.getElementById('drumSection').style.display = 'none';
    document.getElementById('bassSection').style.display = 'block';
    document.getElementById('leadSection').style.display = 'none';
});

document.getElementById('leadButton').addEventListener('click', () => {
    updateLeadGrid(); // Update lead grid
    document.getElementById('drumSection').style.display = 'none';
    document.getElementById('bassSection').style.display = 'none';
    document.getElementById('leadSection').style.display = 'block';
});

// Function to update sequencer grids
function updateGrid(gridId, sequence) {
    const gridElement = document.getElementById(gridId);
    gridElement.innerHTML = ''; // Clear previous grid content

    for (let i = 0; i < sequence.length; i++) {
        const rowElement = document.createElement('div');
        rowElement.classList.add('row');
        for (let j = 0; j < sequence[i].length; j++) {
            const stepButton = document.createElement('button');
            stepButton.innerText = sequence[i][j] ? '•' : '-';

            // Update sequence value on button click
            stepButton.addEventListener('click', () => {
                sequence[i][j] = !sequence[i][j]; // Toggle value
                stepButton.innerText = sequence[i][j] ? '•' : '-';
            });
            rowElement.appendChild(stepButton);
        }
        gridElement.appendChild(rowElement);
    }
}
