//  A helper class for utility functions and brevity.
export default class AC {

    //  A console.log with styling, intended for debugging clarity.
    //*     (_log: string | number | boolean) : void
    static log(_log) {
        console.log(`%cAnime Campaign | ${_log}`, 'color: orange');
    }

    //  A console.error with styling, intended for debugging clarity.
    //*     (_error: string | number | boolean) : void
    static error(_error) {
        console.error(`%cAnime Campaign | ${_error}`, 'color: orange');
    }

    //  Get the filepath of an asset.
    //*     (_path: string) : string
    static load(_path) {
        return `systems/animecampaign/assets/${_path}`
    }

    //  Takes a string representation of a hexidecimal color and returns an array of RGB 
    //  values respectively.
    //*     (_hexColor: string) : number[]
    static hexToRGB(_hex) {
        return [_hex.slice(1, 3), _hex.slice(3, 5), _hex.slice(5)].map(element => +`0x${element}`);
    }

    //  Returns a color representing the max and min value of a given roll formula.
    //*     (_roll: string) : string
    static critColor(_roll) {
        const formula = _roll.formula;
        
        if (_roll.total == new Roll(formula).roll({ maximize: true }).total) {
            return '#0a9b03';
        } else if (_roll.total == new Roll(formula).roll({ minimize: true }).total) {
            return '#e22209';
        }
    }

    //  The names of the resource keys.
    //*     () : string[]
    static get resourceKeys() {
        return ['A','B','C','D']; //,'E','F','G','H']; 
    }

    //  Taken from: https://github.com/foundryvtt/dnd5e/blob/master/module/canvas/grid.mjs
    static measureDistances(segments, options={}) {
        if (!options.gridSpaces) return BaseGrid.prototype.measureDistances.call(this, segments, options);
      
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

    //  Returns an object of custom Handlebars helpers.
    //*     () : Object
    static get hbsHelpers() {
        return {

            //  Logs the context of the Handlebars object.
            //*     () : void
            debug: function(_options) {
                console.log(_options);
                return;
            },

            //  Matches the color of this element with the entity's color.
            //*     (system: { color: string }, style?: string, attr?: string, alpha?: string) 
            //*     : SafeString
            match: function({ color }, _options) {
                let { style='color', attr='true', alpha='1' } = _options.hash;

                attr = attr == 'true';
                alpha = Number(alpha);

                if (!color) return;

                let [red, green, blue] = AC.hexToRGB(color);

                const injection = attr
                    ? `style="${style}: rgb(${red}, ${green}, ${blue}, ${alpha});"` 
                    : `${style}: rgb(${red}, ${green}, ${blue}, ${alpha});`;

                return new Handlebars.SafeString(injection);
            },

            //  Changes the color of this element to either black or white to contrast with 
            //  the entity's color.
            //*     (system: { color: string }, img?: string, style?: string, attr?: string, 
            //*     threshold?: string, alpha?: string) : SafeString
            contrast: function({ color }, _options) {
                let { style='color', img='false', attr='true', threshold='.5', alpha='1' } = _options.hash;

                img = img == 'true';
                attr = attr == 'true';
                threshold = Number(threshold);
                alpha = Number(alpha);

                if (!color) return;
                
                let rgb = AC.hexToRGB(color);
                rgb[0] *= 0.2126;
                rgb[1] *= 0.7152;
                rgb[2] *= 0.0722;

                const luma = rgb.reduce((n, m) => n + m) / 255;
                
                if (img) {
                    const invert = luma <= threshold
                        ? 'invert(100%)'
                        : '';
                    const injection = attr
                        ? `style="filter: brightness(0) saturate(100%) ${invert};"`
                        : `brightness(0) saturate(100%) ${invert};`;
                    return new Handlebars.SafeString(injection);
                }

                const contrast = luma <= threshold 
                    ? `rgb(255, 255, 255, ${alpha})` 
                    : `rgb(0, 0, 0, ${alpha})`;

                const injection = attr 
                    ? `style="${style}: ${contrast};"` 
                    : `${style}: ${contrast};` ;

                return new Handlebars.SafeString(injection);
            }
        }
    }

    //  Returns an object containing the filepaths and attributes of custom system fonts.
    //*     () : Object
    static get fonts() {
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