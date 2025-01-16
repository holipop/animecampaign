import * as Utils from "../Utils.js"

/**
 * Extending the Item class for system-specific logic.
 */
export default class ACItem extends Item { 

    /** The file path to the chat message template.
     * @returns {String}
     */
    get chatMessageTemplate () { 
        return 'systems/animecampaign/templates/roll/roll-template.hbs' 
    }

    /** The file paths for the templates of chat message partials.
     * @returns {*}
     * @enum
     */
    get chatMessagePartial () {
        return {
            summary: 'systems/animecampaign/templates/roll/summary.hbs',
            dice: 'systems/animecampaign/templates/roll/dice.hbs',
            stats: 'systems/animecampaign/templates/roll/stats.hbs',
            sections: 'systems/animecampaign/templates/roll/sections.hbs',
            banner: 'systems/animecampaign/templates/roll/banner.hbs',
        }
    } 

    /** Fires before a document is created. For preliminary operations.
     * @param {*} data 
     * @param {*} options 
     * @param {BaseUser} user 
     */
    _preCreate (data, options, user) {
        console.log(data)
        const defaultTextEditor = game.settings.get('animecampaign', 'defaultTextEditor');
        
        super._preCreate(data, options, user);
/* 

        // const isDefaultImageOwner = game.settings.get('animecampaign', 'defaultFeatureImage')

        const updates = {
            'system.details.editor': defaultTextEditor,
            'img': null
        }

        this.updateSource(updates); */
    }

    /** Render the summary partial of a chat message.
     * @returns {Promise<String>}
     */
    async getSummaryContent () {
        const data = {
            ...this,
            match: this.system.color,
            contrast: Utils.contrastHexLuma(this.system.color),
        }
        return renderTemplate(this.chatMessagePartial.summary, data)
    }

    /** Render the dice partial of a chat message.
     * @returns {Promise<String>}
     */
    async getDiceContent (roll, post = false) {
        const formula = roll._formula

        // Get CSS classes for if the roll is the max or min value.
        let crit;
        if (roll.isDeterministic) { }
        else if (roll.total == new Roll(formula).evaluate({ maximize: true }).total) {
            crit = 'success';
        } else if (roll.total == new Roll(formula).evaluate({ minimize: true }).total) {
            crit = 'failure';
        }

        const data = {
            post,
            roll,
            crit,
            tooltip: await roll.getTooltip(),
        }
        return renderTemplate(this.chatMessagePartial.dice, data)
    }

    /** Render the stats partial of a chat message.
     * @returns {Promise<String>}
     */
    async getStatsContent () {
        const data = { stats: this.system.stats }
        return renderTemplate(this.chatMessagePartial.stats, data)
    }

    /** Render the sections partial of a chat message.
     * @returns {Promise<String>}
     */
    async getSectionsContent () {
        const data = { sections: this.system.sections }
        return renderTemplate(this.chatMessagePartial.sections, data)
    }

    /** Render the banner partial of a chat message.
     * @returns {Promise<String>}
     */
    async getBannerContent () {
        const data = {
            match: this.system.color,
            contrast: Utils.contrastHexLuma(this.system.color),
            details: this.system.details,
        }
        return renderTemplate(this.chatMessagePartial.banner, data)
    }

    /** Sends a chat message of this feature.
     * @param {Boolean} options.post
     * @param {String?} options.formula
     */
    async roll ({ post = false, formula = null, template = null } = {}) {
        
        // If the formula is invalid, post the message.
        formula ??= this.system.details.formula;
        let roll;
        if (Roll.validate(formula)) {
            roll = await new Roll(formula).evaluate();
        } else {
            roll = await new Roll("1").evaluate();
            post = true;
        }

        const data = {
            ...this,
            _id: this._id,
            system: this.system,
            roll,

            summary: await this.getSummaryContent(),
            dice: await this.getDiceContent(roll, post),
            stats: await this.getStatsContent(),
            sections: await this.getSectionsContent(),
            banner: await this.getBannerContent(),
        }

        const customTemplate = `
            <div class="animecampaign chat roll" data-id="{{_id}}">
                ${template}
            </div>`

        const content = (template)
            ? Handlebars.compile(customTemplate)(data)
            : await renderTemplate(this.chatMessageTemplate, data);
        
        const message = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content,
        }

        if (post) {
            ChatMessage.create(message);
        } else {
            roll.toMessage(message);
        }
    }

}
