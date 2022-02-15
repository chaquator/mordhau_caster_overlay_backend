import { v4 as uuidv4 } from 'uuid';

let manager_key;
let keys = new Set();

const newKey = uuidv4;

function generateManagerKey() {
    manager_key = newKey();
    return manager_key;
}

function setManagerKey(key) {
    manager_key = key;
}

function createAndAddKey() {
    const k = newKey();
    keys.add(k);
    return k;
}

function validKey(key) {
    return keys.has(key);
}

function isManagerKey(key) {
    return key === manager_key;
}

function deleteKey(key) {
    return keys.delete(key);
}

function clearKeys() {
    keys.clear();
}

function getKeys() {
    return [...keys];
}

export default {
    generateManagerKey: generateManagerKey,
    setManagerKey: setManagerKey,
    createAndAddKey: createAndAddKey,
    validKey: validKey,
    isManagerKey: isManagerKey,
    deleteKey: deleteKey,
    clearKeys: clearKeys,
    getKeys: getKeys
};
