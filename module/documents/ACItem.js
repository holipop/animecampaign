import * as Utils from "../Utils.js"

/**
 * Extending the Item class for system-specific logic.
 */
export default class ACItem extends Item { 

    /** The file path to the roll template.
     * @returns {String}
     */
    get rollTemplate () { return 'systems/animecampaign/templates/roll/roll-template.hbs' }

    async getRollContent () {
        return renderTemplate(this.rollTemplate, data)
    }

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
     * @param {Boolean} options.post
     * @param {String?} options.customFormula
     */
    async roll ({ post = false, customFormula = null } = {}) {
        
        // If the formula is invalid, post the message.
        const formula = customFormula || this.system.details.formula;
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
        const contrast = Utils.contrastHexLuma(this.system.color)
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
