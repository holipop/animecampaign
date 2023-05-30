import { Stat } from "../ACStat.js"
import { defaultStats } from "./DefaultStats.js";
import { StatConfigMenu } from "./StatConfigMenu.js";

//
//  A mixin containing shared methods between ACActorSheet and ACItemSheet schema.
//
export const ACSheetMixin = {

    //  Shrinks the font size of a div as more content is added.
    //      _div    (html)      : The desired HTML element for adjusting font
    //      _rem    (number)    : The default size of the font in rem units
    //      _max    (integer)   : The max amount of vertical space the div can take up in pixels
    adjustFontSize(_div, _rem, _max) {
        const text = $(_div);

        text.css( 'fontSize', `${_rem}rem`);

        while (text.height() > _max) {
            _rem *= 0.85;
            text.css( 'fontSize', `${_rem}rem`);
            console.log('Anime Campaign | Resizing Text');
        } 
    },

    //  Updates the entity's name and resizes it on the entity sheet.
    //      _html   (jQuery)    : The entity sheet form as a jQuery object
    //      _rem    (number)    : The default size of the font in rem units
    //      _max    (integer)   : The max amount of vertical space the div can take up in pixels
    updateName(_html, _rem, _max) {
        const NAME = _html.find('.name');
        const nameResize = new ResizeObserver(event => {
            this.adjustFontSize(NAME, _rem, _max)
        })
        nameResize.observe(NAME[0]);
        nameResize.observe(_html[0]);

        _html.ready(() => this.adjustFontSize(NAME, _rem, _max));

        NAME.on('blur', event => this.object.update({ 'name': NAME.text() }));
        NAME[0].addEventListener('paste', event => event.preventDefault())
    },

    adjustFontWidth(_div, _scale) {
        const stat = $(_div)
        const regex = /[A-Z]|[a-z]/g;

        const width = 1 / _scale;
        const left = (1 - _scale) / (2 * _scale);

        if (regex.test(stat[0].value)) {
            stat
                .css('transform',       `scaleX(${_scale})`)
                .css('width',           `${width * 100}%`)
                .css('position',        'relative')
                .css('left',            `${left * -100}%`)
                .css('font-weight',     'normal')
            ;
        } else {
            stat
                .css('transform',       `scaleX(1)`)
                .css('width',           `100%`)
                .css('position',        'static')
                .css('font-weight',     'bold')
            ;
        }

        //console.log([stat, regex]);
    },

    //  Updates the background color of the header of entity sheets.
    //      _html       (jQuery)    : The entity sheet form as a jQuery object
    //      _threshold  (number)    : A number between 0 and 1, when the foreground text should change
    //                                  based on percieved lightness value of the background color
    updateBackground(_html, _threshold) {
        const BACKGROUND = _html.find('.background');
        const BACKGROUND_INPUT = _html.find('.background-input');
        const NAME = _html.find('.name');
        const CLASS = _html.find('.class');
        const IMG = _html.find('.img');

        const inputColor = BACKGROUND_INPUT[0].defaultValue

        let rgb = [inputColor.slice(1, 3), inputColor.slice(3, 5), inputColor.slice(5)]
            .map(element => Number(`0x${element}`));
        rgb[0] *= 0.2126;
        rgb[1] *= 0.7152;
        rgb[2] *= 0.0722;

        const perceivedLightness = rgb.reduce((n, m) => n + m) / 255;

        if (perceivedLightness <= _threshold) {
            NAME.css( 'color', "#FFFFFF" );
            CLASS.css( 'color', "#FFFFFF" );
        } else {
            NAME.css( 'color', "#000000" );
            CLASS.css( 'color', "#000000" );
        }

        BACKGROUND.css( "background-color", BACKGROUND_INPUT[0].defaultValue );
        IMG.css( 'background-color', BACKGROUND_INPUT[0].defaultValue );
    },

    adjustFontWidth(_div, _scale) {
        const stat = $(_div)
        const regex = /[A-Z]|[a-z]/g;

        const width = 1 / _scale;
        const left = (1 - _scale) / (2 * _scale);

        console.log(stat);

        if (stat.data('ignore')) return;

        if (regex.test(stat[0].value)) {
            stat
                .css('transform',       `scaleX(${_scale})`)
                .css('width',           `${width * 100}%`)
                .css('position',        'relative')
                .css('left',            `${left * -100}%`)
                .css('font-weight',     'normal')
            ;
        } else {
            stat
                .css('transform',       `scaleX(1)`)
                .css('width',           `100%`)
                .css('position',        'static')
                .css('font-weight',     'bold')
            ;
        }

        //console.log([stat, regex]);
    },

    updateStatWidth(_html, _scale) {
        const STATS = _html.find('.stat-wrapper');

        _html.ready(() => {
            for (let i = 0; i < STATS.children().length; i++) {
                this.adjustFontWidth(STATS.children()[i], _scale)
            }
        })

        STATS.children().on('keydown', event => {
            this.adjustFontWidth(event.currentTarget, _scale);
        });
    },

    createBlankStat(_html) {
        _html.find('.create-blank').on('click', event => {
            this.object.system.createStats();
        })
    },

    addDefaultStats(_html) {
        _html.find('.create-default').on('click', event => {
            let type = this.object.type.toLowerCase();

            if (type == 'kit piece') {
                type = this.object.system.type.toLowerCase();
            }

            const stats = defaultStats[`${type}Stats`];

            this.object.system.createStats(stats);
        })
    },

    collapseStatBlock(_html) {
        const COLLAPSE_STATS = _html.find('.collapse-button')
        const STAT_BLOCK = _html.find('.stat-block')

        _html.ready(() => {
            if (STAT_BLOCK.find('.stat').length == 0) {
                STAT_BLOCK.addClass('hidden');
            }
        });
        
        COLLAPSE_STATS.on('click', event => {

            const isHidden = STAT_BLOCK.hasClass('hidden');

            if (isHidden) {
                STAT_BLOCK.removeClass('hidden');
            } else {
                STAT_BLOCK.addClass('hidden');
            }
        })
    },

    contextMenuEntries() {
        const parent = this;
        const localize = _key => game.i18n.localize(CONFIG.animecampaign.statButtons[`${_key}`]);

        return [
            {
                name: localize("addLeft"),
                icon: `<i class="fas fa-arrow-left"></i>`,
                callback: element => {
                    const index = element.data().index;
                    console.log( parent );
                    parent.object.system.createStats([{}], index);
                }
            },
            {
                name: localize("addRight"),
                icon: `<i class="fas fa-arrow-right"></i>`,
                callback: element => {
                    const index = element.data().index;
                    parent.object.system.createStats([{}], index + 1);
                }
            },
            {
                name: localize("configure"),
                icon: `<i class="fas fa-gear"></i>`,
                callback: element => {
                    const statPosition = element.position();
                    const sheetPosition = element.parents().find('.animecampaign.sheet').position();
                    const PADDING_PX = 5;

                    const options = {
                        top: statPosition.top + sheetPosition.top + element.height() + PADDING_PX,
                        left: statPosition.left + sheetPosition.left - PADDING_PX
                    }

                    const index = element.data().index;
                    const stat = parent.object.system.stats[index];
                    new StatConfigMenu(stat, options).render(true);
                }
            },
            {
                name: localize("delete"),
                icon: `<i class="fas fa-trash-can-xmark"></i>`,
                callback: element => {
                    const index = element.data().index;
                    parent.object.system.deleteStatIndex(index);
                }
            },
        ]
    },

    // !!! DEPRECIATED
    //  Creates a blank stat.
    //      _html   (jQuery)    : The entity sheet form as a jQuery object
    __createBlankStat(_html) {
        let stats = this.object.system.stats;

        _html.find('.stat-create').on('click', event => {
            let blankStat = new Stat()

            this.object.update({ 'system.stats': [...stats, blankStat] })
        })
    },
}