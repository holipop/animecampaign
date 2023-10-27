import * as List from "../List.js";

/**
 * Extending the Actor class for system-specific logic.
 */
export default class ACActor extends Actor {

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
                const name = feature.system.category;
                const categoryExists = List.has(categories, { name })

                if (!categoryExists) {
                    categories = List.add(categories, { name })
                }
            })
            
            this.update({ 'system.categories': categories });
        }

        super._onCreateDescendantDocuments(parent, collection, documents, ...args);
    }

}
