const { fork } = require('child_process');
const pidusage = require('pidusage');
let intervalId;

function startB() {
    // Start B.js as a child process
    const child = fork('child.js');

    // Log the PID of the child process
    console.log('Child process PID:', child.pid);


    // Listen for the 'spawn' event to ensure the child process has started
    child.on('spawn', () => {
        // Start monitoring CPU utilization after the child process has started
       startMonitoring(child);
    });

    // Listen for messages from B.js
    child.on('message', message => {
        console.log('Received message from B.js:', message);

        // If B.js requests a restart, restart B.js
        if (message === 'restart') {
            console.log('Restarting B.js');
            restartChildProcess(child);
        }
    });

    // Handle errors
    child.on('error', err => {
        console.error('Error in child process:', err);
    });

    // Handle exit of child process
    child.on('exit', (code, signal) => {
        console.log(`Child process exited with code ${code} and signal ${signal}`);
    });
}

// Function to start monitoring CPU utilization
function startMonitoring(child) {
    intervalId = setInterval(() => {
        pidusage(child.pid, (err, stats) => {
            if (err) {
                console.error('Error retrieving CPU usage:', err);
                return;
            }

            const cpuPercentage = stats.cpu.toFixed(2);

            // Log CPU utilization of the child process
            console.info(`CPU utilization --> ${cpuPercentage}%`);

            // Check if CPU utilization exceeds 80%
            if (cpuPercentage >= 80) {
                console.warn('High CPU utilization detected in child process!');
                restartChildProcess(child);
            }
        });
    }, 1000);
}

// Function to restart the child process
function restartChildProcess(child) {
    clearInterval(intervalId);
    child.kill(); // Kill the current instance of B.js
    startB(); // Start B.js again
}

// Start B.js
startB();
