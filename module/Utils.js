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

/** Converts a string hexadecimal color into an array of RGB values in base 10.
 * @param {String} hexcode 
 * @returns {String[]}
 */
export function hexToRGB (hexcode) {
    const channels = [hexcode.slice(1, 3), hexcode.slice(3, 5), hexcode.slice(5)];

    return channels.map(value => parseInt(value, 16));
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
            copy[key] = plain(value);
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

/** Assigns each property a string of its own dot notation.
 * @param {*} obj
 * @returns {*}
 */
export function facadeObject (obj) {
    let paths = Object.keys(flattenObject(obj));
    paths.forEach(path => {
        setProperty(obj, path, path);
    });
    return obj;
}

/** Preloads the filepaths for the Handlebars partials.
 * @returns {Promise<Function[]>}
 */
export async function preloadHandlebarsTemplates () {
    const paths = {
        // Global
        'summary': 'systems/animecampaign/templates/sheets/partials/summary.hbs',
        'stat-list': 'systems/animecampaign/templates/sheets/partials/stat-list.hbs',
        'nav': 'systems/animecampaign/templates/sheets/partials/nav.hbs',

        // Character
        'main-stats': 'systems/animecampaign/templates/sheets/partials/main-stats.hbs',
        'biography': 'systems/animecampaign/templates/sheets/partials/biography.hbs',
        'kit': 'systems/animecampaign/templates/sheets/partials/kit.hbs',
        'feature': 'systems/animecampaign/templates/sheets/partials/feature.hbs',

        // Feature
        'sections': 'systems/animecampaign/templates/sheets/partials/sections.hbs',
        'details': 'systems/animecampaign/templates/sheets/partials/details.hbs',

        // Roll
        'roll-summary': 'systems/animecampaign/templates/roll/summary.hbs',
        'roll-dice': 'systems/animecampaign/templates/roll/dice.hbs',
        'roll-stats': 'systems/animecampaign/templates/roll/stats.hbs',
        'roll-sections': 'systems/animecampaign/templates/roll/sections.hbs',
        'roll-banner': 'systems/animecampaign/templates/roll/banner.hbs',
    }

    return loadTemplates(paths);
}

/** Loads the system-specific settings.
 */
export function settings () {

    const scope = 'animecampaign';

    // Default Text Editor
    game.settings.register(scope, 'defaultTextEditor', {
        name: localize('settings.defaultTextEditor'),
        hint: localize('settings.defaultTextEditorHint'),
        scope: 'client',
        config: true,
        type: String,
        choices: {
            "markdown": localize('editor.markdown'),
            "prosemirror": localize('editor.prosemirror'),
        },
        default: "markdown",
        onChange: value => {
            log(`Default Text Editor set to '${value}'`);
        },
    });

    // Diagonal Movement Rule
    // (Taken directly from DnD5e)
    game.settings.register(scope, "diagonalMovement", {
        name: 'AC.settings.diagonalMovement',
        hint:  localize('settings.diagonalMovementHint'),
        scope: "world",
        config: true,
        default: "5105",
        type: String,
        choices: {
            "555": localize('settings.diagonalMovement555'),
            "5105": localize('settings.diagonalMovement5105'),
            "EUCL": localize('settings.diagonalMovementEuclidean'),
        },
        onChange: value => canvas.grid.diagonalRule = value
    });

}

/** Sets the diagonal rule for this system.
 *  (Copied from DnD5e)
 */
export function measureDistances(segments, options={}) {
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