import {
    Car
} from "./car/car.js";

export function lerp(A, B, t) {
    return A + (B - A) * t;
}

export function getIntersection(A, B, C, D) {
    const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
    const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
    const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);

    if (bottom != 0) {
        const t = tTop / bottom;
        const u = uTop / bottom;

        if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
            return {
                x: lerp(A.x, B.x, t),
                y: lerp(A.y, B.y, t),
                offset: t,
            }
        }
    }
    return null;
}

export function polysIntersect(poly1, poly2) {
    for (let i = 0; i < poly1.length; i++) {
        for (let j = 0; j < poly2.length; j++) {
            const touch = getIntersection(
                poly1[i],
                poly1[(i + 1) % poly1.length],
                poly2[j],
                poly2[(j + 1) % poly2.length],
            );
            if (touch) return true;
        }
    }
    return false;
}

export function getRGBA(value) {
    const alpha = Math.abs(value);
    const R = value > 0 ? 0 : 255;
    const B = value < 0 ? 0 : 255;
    const G = B;
    return "rgba(" + R + "," + G + "," + B + "," + alpha + ")";
}

export function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function normalize(val, max, min) {
    return (val - min) / (max - min);
}

// dot product of two arrays
export function dotProduct(A, B) {
    return A.reduce((acc, cur, i) => acc + cur * B[i], 0);
}

/**
 * (outputs - targets) ** 2
 * @param {number} outputs 
 * @param {number} targets 
 */
export function MSE(targets, outputs) {
    return (targets - outputs) ** 2;
}

/**
 * Loads brain and episodes from localStorage
 */
export function loadModel(id) {
    const brain = localStorage.getItem(id);
    if (brain) return JSON.parse(brain)
        
    return null;
}

export function loadEpisodes(id) {
    const episodes = localStorage.getItem(id + "Episodes");
    if (episodes) return JSON.parse(episodes);
    
    return null;
}

/**
 * Saves brain to localStorage
 * @param  {string} id Active model name
 * @param  {array} weights weights
 */
export function saveModel(id, weights) {
    localStorage.setItem(id, JSON.stringify(weights));
}

/**
 * Saves episodes to localStorage
 * @param  {string} id Active model name
 * @param  {array} episodes Episodes array
 */
export function saveEpisodes(id, episodes) {
    localStorage.setItem(id + "Episodes", JSON.stringify(episodes));
}

export function destroy(id) {
    localStorage.removeItem(id);
    localStorage.removeItem(id + "Episodes");
}