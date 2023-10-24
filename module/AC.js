/** @module AC */
// A utility namespace for system-specific functions.

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

/** A shorthand for localizing.
 * @param {string} path 
 * @returns {string}
 */
export function localize (path) {
    return game.i18n.localize(getProperty(CONFIG.animecampaign, path));
}

/** A shorthand for formatting a localization.
 * @param {string} path 
 * @returns {string}
 */
export function format (path, data) {
    return game.i18n.format(getProperty(CONFIG.animecampaign, path), data);
}

/** Converts a string hexadecimal color into an array of RGB values in base 10.
 * @param {string} hexcode 
 * @returns {number[]}
 */
export function hexToRGB (hexcode) {
    const channels = [hexcode.slice(1, 3), hexcode.slice(3, 5), hexcode.slice(5)];

    return channels.map(value => parseInt(value, 16));
}

/** Preloads the filepaths for the Handlebars partials.
 * @returns {Promise<Function[]>}
 */
export async function preloadHandlebarsTemplates () {
    const paths = {
        // Global
        'summary': 'systems/animecampaign/templates/global/summary.hbs',
        'stat-list': 'systems/animecampaign/templates/global/stat-list.hbs',
        'nav': 'systems/animecampaign/templates/global/nav.hbs',

        // Character
        'main-stats': 'systems/animecampaign/templates/character/main-stats.hbs',
        'biography': 'systems/animecampaign/templates/character/biography.hbs',
        'kit': 'systems/animecampaign/templates/character/kit.hbs',
        'feature': 'systems/animecampaign/templates/character/feature.hbs',

        // Feature
        'sections': 'systems/animecampaign/templates/feature/sections.hbs',
        'details': 'systems/animecampaign/templates/feature/details.hbs',

        // Roll
        'roll-summary': 'systems/animecampaign/templates/roll/roll-summary.hbs',
        /* 'roll-dice': 'systems/animecampaign/templates/roll/roll-dice.hbs',
        'roll-stats': 'systems/animecampaign/templates/roll/roll-stats.hbs',
        'roll-sections': 'systems/animecampaign/templates/roll/roll-sections.hbs',
        'roll-banner': 'systems/animecampaign/templates/roll/roll-banner.hbs', */
    }

    return loadTemplates(paths);
}

/** Converts a instance of a class into a plain object.
 * @param {Object} instance 
 * @returns {Object}
 */
export function plainObject (instance) {
    const copy = { ...instance };
    for (const [key, value] of Object.entries(copy)) {
        if (value === null) { }
        else if (Array.isArray(value)) { }
        else if (typeof value === 'object') {
            copy[key] = plain(value);
        }
    }
    return copy;
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
