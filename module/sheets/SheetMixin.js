import * as AC from "../AC.js";
import * as List from "../List.js";

/**
 * A mixin for shared methods between Characters and Feature sheets.
 */
export const SheetMixin = {

    /** Global event listeners.
     * @param {*} html 
     * @param {*} sheet 
     */
    globalListeners (html, sheet) {

        /** Submits the form whenever the enter key is pressed.
         */
        void function submitOnEnter () {
            const enter = html.find('[data-enter]');

            enter.each((index, element) => {
                $(element).on('keypress', event => {
                    if (event.code == 'Enter') {
                        event.preventDefault();
                        sheet.submit();
                    }
                });
            });
        }()

        /** Fuck those red dotted lines.
         */
        void function disableSpellcheck () {
            html.ready(() => {
                html.find("input[type='text'], textarea").attr('spellcheck',false);
            });
        }()

        /** Resizes the height of a textarea dynamically as you type more.
         */
        void function resizeTextArea () {
            const resize = html.find('textarea[data-resize]');
            const scroll = html.find('[data-scrollable]');

            resize.each(function() {
                this.setAttribute("style", `height:${this.scrollHeight}px;`);
            });

            resize.on("input", function() {
                const initScrollY = scroll.scrollTop();

                this.style.height = 0;
                this.style.height = this.scrollHeight + "px";

                scroll.scrollTop(initScrollY);
            });
        }()

        /** Matches the color of each element with the document's color.
         */
        void function match () {
            const match = html.find('[data-match]');

            match.each((index, element) => {
                const properties = $(element).data('match') || "color";

                const obj = AC.uniformObject(properties.split(' '), sheet.object.system.color);
                $(element).css(obj);
            })
        }()
        
        /** Contrasts the color of each element against the document's color luminosity.
         */
        void function contrast () {
            const contrast = html.find('[data-contrast]');

            contrast.each((index, element) => {
                const properties = $(element).data('contrast') || "color";

                const rgb = AC.hexToRGB(sheet.object.system.color);
                rgb[0] *= 0.2126;
                rgb[1] *= 0.7152;
                rgb[2] *= 0.0722;

                const luma = rgb.reduce((n, m) => n + m) / 255;
                const color = (luma <= .5) ? "white" : "black";

                const obj = AC.uniformObject(properties.split(' '), color);
                $(element).css(obj);
            })
        }()

        /** Contrasts the inputed color for an image, using filters.
         */
        void function contrastImage () {
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
        }()

        /** Collapse an element given a sender and target where its data-attr value leads with "target ".
         *  Both the sender and target's data-attr value should point to a property in the system schema.
         */
        void function collapse () {
            // Only gets the elements that don't start with "target".
            const collapse = html.find('[data-collapse]').filter((index, element) => {
                const key = $(element).data('collapse');
                return (!key.startsWith('target'));
            });

            collapse.each((index, element) => {
                const key = $(element).data('collapse');
                const target = html.find(`[data-collapse="target ${key}"]`);
                const isCollapsed = getProperty(sheet.object.system, key).collapsed;
                const isChevron = $(element).hasClass('fas');

                if (!isCollapsed) {
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
                /** @type {String} */
                const key = $(event.target).data('collapse');

                // if key ends with a number, it much be pointing to an array entry.
                const isListEntry = (typeof +key[key.length - 1] == 'number');
                if (isListEntry) {
                    const listName = key.slice(0, key.indexOf('.'));
                    const list = getProperty(sheet.object.system, listName);
                    const index = +key.slice(key.indexOf('.') + 1);
                    const entry = List.get(list, index);
                    const update = List.set(list, index, { collapsed: !entry.collapsed })

                    return sheet.object.update({ [`system.${listName}`]: update });
                }

                const data = getProperty(sheet.object.system, key).collapsed

                sheet.object.update({ [`system.${key}`]: { collapsed: !data.collapsed } });
            });
        }()

        /** Collapse an element given a sender and a target where its data-attr value leads with "target ".
         *  Both the sender and target's data-attr value should point to its respective flag.
         */
        void function collapseFlag () {
            // Only gets the elements that don't start with "target".
            const collapse = html.find('[data-collapse-flag]').filter((index, element) => {
                const key = $(element).data('collapse-flag');
                return (!key.startsWith('target'));
            });

            collapse.each((index, element) => {
                const key = $(element).data('collapse-flag');
                const target = html.find(`[data-collapse-flag="target ${key}"]`);
                const flag = sheet.object.getFlag('animecampaign', key);
                const isChevron = $(element).hasClass('fas');
                let isVisible = flag?.visible ?? true;

                // Sets the initial value of any data-hide divs
                if ((flag == undefined) && ('hide' in $(element).data())) {
                    sheet.object.setFlag('animecampaign', key, { visible: false })
                    isVisible = false;
                }
                
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
                const key = $(event.target).data('collapse-flag');
                const flag = sheet.object.getFlag('animecampaign', key) ?? { visible: true };

                sheet.object.setFlag('animecampaign', key, { visible: !flag?.visible })
            });
        }()

        /** Resizes the font of the name such that any length fits cleanly.
         */
        void function resizeName () {
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
            name.on('blur', () => sheet.submit());
        }()

        /** Sets a feature's category via the selection.
         */
        void function selectCategory () {
            const select = html.find('[data-select-category="select"]');
            const target = html.find('[data-select-category="target"]');

            select.on('change', event => {
                const category = $(event.target).val();
                target.val(category);
                sheet.object.update();
            });
        }()

        /** Sets the name of the selected tab.
         * @param {*} html 
         */
        void function setTabName () {
            const nav = html.find('[data-nav]');
            const name = html.find('[data-tab-name]');

            const set = () => {
                const active = nav.find('.active').data('tab');

                name.text(AC.localize(`nav.${active}`));
            }

            set();
            nav.on('click', set);
        }()

    },

}