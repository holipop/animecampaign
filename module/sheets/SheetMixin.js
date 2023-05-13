import { Stat } from "../ACStat.js"

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
        const nameResize = new ResizeObserver(e => {
            this.adjustFontSize(NAME, _rem, _max)
        })
        nameResize.observe(NAME[0]);
        nameResize.observe(_html[0]);

        _html.ready(() => this.adjustFontSize(NAME, _rem, _max));

        NAME.on('blur', e => this.object.update({ 'name': NAME.text() }));
        NAME[0].addEventListener('paste', e => e.preventDefault())
    },

    //  Creates a dialog box for creating a new stat.
    //      _html   (jQuery)    : The entity sheet form as a jQuery object
    createStatDialog(_html) {
        const CREATE_STAT = _html.find('.stat-create');
        CREATE_STAT.on('click', e => {
            let dialog = new Dialog({
                title: `Create Stat: ${this.item.name}`,
                content: `<p>Enter stat name:</p><input type="text" placeholder="Stat name"><hr>`,
                buttons: {
                    confirm: {
                        icon: '<i class="fas fa-check"></i>',
                        label: "Confirm",
                        callback: e => {
                            this.object.system.createStat(e.find('input').val())
                            //TODO  if stat name is already taken/empty, throw error
                        }
                    }
                },
                default: "confirm",
                render: html => {},
                close: html => {}
            });
            dialog.render(true);
        })
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

        let color = BACKGROUND_INPUT[0].defaultValue

        let rgb = [color.slice(1, 3), color.slice(3, 5), color.slice(5)]
            .map(element => Number(`0x${element}`));
        rgb[0] *= 0.2126;
        rgb[1] *= 0.7152;
        rgb[2] *= 0.0722;

        let perceivedLightness = rgb.reduce((n, m) => n + m) / 255;

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
}