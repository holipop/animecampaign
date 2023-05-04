export default class ACActorSheet extends ActorSheet {
    
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 520,
            height: 500,
            classes: ["animecampaign", "sheet", "actor"]
        },{
            overwrite: true
        });
    }

    get template() {
        return `systems/animecampaign/templates/sheets/${this.actor.type}-sheet.hbs`;
    }

    async getData() {
        const data = super.getData()
        
        data.config = CONFIG.animecampaign; 
        data.system = data.actor.system; 

        return data;
    }

    activateListeners(html) {
        // Adjust Name Font Size
        const NAME = html.find('.name');
        const nameResize = new ResizeObserver(e => {
            this.adjustFontSize(NAME, 3, 60)
        })
        nameResize.observe(NAME[0]);
        nameResize.observe(html[0]);

        html.ready(() => this.adjustFontSize(NAME, 3, 60));

        // Update Name
        NAME.on('blur', e => this.actor.update({ 'name': NAME.text() }));
        NAME[0].addEventListener('paste', e => e.preventDefault())

        // Update Class
        const CLASS = html.find('.class');
        CLASS.on('blur', e => this.actor.update({ 'system.class':  CLASS.text() }));
        CLASS[0].addEventListener('paste', e => e.preventDefault());

        this.updateBackground(html, 0.5);

        this.updateIsInscribed();

        this.updateProficiencyClass(html)

        super.activateListeners(html);
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

    updateIsInscribed() {
        let values = Object
            .values(CONFIG.animecampaign.type.inscribed)
            .map(element => game.i18n.localize(element).toLowerCase());
        let type = this.actor.system.type;

        if (values.includes(type)) {
            this.actor.update({ 'system.isInscribed': true })
        } else {
            this.actor.update({ 'system.isInscribed': false })
        }
    }

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
    }

    updateProficiencyClass(_html) {
        const PROF_CLASS = _html.find('.proficiency-class');
        let proficiency = this.actor.system.stats.proficiency.value;

        if (proficiency < 60) {
            PROF_CLASS.text( 'I' );
        } else if ((60 <= proficiency) && (proficiency < 100)) {
            PROF_CLASS.text( 'II' );
        } else {
            PROF_CLASS.text( 'III' );
        }
    }
}