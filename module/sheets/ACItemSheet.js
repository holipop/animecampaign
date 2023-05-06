export default class ACItemSheet extends ItemSheet {
    
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 450,
            height: 500,
            classes: ["animecampaign", "sheet", "item"]
        });
    }

    get template() {
        if (this.item.type == 'Kit Piece') {
            return `systems/animecampaign/templates/sheets/kit-piece-sheet.hbs`;
        }
    }

    async getData() {
        const data = super.getData()

        data.config = CONFIG.animecampaign;
        data.system = data.item.system; 

        return data;
    }

    activateListeners(html) {
        // Adjust Name Font Size
        const NAME = html.find('.name');
        const nameResize = new ResizeObserver(e => {
            this.adjustFontSize(NAME, 2.5, 60)
        })
        nameResize.observe(NAME[0]);
        nameResize.observe(html[0]);

        html.ready(() => this.adjustFontSize(NAME, 2.5, 60));

        // Update Name
        NAME.on('blur', e => this.item.update({ 'name': NAME.text() }));
        NAME[0].addEventListener('paste', e => e.preventDefault())

        // Add Stat
        const CREATE_STAT = html.find('.stat-create');
        CREATE_STAT.on('click', e => {
            let d = new Dialog({
                title: `Add Stat: ${this.item.name}`,
                content: `<p>Enter stat name:</p>
                <input type="text" placeholder="Stat name">`,
                buttons: {
                    confirm: {
                        icon: '<i class="fas fa-check"></i>',
                        label: "Confirm",
                        callback: () => {}
                    }
                },
                default: "confirm",
                render: html => console.log("Register interactivity in the rendered dialog"),
                close: html => console.log("This always is logged no matter which option is chosen")
            }, {
                classes: ["animecampaign", "sheet", "item", "dialog"]
            });
            d.render(true);
        })

        this.updateBackground(html, 0.5);
        super.activateListeners(html)
    }

    adjustFontSize(_div, _rem, _max) {
        const text = $(_div);

        text.css( 'fontSize', `${_rem}rem`);

        while (text.height() > _max) {
            _rem *= 0.85;
            text.css( 'fontSize', `${_rem}rem`);
            console.log('Anime Campaign | Resizing Text');
        } 
    }
    
    updateBackground(_html, _threshold) {
        const BACKGROUND = _html.find('.background');
        const BACKGROUND_INPUT = _html.find('.background-input');
        const NAME = _html.find('.name');
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
        } else {
            NAME.css( 'color', "#000000" );
        }

        BACKGROUND.css( "background-color", BACKGROUND_INPUT[0].defaultValue );
        IMG.css( 'background-color', BACKGROUND_INPUT[0].defaultValue );
    }
}