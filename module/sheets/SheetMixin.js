import * as AC from "../AC.js";

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

        html.ready(() => {
            resize.each(function() {
                this.setAttribute("style", `height:${this.scrollHeight}px;`);
            });
        })

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
            const properties = $(element).data('match') || "color";

            const obj = AC.uniformObject(properties.split(' '), this.object.system.color);
            $(element).css(obj);
        })
    },
    
    /** Contrasts the color of each element against the document's color luminosity.
     * @param {*} html 
     */
    contrastColor (html) {
        const contrast = html.find('[data-contrast]');

        contrast.each((index, element) => {
            const properties = $(element).data('contrast') || "color";

            const rgb = AC.hexToRGB(this.object.system.color);
            rgb[0] *= 0.2126;
            rgb[1] *= 0.7152;
            rgb[2] *= 0.0722;

            const luma = rgb.reduce((n, m) => n + m) / 255;
            const color = (luma <= .5) ? "white" : "black";

            const obj = AC.uniformObject(properties.split(' '), color);
            $(element).css(obj);
        })
    },

    contrastImage (html) {
        const WHITE = 'brightness(0) saturate(100%) invert(100%)';
        const BLACK = 'brightness(0) saturate(100%)';

        const contrast = html.find('img[data-contrast-image]');

        contrast.each((index, element) => {
            const hexcode = $(element).data('contrast-image') || "#CCCCCC";

            const rgb = AC.hexToRGB(hexcode);
            rgb[0] *= 0.2126;
            rgb[1] *= 0.7152;
            rgb[2] *= 0.0722;

            const luma = rgb.reduce((n, m) => n + m) / 255;
            const filter = (luma <= .5) ? WHITE : BLACK;

            $(element).css('filter', filter);
        })
    },

    /** Collapse an element given a sender and a target where its data-attr value leads with "target ".
     * Both the sender and target's data-attr value should point to its respective flag.
     * @param {*} html 
     */
    collapse (html) {
        const collapse = html.find('[data-collapse]').filter((index, element) => {
            const key = $(element).data('collapse');
            return (!key.startsWith('target'));
        });

        collapse.each((index, element) => {            
            const key = $(element).data('collapse');
            const target = html.find(`[data-collapse="target ${key}"]`);
            const flag = this.object.getFlag('animecampaign', key);
            const isVisible = flag?.visible ?? true;
            const isChevron = $(element).hasClass('fas');

            if (isVisible) {
                target.show();

                if (isChevron) {
                    $(element).addClass('fa-chevron-down');
                    $(element).removeClass('fa-chevron-right');
                }
            } else {
                target.hide(); 

                if (isChevron) {
                    $(element).removeClass('fa-chevron-down');
                    $(element).addClass('fa-chevron-right');
                }
            }
        });

        collapse.on('click', event => {
            const key = $(event.target).data('collapse');
            const flag = this.object.getFlag('animecampaign', key) ?? { visible: true };

            this.object.setFlag('animecampaign', key, { visible: !flag?.visible })
        });
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
            name.css('font-size', `${initialRem}rem`)
    
            for (let i = 1; i > 0; i -= SCALE_DELTA) {
                name.css('font-size', `${initialRem * i}rem`)

                if (name[0].scrollHeight <= maxPxHeight) break;
            }
        }

        const resizeObserver = new ResizeObserver(scale);

        resizeObserver.observe(name[0]);
        resizeObserver.observe(html[0]);

        html.ready(scale);
        name.on('input', scale);
        name.on('blur', () => this.submit());
    },


    //* NAVIGATION */
    //* ---------- */

    /** Sets the name of the selected tab.
     * @param {*} html 
     */
    setTabName (html) {
        const nav = html.find('[data-nav]');
        const name = html.find('[data-tab-name]');

        const set = () => {
            const active = nav.find('.active').data('tab');

            name.text(active);
        }

        html.ready(set);
        nav.on('click', set);
    },
}
