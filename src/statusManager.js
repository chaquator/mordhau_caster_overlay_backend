import EventEmitter from 'events';

const originalStatus = {
    show_hud: true,
    hud: {
        red_team: '',
        red_score: 0,
        blue_team: '',
        blue_score: 0
    }
};

let currentStatus = { ...originalStatus };

let statusEmitter = new EventEmitter();

// Sets status and posts to event listeners
function setStatus(status) {
    currentStatus = status;
    statusEmitter.emit('status', currentStatus);
    return currentStatus;
}

function getStatus() {
    return currentStatus;
}

export default {
    setStatus: setStatus,
    getStatus: getStatus,
    statusEmitter: statusEmitter,
};
