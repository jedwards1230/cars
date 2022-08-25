/** Slide A -> B by t */
export function lerp(A: number, B: number, t: number) {
    return A + (B - A) * t;
}

export function getIntersection(
    A: { y: number; x: number; },
    B: { x: number; y: number; },
    C: { x: number; y: number; },
    D: { x: number; y: number; }
) {
    const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
    const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
    const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);

    if (bottom !== 0) {
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

export function polysIntersect(poly1: any[], poly2: any[]) {
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

export function getRGBA(value: number) {
    const alpha = Math.abs(value);
    const R = value > 0 ? 0 : 255;
    const B = value < 0 ? 0 : 255;
    const G = B;
    return "rgba(" + R + "," + G + "," + B + "," + alpha + ")";
}

export function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = max | 0;
    return ((Math.random() * (max - min + 1)) | 0) + min;
}

// dot product of two arrays
export function dotProduct(A: any[], B: { [x: string]: number; }) {
    let acc = 0;
    for (let i = 0; i < A.length; i++) {
        acc += A[i] * B[i];
    }
    return acc;
}
