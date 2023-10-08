// A utility namespace.

/** A console.log with styling, intended for debugging clarity.
 * @param {string|number|boolean} text 
 */
export function log (text) {
    console.log(`%cAnime Campaign | ${text}`, 'color: orange');
}

/** A console.error with styling, intended for debugging clarity.
 * @param {string|number|boolean} text 
 */
export function error (text) {
    console.error(`%cAnime Campaign | ${text}`, 'color: orange');
}

/** A shorthand for getting system-specific localizations.
 * @param {string} path 
 * @returns {string}
 */
export function localize (path) {
    return game.i18n.localize(getProperty(CONFIG.animecampaign, path));
}

/** Converts a string hexadecimal color into an array of RGB values in base 10.
 * @param {string} hexcode 
 * @returns {number[]}
 */
export function hexToRGB (hexcode) {
    const channels = [hexcode.slice(1, 3), hexcode.slice(3, 5), hexcode.slice(5)];

    return channels.map(value => parseInt(value, 16));
}

/** Converts a ratio into a percent, no decimals and clamped between 0% and 100%.
 * @param {number} num 
 * @returns {string}
 */
export function clampedPercent (num) {
    let ratio;

    if (num >= 1) ratio = 1;
    else if (num <= 0) ratio = 0;
    else ratio = num;

    return ratio.toLocaleString(undefined, { style: 'percent' });
}

/** Preloads the filepaths for the Handlebars partials.
 * @returns {Promise<Function[]>}
 */
export async function preloadHandlebarsTemplates () {
    const paths = {
        'summary': 'systems/animecampaign/templates/partials/summary.hbs',
        'main-stats': 'systems/animecampaign/templates/partials/main-stats.hbs',
        'stat-list': 'systems/animecampaign/templates/partials/stat-list.hbs',
        'kit': 'systems/animecampaign/templates/partials/kit.hbs',
        'feature': 'systems/animecampaign/templates/partials/feature.hbs',
    }

    return loadTemplates(paths);
}

/** Assigns each property a string of its own dot notation.
 * @param {object} obj
 * @returns {object}
 */
export function facadeObject (obj) {
    let paths = Object.keys(flattenObject(obj));
    paths.forEach(element => {
        setProperty(obj, element, element);
    });
    return obj;
}

/** Create an object where all of the properties have identical values.
 * @param {string[]} keyArr The names of each property.
 * @param {*} value The value for each property.
 * @returns {Object}
 */
export function uniformObject (keyArr, value) {
    const obj = {};
    keyArr.forEach(element => {
        obj[element] = value;
    });
    return obj;
}

/** Gets the first entry that matches a query in an array of objects. Returns as a plain object.
 * @param {Object[]} arr 
 * @param {Object} query 
 * @returns {Object}
 */
export function getObjectEntry (arr, query) {
    const obj = arr.find(entry => {
        const filteredEntry = filterObject(entry, query);

        return objectsEqual(filteredEntry, query);
    })

    if (obj === undefined) return;
    return convertToPlainObject(obj);
}

/** Change an entry of an array of objects, returning an updated clone of the array with the changed entry becoming a plain object.
 * @param {Object[]} arr 
 * @param {Object} query 
 * @param {Object} changes 
 * @returns {Object[]}
 */
export function setObjectEntry (arr, query, changes) {
    const index = arr.findIndex(entry => {
        const filteredEntry = filterObject(entry, query);

        return objectsEqual(filteredEntry, query);
    })
    const entry = deepClone(arr[index]);
    const obj = mergeObject(entry, changes);

    return arr.toSpliced(index, 1, convertToPlainObject(obj));
}

/** Check if an array of objects contains an entry that matches the query.
 * @param {Object[]} arr 
 * @param {Object} query 
 * @return {boolean}
 */
export function hasObjectEntry (arr, query) {
    const index = arr.findIndex(entry => {
        const filteredEntry = filterObject(entry, query);

        return objectsEqual(filteredEntry, query);
    })

    return (index !== -1);
}

/** Converts a instance of a class into a plain object.
 * @param {Object} instance 
 * @returns {Object}
 */
export function convertToPlainObject (instance) {
    const copy = { ...instance };
    for (const [key, value] of Object.entries(copy)) {
        if (value === null) { }
        else if (Array.isArray(value)) { }
        else if (typeof value === 'object') {
            copy[key] = convertToPlainObject(value);
        }
    }
    return copy;
}
