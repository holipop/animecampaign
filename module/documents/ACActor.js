import Stat from "../data-models/Stat.js"

/**
 * Extending the Actor class for system-specific logic.
 */
export default class ACActor extends Actor {

    /** 
     * @inheritdoc 
     * @override
     */
    async modifyTokenAttribute(attribute, value, isDelta = false, isBar = true) {
        const current = foundry.utils.getProperty(this.system, attribute)
    
        // Determine the updates to make to the actor data
        let updates
        if (isBar) {
            if (isDelta) {
                // remove clamp so token bars can go into the negatives
                value = Number(current.value) + value 
            }
            updates = {[`system.${attribute}.value`]: value}
        } else {
            if (isDelta) value = Number(current) + value
            updates = {[`system.${attribute}`]: value}
        }
        const allowed = Hooks.call("modifyTokenAttribute", {attribute, value, isDelta, isBar}, updates)
        return allowed !== false ? this.update(updates) : this
    }

    /**
     * Returns a record of this character's color stats and main stats.
     * Color stats appear twice with their tag and their color being used as keys.
     * @returns {Record<string, Stat>}
     */
    getStatContext() {
        const data = this.system.colorStats
            .map(stat => [[stat.tag, stat], [`stat.${stat.color}`, stat]])
            .flat()
            .concat([
                ["stamina", this.system.stamina],
                ["proficiency", this.system.proficiency],
                ["movement", this.system.movement],
            ])

        return Object.fromEntries(data)
    }

    /** 
     * @inheritdoc 
     * @override
     * @returns {Record<string, number>}
     */
    getRollData() {
        const data = Object
            .entries(this.getStatContext())
            .map(([tag, stat]) => [tag.replace(" ", "_"), stat.value])
            .filter(([_, value]) => value)

        return Object.fromEntries(data)
    }

}
