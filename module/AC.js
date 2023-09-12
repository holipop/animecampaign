/** A helper class for utility functions and brevity.
 * @class
 */
export default class AC {

    /** A console.log with styling, intended for debugging clarity.
     * @param {*} output - Any text.
     */
    static log (output) {
        console.log(`%cAnime Campaign | ${output}`, 'color: orange');
    }

    /** A console.error with styling, intended for debugging clarity.
     * @param {*} output - Any text.
     */
    static error (output) {
        console.error(`%cAnime Campaign | ${output}`, 'color: orange');
    }

    /** Shorthand for getting the filepath of an asset.
     * @param {*} file - Name of the file.
     * @returns {string}
     */
    static load (file) {
        return `systems/animecampaign/assets/${file}`;
    }

    /** Converts a string representation of a hexidecimal color into an array of RGB 
     *  values respectively.
     * @param {string} hex - A hexidecimal color.
     * @returns {number[]}
     */
    static hexToRGB (hex) {
        const hexChannels = [hex.slice(1, 3), hex.slice(3, 5), hex.slice(5)];
        const rbg = hexChannels.map(element => +`0x${element}`);
        return rbg;
    }

    /** Returns a hexidecimal color representing the max and min value of a given roll 
     *  formula.
     * @param {Roll} - A Roll instance.
     * @returns {string}
     */
    static critColor (roll) {
        const formula = roll.formula;

        if (roll.total == new Roll(formula).roll({ maximize: true }).total) {
            return '#0a9b03';
        } else if (roll.total == new Roll(formula).roll({ minimize: true }).total) {
            return '#e22209';
        }
    }

    /** Generates the names of the resource keys.
     * @returns {string[]}
     */
    static get resourceKeys () {
        return ['red', 'blue', 'yellow', 'green']; //,'orange', 'cyan', 'purple', 'grey']; 
    }

    /** Taken from: https://github.com/foundryvtt/dnd5e/blob/master/module/canvas/grid.mjs
     *  TODO: Not at all sure how this works, look into later.
     */
    static measureDistances (segments, options = {}) {
        if (!options.gridSpaces) {
            return BaseGrid.prototype.measureDistances.call(this, segments, options);
        }

        // Track the total number of diagonals
        let nDiagonal = 0;
        const d = canvas.dimensions;

        // Iterate over measured segments
        return segments.map(s => {
            let r = s.ray;

            // Determine the total distance traveled
            let nx = Math.abs(Math.ceil(r.dx / d.size));
            let ny = Math.abs(Math.ceil(r.dy / d.size));

            // Determine the number of straight and diagonal moves
            let nd = Math.min(nx, ny);
            let ns = Math.abs(ny - nx);
            nDiagonal += nd;

            // Alternative DMG Movement
            let nd10 = Math.floor(nDiagonal / 2) - Math.floor((nDiagonal - nd) / 2);
            let spaces = (nd10 * 2) + (nd - nd10) + ns;
            return spaces * canvas.dimensions.distance;
        });
    };

    /** Returns an object of custom Handlebars helpers.
     * @returns {Object}
     */
    static get hbsHelpers () {
        return {

            /** Logs the context of the Handlebars object. 
             * @param {Object} options - The object passed into a Handlebars block function.
             */
            debug: function (options) {
                console.log(options);
            },

            /** Matches the color of an element with a hex color.
             * @param {string} color - A hexidecimal color.
             * @param {string?} [options.hash.style = 'color'] - The target CSS style.
             * @param {string?} [options.hash.attr = 'true'] - Is the attribute tag included?
             * @param {string?} [options.hash.alpha = '1'] - The opacity of the color.
             * @returns {SafeString}
             */
            match: function (color, options) {
                let { style = 'color', attr = 'true', alpha = '1' } = options.hash;

                attr = (attr == 'true');
                alpha = Number(alpha);

                if (!color) return;

                let [red, green, blue] = AC.hexToRGB(color);

                const injection = attr
                    ? `style="${style}: rgb(${red}, ${green}, ${blue}, ${alpha});"`
                    : `${style}: rgb(${red}, ${green}, ${blue}, ${alpha});`

                return new Handlebars.SafeString(injection);
            },

            /** Changes the color of this element to either black or white to contrast with the
             *  given color.
             * @param {string} color - A hexidecimal color.
             * @param {string?} [options.hash.style = 'color'] - The target CSS style.
             * @param {string?} [options.hash.img = 'true'] - Is the element an image?
             * @param {string?} [options.hash.attr = 'true'] - Is the attribute tag included?
             * @param {string?} [options.hash.threshold = '.5'] - The luma threshold for 
             * @param {string?} [options.hash.alpha = '1'] - The opacity of the color.
             * @returns {SafeString}
             */
            contrast: function (color, options) {
                let {
                    style = 'color',
                    img = 'false',
                    attr = 'true',
                    threshold = '.5',
                    alpha = '1'
                } = options.hash;

                img = (img == 'true');
                attr = (attr == 'true');
                threshold = Number(threshold);
                alpha = Number(alpha);

                if (!color) return;

                let rgb = AC.hexToRGB(color);
                rgb[0] *= 0.2126;
                rgb[1] *= 0.7152;
                rgb[2] *= 0.0722;

                const luma = rgb.reduce((n, m) => n + m) / 255;

                if (img) {
                    const invert = (luma <= threshold)
                        ? 'invert(100%)'
                        : '';
                    const injection = (attr)
                        ? `style="filter: brightness(0) saturate(100%) ${invert};"`
                        : `brightness(0) saturate(100%) ${invert};`;
                    return new Handlebars.SafeString(injection);
                }

                const contrast = (luma <= threshold)
                    ? `rgb(255, 255, 255, ${alpha})`
                    : `rgb(0, 0, 0, ${alpha})`;

                const injection = (attr)
                    ? `style="${style}: ${contrast};"`
                    : `${style}: ${contrast};`;

                return new Handlebars.SafeString(injection);
            }
        }
    }

    /** Returns an object containing the filepaths and attributes of custom system fonts.
     * @returns {Object}
     */
    static get fonts () {
        return {
            "Gloock": {
                editor: true,
                fonts: [
                    { urls: ['systems/animecampaign/fonts/Gloock/Gloock-Regular.ttf'] }
                ]
            },
            "Philosopher": {
                editor: true,
                fonts: [
                    { urls: ['systems/animecampaign/fonts/Philosopher/Philosopher-Regular.ttf'], weight: 400, style: 'normal' },
                    { urls: ['systems/animecampaign/fonts/Philosopher/Philosopher-Bold.ttf'], weight: 700, style: 'normal' },
                    { urls: ['systems/animecampaign/fonts/Philosopher/Philosopher-Italic.ttf'], weight: 400, style: 'italic' },
                    { urls: ['systems/animecampaign/fonts/Philosopher/Philosopher-BoldItalic.ttf'], weight: 700, style: 'italic' }
                ]
            }
        }
    }
}