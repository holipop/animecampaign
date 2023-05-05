export default class ACItemSheet extends ItemSheet {
    
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 450,
            height: 500,
            classes: ["animecampaign", "sheet", "item"]
        });
    }

    get template() {
        let kit = ['Weapon', 'Talent', 'Passive', 'Ability'];
        if (kit.includes(this.item.type)) {
            return `systems/animecampaign/templates/sheets/kit-piece-sheet.hbs`;
        }
        return `systems/animecampaign/templates/sheets/${this.item.type}-sheet.hbs`;
    }

    async getData() {
        const data = super.getData()
        data.config = CONFIG.animecampaign; //This is the localization
        data.system = data.item.system; //THIS IS THE SHIT WE DEFINED!!!
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
        NAME.on('blur', e => this.actor.update({ 'name': NAME.text() }));
        NAME[0].addEventListener('paste', e => e.preventDefault())

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