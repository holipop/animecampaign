import ACDialogV2 from "../applications-v2/ACDialogV2.js"
import RollConfigV2 from "../applications-v2/RollConfigV2.js"
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
        const data = (post)
            ? { formula: "1", modifier: "", rollMode: "public", button: "normal" } 
            : await ACDialogV2.from({
                template: "systems/animecampaign/templates/dialog/roll-config.hbs",
                context: {
                    rollModes: CONFIG.Dice.rollModes,
                    rollTypes: CONFIG.AC.rollTypes, 
                    formula: this.system.details.formula
                },
                window: {
                    title: game.i18n.format("AC.RollConfig.Title", { 
                        name: this.name, 
                    }),
                },
                buttons: [
                    {
                        action: "normal",
                        icon: "ifl",
                        label: "AC.RollConfig.Roll",
                        default: true
                    },
                ]
            })

        if (!data) return
        
        let formula = data.formula + data.modifier ?? ""
        if (!Roll.validate(formula)) {
            formula = "1"
            post = true
        }
        
        const roll = new Roll(formula, this.getRollData())

        const [max, min] = await Promise.all([
            roll.clone().evaluate({ maximize: true }),
            roll.clone().evaluate({ minimize: true }),
        ])
        
        const firstDie = roll.terms[0]

        if (data.rollType === "disadvantage") {
            firstDie.alter(1, 1)
            firstDie.modifiers.push("kl")
        } else if (data.rollType === "advantage") {
            firstDie.alter(1, 1)
            firstDie.modifiers.push("kh")
        }
        
        roll.resetFormula() // doesn't do anything for normal rolls
        await roll.evaluate() 

        let crit = ""
        if (roll.total == max.total) {
            crit = "ChatMessage__Total--CritSuccess"
        } else if (roll.total == min.total) {
            crit = "ChatMessage__Total--CritFailure"
        }

        const [tooltip, description] = await Promise.all([
            roll.getTooltip(),
            Description.enrichChatMessage(this.system.description, this),
        ])

        const parts = roll.dice.map(term => term.getTooltipData())
        const remainder = parts.reduce(
            (acculumator, term) => acculumator - term.total,
            roll.total
        )

        if (remainder) {
            parts.push({ total: remainder })
        }

        console.log(parts)
        

        const template = "systems/animecampaign/templates/roll/template.hbs"
        const context = {
            roll: roll,
            post: post,
            crit: crit,
            description: description,
            tooltip: tooltip,
            parts: parts,
            feature: this,
            palette: this.system.palette,
        }

        const message = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content: await renderTemplate(template, context)
        }

        if (post) {
            ChatMessage.create(message, { rollMode: data.rollMode });
        } else {
            roll.toMessage(message, { rollMode: data.rollMode });
        }
    }

}
