import { hexToRGB } from "../AC.js";

// A mixin for shared methods between sheets.
export const SheetMixin = {

    //* GLOBAL */
    //* ------ */

    /** Submits the form whenever the enter key is pressed.
     * @param {*} html 
     */
    submitOnEnter (html) {
        const enter = html.find('[data-enter]');

        enter.each((index, element) => {
            $(element).on('keypress', event => {
                if (event.code == 'Enter') {
                    event.preventDefault();
                    this.submit();
                }
            });
        });
    },
    
    /** Resizes the height of a textarea dynamically as you type more.
     * @param {*} html 
     */
    resizeTextArea (html) {
        const resize = html.find('textarea[data-resize]');

        resize.each(function() {
            this.setAttribute("style", `height:${this.scrollHeight}px;`);
        });

        resize.on("input", function() {
            this.style.height = 0;
            this.style.height = this.scrollHeight + "px";
        });
    },

    /** Matches the color of each element with the document's color.
     * @param {*} html 
     */
    matchColor (html) {
        const match = html.find('[data-match]');

        match.each((index, element) => {
            const property = $(element).data('match') || "color";

            $(element).css(property, this.object.system.color);
        })
    },
    
    /** Contrasts the color of each element against the document's color luminosity.
     * @param {*} html 
     */
    contrastColor (html) {
        const contrast = html.find('[data-contrast]');

        contrast.each((index, element) => {
            const property = $(element).data('contrast') || "color";

            const rgb = hexToRGB(this.object.system.color);
            rgb[0] *= 0.2126;
            rgb[1] *= 0.7152;
            rgb[2] *= 0.0722;

            const luma = rgb.reduce((n, m) => n + m) / 255;
            const color = (luma <= .5) ? "white" : "black";

            $(element).css(property, color);
        })
    },


    //* SUMMARY */
    //* ------- */

    /** Resizes the font of the name such that any length fits cleanly.
     * @param {*} html 
     */
    resizeName (html) {
        const SCALE_DELTA = .05;
        const PX_PER_REM = 16;

        const name = html.find("[data-name]");

        const initialRem = parseInt(name.css('font-size')) / PX_PER_REM;
        const maxPxHeight = parseInt(name.css('height'));

        const scale = () => {
            const textarea = name[0];

            textarea.style.height = 0;
            textarea.style.height = textarea.scrollHeight + "px";
            
            textarea.style.fontSize = `${initialRem}rem`;
    
            for (let i = 1; i > 0; i -= SCALE_DELTA) {
                textarea.style.fontSize = `${initialRem * i}rem`;

                if (textarea.scrollHeight <= maxPxHeight) break;
            }
        }

        const resizeObserver = new ResizeObserver(scale);

        resizeObserver.observe(name[0]);
        resizeObserver.observe(html[0]);

        html.ready(scale);
        name.on('input', scale);
        name.on('blur', () => this.submit());
    },
}
