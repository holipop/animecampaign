/**
 * Extending the Item class for system-specific logic.
 */
export default class ACItem extends Item { 

    /** @override */
    _preCreate (data, options, user) {
        super._preCreate(data, options, user);
        this.updateSource({ img: null })
    }

    /**
     * Sends a chat message displaying this feature, rolling if a valid roll formula is provided. 
     * @param {boolean} options.post
     */
    async roll ({ post = false } = {}) {
        let formula = this.system.details.formula ?? ""
        if (!Roll.validate(formula)) {
            formula = "1"
            post = true
        }

        const [roll, max, min] = await Promise.all([
            new Roll(formula).evaluate(),
            new Roll(formula).evaluate({ maximize: true }),
            new Roll(formula).evaluate({ minimize: true }),
        ])

        let crit
        if (roll.isDeterministic) { }
        else if (roll.total == max.total) {
            crit = "ChatMessage__Total--CritSuccess"
        } else if (roll.total == min.total) {
            crit = "ChatMessage__Total--CritFailure"
        }

        const [tooltip, enrichedDescription] = await Promise.all([
            roll.getTooltip(),
            TextEditor.enrichHTML(this.system.description)
        ])
        const context = {
            formula,
            roll,
            post,
            crit,
            tooltip,
            enrichedDescription,

            feature: this,
            palette: this.system.palette,
        }
        const template = "systems/animecampaign/templates/roll/template.hbs"
        const message = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content: await renderTemplate(template, context),
        }

        if (post) {
            ChatMessage.create(message);
        } else {
            roll.toMessage(message);
        }
    }

}
