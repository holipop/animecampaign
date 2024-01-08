import * as Utils from "../Utils.js";
import * as List from "../List.js";

/**
 * A mixin for shared methods between Characters and Feature sheets.
 */
export default function SheetMixin (Base) {

    /**
     * The common DocumentSheet class for Anime Campaign.
     */
    return class ACSheet extends Base {
        
        /** Hook up event listeners between for Actors and Items.
         * @param {*} html 
         * @override
         */
        activateListeners (html) {

            const sheet = this;

            // Disables spellcheck for inputs.
            html.ready(() => {
                html.find("input[type='text'], textarea").attr('spellcheck',false);
            });


            // Submits the form whenever the enter key is pressed.
            html.find('[data-enter]').each((index, element) => {
                $(element).on('keypress', event => {
                    const escape = $(element).data('enter')

                    if (event.code == 'Enter') {
                        if (escape == 'shift' && event.shiftKey) return;

                        event.preventDefault();
                        sheet.submit();
                    }
                });
            });


            // Resizes the height of a textarea dynamically as you type more.
            html.find('textarea[data-resize]')
                .each(function () {
                    this.setAttribute("style", `height:${this.scrollHeight}px;`);
                })
                .on("input", function () {
                    const parentDiv = html.find('[data-scrollable]');
                    const initScrollY = parentDiv.scrollTop();

                    this.style.height = 0;
                    this.style.height = this.scrollHeight + "px";

                    parentDiv.scrollTop(initScrollY);
                });


            // Matches the color of each element with the document's color.
            html.find('[data-match]').each((index, element) => {
                const properties = $(element).data('match') || "color";

                const obj = Utils.uniformObject(properties.split(' '), sheet.object.system.color);
                $(element).css(obj);
            })

        
            // Contrasts the color of each element against the document's color luminosity.
            html.find('[data-contrast]').each((index, element) => {
                const properties = $(element).data('contrast') || "color";
                const color = Utils.contrastHexLuma(sheet.object.system.color)

                const obj = Utils.uniformObject(properties.split(' '), color);
                $(element).css(obj);
            })


            // Contrasts the inputed color for an image, using filters.
            html.find('img[data-contrast-image]').each((index, element) => {
                const WHITE = 'brightness(0) saturate(100%) invert(100%)';
                const BLACK = 'brightness(0) saturate(100%)';

                const hexcode = $(element).data('contrast-image') || "#CCCCCC";
                const filter = (Utils.contrastHexLuma(hexcode) == 'white')
                    ? WHITE
                    : BLACK

                $(element).css('filter', filter);
            })


            /** Get the optional arguments for this collapse.
             * @param {String} key The key of the data-collapse-target.
             * @param {Boolean?} short -s Should the visibility of this div be saved? Non-owners default to this.
             * @param {Boolean?} hide -h Should the div be hidden by default?
             * @param {Boolean?} data -a Should the visibility of this div be saved in a DataModel?
             * @returns {*}
             */
            const args = str => {
                const arr = str.split(' -');
                return {
                    key: arr[0],
                    // If the user isn't an owner, fallback to short.
                    short: arr.includes('s') || !sheet.isEditable,
                    hide: arr.includes('h'),
                    data: arr.includes('d'),
                }
            }

            // Collapse a div.
            html.find('a[data-collapse]')
                .each((index, element) => {
                    // Setting values whenever the sheet updates.
                    const { key, short, hide, data } = args($(element).data('collapse'))
                    const target = html.find(`[data-collapse-target="${key}"]`);
                    const chevron = $(element).find('i.fas');

                    // If it's short, we only need to worry about if its hidden by default.
                    if (short && hide) {
                        target.hide();
                        chevron.removeClass('fa-chevron-down');
                        chevron.addClass('fa-chevron-right');
                        return;
                    } 
                    
                    const { collapsed } = ((data)
                        ? getProperty(sheet.object.system, key)
                        : sheet.object.getFlag('animecampaign', key)) 
                        ?? { collapsed: hide }

                    if (!collapsed) {
                        target.show();
                        chevron.addClass('fa-chevron-down');
                        chevron.removeClass('fa-chevron-right');
                    } else {
                        target.hide(); 
                        chevron.removeClass('fa-chevron-down');
                        chevron.addClass('fa-chevron-right');
                    }
                })
                .on('click', event => {
                    const anchor = $(event.target).closest('[data-collapse]');
                    const { key, short, hide, data } = args(anchor.data('collapse'))
                    const target = html.find(`[data-collapse-target="${key}"]`);
                    const chevron = anchor.find('i.fas')

                    if (short) {
                        target.toggle();
                        chevron.toggleClass('fa-chevron-down');
                        chevron.toggleClass('fa-chevron-right');
                        return;
                    }

                    const { collapsed } = ((data)
                        ? getProperty(sheet.object.system, key)
                        : sheet.object.getFlag('animecampaign', key)) 
                        ?? { collapsed: hide }
                    let update = { collapsed: !collapsed };

                    if (data) {
                        const isListEntry = (typeof Number(key.at(-1)) == 'number');
                        if (isListEntry) {
                            const dot = key.indexOf('.');
                            const listName = key.slice(0, dot);
                            const list = getProperty(sheet.object.system, listName);
                            const index = Number(key.slice(dot + 1));
                            update = List.set(list, index, update);

                            return sheet.object.update({ [`system.${listName}`]: update });
                        }
                        return sheet.object.update({ [`system.${key}`]: update });
                    }
                    return sheet.object.setFlag('animecampaign', key, update)
                })

                
            // Hides and reveals the textarea and div for the name.
            const input = html.find('textarea[data-name]');
            const facade = html.find('[data-facade]');

            input.on("focus", () => {
                input.css('opacity', '1')
                facade.css('opacity', '0')
            })
            input.on("blur", () => {
                input.css('opacity', '0')
                facade.css('opacity', '1')
            })


            // Resizes the font of the name such that any length fits cleanly.
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


            // Sets the name of the selected tab.
            const nav = html.find('[data-nav]');

            const set = () => {
                const data = nav.find('.active').data('tab');
                const active = data.at(0).toUpperCase() + data.slice(1);
                const name = html.find('[data-tab-name]');

                name.text(game.i18n.localize(`AC.NAV.${active}`));
            }

            set();
            nav.on('click', set);
        }

    }
}
