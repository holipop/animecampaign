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
     * @inheritdoc 
     * @override
     * @returns {Record<string, number>}
     */
    getRollData() {
        const data = this.system.colorStats
            .map(stat => [[stat.tag.replace(" ", "_"), stat.value], [`stat.${stat.color}`, stat.value]])
            .flat()
            .concat([
                ["stamina", this.system.stamina.value],
                ["proficiency", this.system.proficiency.value],
                ["movement", this.system.movement.value],
            ])
            .filter(([_, value]) => value) // if value exists

        return Object.fromEntries(data)
    }

}
