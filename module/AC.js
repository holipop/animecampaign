//  A helper class for utility functions and brevity.
export default class AC {

    //*     (string | number | boolean) : void
    static log(_log) {
        console.log(`%cAnime Campaign | ${_log}`, 'color: orange');
    }

    //*     (string | number | boolean) : void
    static error(_error) {
        console.error(`%cAnime Campaign | ${_error}`, 'color: orange');
    }

    //  Takes a string representation of a hexidecimal color and returns an array of RGB 
    //  values respectively.
    //*     (_hexColor: string) : number[]
    static hexToRGB(_hex) {
        return [_hex.slice(1, 3), _hex.slice(3, 5), _hex.slice(5)].map(element => +`0x${element}`);
    }

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
}