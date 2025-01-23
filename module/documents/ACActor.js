/**
 * Extending the Actor class for system-specific logic.
 */
export default class ACActor extends Actor {

    /** 
     * Fires whenever an attribute is modified via a token.
     * @param {string} attribute 
     * @param {number} value 
     * @param {boolean?} isDelta 
     * @param {boolean?} isBar 
     * @returns {Promise<ACActor>}
     * @override
     */
    async modifyTokenAttribute(attribute, value, isDelta=false, isBar=true) {
        const current = foundry.utils.getProperty(this.system, attribute);
    
        // Determine the updates to make to the actor data
        let updates;
        if ( isBar ) {
            if (isDelta) {
                value = Number(current.value) + value
            }
            updates = {[`system.${attribute}.value`]: value};
        } else {
            if ( isDelta ) value = Number(current) + value;
            updates = {[`system.${attribute}`]: value};
        }
        const allowed = Hooks.call("modifyTokenAttribute", {attribute, value, isDelta, isBar}, updates);
        return allowed !== false ? this.update(updates) : this;
    }

}
