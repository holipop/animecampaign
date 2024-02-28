/** A utility namespace for system-specific functions.
 * @module Utils 
 */


/** A console.log with styling, intended for debugging clarity.
 * @param {String|Number|Boolean} text 
 */
export function log (text) {
    console.log(`%cAnime Campaign | ${text}`, 'color: tomato;');
}

/** A console.error with styling, intended for debugging clarity.
 * @param {String|Number|Boolean} text 
 */
export function error (text) {
    console.error(`%cAnime Campaign | ${text}`, 'color: tomato;');
}

/** Returns either "white" or "black" based on the luma of the given hexcode for the best contrast.
 * @param {String} hexcode 
 * @returns {String}
 */
export function contrastHexLuma (hexcode) {
    let [red, green, blue] = hexToRGB(hexcode)
    red *= 0.2126;
    green *= 0.7152;
    blue *= 0.0722;

    const luma = (red + green + blue) / 255;
    return (luma <= .5) ? "white" : "black";
}

/** Converts a string hexadecimal color into an array of RGB values.
 * @param {String} hexcode 
 * @returns {Number[]}
 */
export function hexToRGB (hexcode) {
    const channels = [hexcode.slice(1, 3), hexcode.slice(3, 5), hexcode.slice(5)];
    return channels.map(value => parseInt(value, 16));
}

/** Converts a string hexadecimal color into an array of HSL values.
 * @param {String} hexcode 
 * @returns {Number[]}
 */
export function hexToHSL (hexcode) {
    return RGBToHSL(...hexToRGB(hexcode))
}

/** Converts RGB values to a hexadecimal value.
 * @param {Number} r 
 * @param {Number} g 
 * @param {Number} b 
 * @returns {String}
 */
export function RGBToHex (r, g, b) {
    const channels = [r.toString(16), g.toString(16), b.toString(16)]
    return `#${channels.join('')}`
}

/** Converts HSL values to a hexadecimal value.
 * @param {Number} h 
 * @param {Number} s 
 * @param {Number} l 
 * @returns {String}
 */
export function HSLToHex (h, s, l) {
    return RGBToHex(...HSLToRGB(h, s, l))
}

/** Converts RGB values to HSL values.
 * https://www.30secondsofcode.org/js/s/rgb-to-hsl/
 * @param {Number} r 
 * @param {Number} g 
 * @param {Number} b 
 * @returns {Number[]}
 */
export function RGBToHSL (r, g, b) {
    r /= 255
    g /= 255
    b /= 255
    const l = Math.max(r, g, b)
    const s = l - Math.min(r, g, b)
    const h = s
        ? l === r
            ? (g - b) / s
            : l === g
            ? 2 + (b - r) / s
            : 4 + (r - g) / s
        : 0
    const channels = [
        60 * h < 0 ? 60 * h + 360 : 60 * h,
        100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
        (100 * (2 * l - s)) / 2,
    ]
    return channels.map(v => Math.round(v))
}

/** Converts HSL values to RGB values.
 * https://www.30secondsofcode.org/js/s/hsl-to-rgb/
 * @param {Number} h 
 * @param {Number} s 
 * @param {Number} l 
 * @returns {Number[]}
 */
export function HSLToRGB (h, s, l) {
    s /= 100
    l /= 100
    const k = n => (n + h / 30) % 12
    const a = s * Math.min(l, 1 - l)
    const f = n =>
        l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
    const channels = [255 * f(0), 255 * f(8), 255 * f(4)]
    return channels.map(v => Math.round(v))
}

/** Converts a instance of a class into a plain object.
 * @param {*} instance 
 * @returns {*}
 */
export function plainObject (instance) {
    const copy = { ...instance };
    for (const [key, value] of Object.entries(copy)) {
        if (value === null) { }
        else if (Array.isArray(value)) { }
        else if (typeof value === 'object') {
            copy[key] = plainObject(value);
        }
    }
    return copy;
}

/** Create an object where all of the properties have identical values.
 * @param {String[]} keyArr The names of each property.
 * @param {*} value The value for each property.
 * @returns {*}
 */
export function uniformObject (keyArr, value) {
    const obj = {};
    keyArr.forEach(element => {
        obj[element] = value;
    });
    return obj;
}

/** Sets the diagonal rule for this system.
 *  (Copied from DnD5e)
 */
export function measureDistances (segments, options={}) {
    if ( !options.gridSpaces ) return BaseGrid.prototype.measureDistances.call(this, segments, options);

    // Track the total number of diagonals
    let nDiagonal = 0;
    const rule = this.parent.diagonalRule;
    const d = canvas.dimensions;

    // Iterate over measured segments
    return segments.map(s => {
        let r = s.ray;

        // Determine the total distance traveled
        let nx = Math.ceil(Math.abs(r.dx / d.size));
        let ny = Math.ceil(Math.abs(r.dy / d.size));

        // Determine the number of straight and diagonal moves
        let nd = Math.min(nx, ny);
        let ns = Math.abs(ny - nx);
        nDiagonal += nd;

        // Alternative DMG Movement
        if (rule === "5105") {
            let nd10 = Math.floor(nDiagonal / 2) - Math.floor((nDiagonal - nd) / 2);
            let spaces = (nd10 * 2) + (nd - nd10) + ns;
            return spaces * canvas.dimensions.distance;
        }

        // Euclidean Measurement
        else if (rule === "EUCL") {
            return Math.hypot(nx, ny) * canvas.scene.grid.distance;
        }

        // Standard PHB Movement
        else return (ns + nd) * canvas.scene.grid.distance;
    });
}