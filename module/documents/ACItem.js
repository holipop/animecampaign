import ACDialogV2 from "../applications-v2/ACDialogV2.js";
import * as Description from "../Description.js"

/**
 * Extending the Item class for system-specific logic.
 */
export default class ACItem extends Item { 

    /** @inheritdoc */
    _preCreate (data, options, user) {
        super._preCreate(data, options, user);
        this.updateSource({ img: null })
    }

    /**
     * The set of input/select query objects derived from enriched tags.
     * This is appended in `enrichConfigStatic.enricher` and cleared in `FeatureSheetV2#_prepareContext`.
     * @type {Query[]}
     */
    queries = []

    /**
     * Returns a record of this features's stats.
     * @returns {Record<string, Stat>}
     */
    getStatContext() {
        const data = this.system.stats
            .map(stat => [stat.tag, stat])
            .concat((this.isOwned) 
                ? Object
                    .entries(this.parent.getStatContext())
                    .map(([tag, stat]) => [`actor.${tag}`, stat])
                : []
            )

        return Object.fromEntries(data)
    }

    /** 
     * @inheritdoc 
     * @returns {Record<string, number>}
     */
    getRollData() {
        const data = Object
            .entries(this.getStatContext())
            .map(([tag, stat]) => [tag.replace(" ", "_"), stat.value])
            .filter(([_, value]) => value)

        return Object.fromEntries(data)
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

        const rollData = this.getRollData()
        const [roll, max, min] = await Promise.all([
            new Roll(formula, rollData).evaluate(),
            new Roll(formula, rollData).evaluate({ maximize: true }),
            new Roll(formula, rollData).evaluate({ minimize: true }),
        ])

        let crit
        if (roll.isDeterministic) { }
        else if (roll.total == max.total) {
            crit = "ChatMessage__Total--CritSuccess"
        } else if (roll.total == min.total) {
            crit = "ChatMessage__Total--CritFailure"
        }

        // !! Query handling WIP
        /* let answers = []
        if (this.queries.length > 0) {
            const content = await renderTemplate('systems/animecampaign/templates/dialog/roll-config.hbs', {
                queries: this.queries
            })
            const data = await ACDialogV2.prompt({
                window: {
                    title: game.i18n.format("AC.RollConfig.Title")
                },
                content,
                ok: {
                    label: "Roll",
                    icon: "ifl",
                    callback: (event, button, dialog) => new FormDataExtended(button.form).object
                },
            })

            answers = Object.values(foundry.utils.expandObject(data).queries)
        } */

        const [tooltip, enrichedDescription] = await Promise.all([
            roll.getTooltip(),
            Description.enrichChatMessage(this.system.description, this, answers)
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
