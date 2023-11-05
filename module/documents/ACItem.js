import * as AC from "../AC.js"

/**
 * Extending the Item class for system-specific logic.
 */
export default class ACItem extends Item { 

    /** The file path to the roll template.
     * @returns {String}
     */
    get rollTemplate () { return 'systems/animecampaign/templates/roll/roll-template.hbs' }

    /** Fires before a document is created. For preliminary operations.
     * @param {*} data 
     * @param {*} options 
     * @param {BaseUser} user 
     */
    _preCreate(data, options, user) {
        super._preCreate(data, options, user);

        const defaultTextEditor = game.settings.get('animecampaign', 'defaultTextEditor');
        this.updateSource({ 'system.details.editor': defaultTextEditor });
    }

    /** Sends a chat message of this feature.
     */
    async roll ({ post = false } = {}) {
        
        // If the formula is invalid, post the message.
        const formula = this.system.details.formula;
        let roll;
        if (Roll.validate(formula)) {
            roll = await new Roll(formula).evaluate();
        } else {
            roll = await new Roll("1").evaluate();
            post = true;
        }

        // Get CSS classes for if the roll is the max or min value.
        let crit;
        (() => {
            if (roll.isDeterministic) return;

            if (roll.total == new Roll(formula).evaluate({ maximize: true }).total) {
                crit = 'success';
            } else if (roll.total == new Roll(formula).evaluate({ minimize: true }).total) {
                crit = 'failure';
            }
        })();

        // Getting colors for contrasting.
        const contrast = (() => {
            const rgb = AC.hexToRGB(this.system.color);
            rgb[0] *= 0.2126;
            rgb[1] *= 0.7152;
            rgb[2] *= 0.0722;

            const luma = rgb.reduce((n, m) => n + m) / 255;
            return (luma <= .5) ? "white" : "black";
        })();
        const contrastImg = (contrast == 'white') 
            ? 'brightness(0) saturate(100%) invert(100%)'
            : 'brightness(0) saturate(100%)';

        // Data preparation
        const data = { 
            ...this,
            _id: this._id,
            
            match: this.system.color,
            contrast,
            contrastImg,

            post,
            roll,
            crit,
            tooltip: await roll.getTooltip(),

            stats: this.system.stats,
            sections: this.system.sections,
            details: this.system.details,
        }
        
        const message = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content: await renderTemplate(this.rollTemplate, data),
        }

        if (post) {
            return ChatMessage.create(message);
        }

        return roll.toMessage(message);
    }

}
