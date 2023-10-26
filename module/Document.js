/** Module containing all Documents.
 * @module Document
 */

import * as List from "./helper/List.js";


/**
 * Extending the Actor class for system-specific logic.
 */
export class ACActor extends Actor {

    /** Fired whenever an embedded document is created.
     * @param {Document} parent
     * @param {String} collection
     * @param {Document[]} documents 
     * @param {...any} args 
     */
    _onCreateDescendantDocuments (parent, collection, documents, ...args) {
        if (collection == 'items') {
            
            // if the category of the items don't exist in the owner, create it
            const features = documents.filter(document => document.type == 'Feature');
            let categories = this.system.categories;

            features.forEach(feature => {
                const query = { name: feature.system.category };
                const categoryExists = List.has(categories, query)

                if (!categoryExists) {
                    categories = List.add(categories, query)
                }
            })
            
            this.update({ 'system.categories': categories });
        }

        super._onCreateDescendantDocuments(parent, collection, documents, ...args);
    }
}


/**
 * Extending the Item class for system-specific logic.
 */
export class ACItem extends Item { 

    /** The file path to the roll template.
     * @returns {String}
     */
    get rollTemplate () { return 'systems/animecampaign/templates/roll/roll-template.hbs' }

    /** Sends a chat message of this feature.
     */
    async roll () {
        const data = { ...this }
        
        const message = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content: await renderTemplate(this.rollTemplate, data),
        }

        return ChatMessage.create(message);
    }
}