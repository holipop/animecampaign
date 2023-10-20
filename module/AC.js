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
        'summary': 'systems/animecampaign/templates/partials/summary.hbs',
        'stat-list': 'systems/animecampaign/templates/partials/stat-list.hbs',
        'nav': 'systems/animecampaign/templates/partials/nav.hbs',

        // Actor
        'main-stats': 'systems/animecampaign/templates/partials/main-stats.hbs',
        'biography': 'systems/animecampaign/templates/partials/biography.hbs',
        'kit': 'systems/animecampaign/templates/partials/kit.hbs',
        'feature': 'systems/animecampaign/templates/partials/feature.hbs',

        // Item
        'sections': 'systems/animecampaign/templates/partials/sections.hbs',
        'details': 'systems/animecampaign/templates/partials/details.hbs',
    }

    return loadTemplates(paths);
}
