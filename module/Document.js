/** Module containing all Documents.
 * @module Document
 */


/**
 * Extending the Actor class for system-specific logic.
 */
export class ACActor extends Actor {

    /** Fired whenever an embedded document is created.
     * @param {Document} parent This document.
     * @param {string} collection The name of the collection the document(s) belong to.
     * @param {Document[]} documents The created document(s).
     * @param {...any} args [data, options, userId]
     */
    _onCreateDescendantDocuments (parent, collection, documents, ...args) {
        if (collection == 'items') {
            this.createMissingCategories(documents);
        }

        super._onCreateDescendantDocuments(parent, collection, documents, ...args);
    }

    /** Fired whenever an embedded document is updated.
     * @param {Document} parent This document.
     * @param {string} collection The name of the collection the document(s) belong to.
     * @param {Document[]} documents The created document(s).
     * @param {...any} args [data, options, userId]
     */
    _onUpdateDescendantDocuments(parent, collection, documents, ...args) {
        if (collection == 'items') {
            this.createMissingCategories(documents);
        }

        super._onUpdateDescendantDocuments(parent, collection, documents, ...args);
    }

    /** Creates a new category for each created owned feature that can't be sorted.
     * @param {Document[]} documents 
     */
    createMissingCategories (documents) {
        const features = documents.filter(document => document.type == 'Feature');
        const categories = this.system.categories;

        features.forEach(feature => {
            const category = feature.system.category;

            if (!Object.keys(categories).includes(category)) {
                categories[category] = [];
            };
        });

        this.update({ 'system.categories': categories });
    }
}


/**
 * Extending the Item class for system-specific logic.
 */
export class ACItem extends Item { 

    get rollTemplate () { return 'systems/animecampaign/templates/roll/roll-template.hbs' }

    async roll () {
        const data = {
            ...this
        }
        
        const message = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content: await renderTemplate(this.rollTemplate, data),
        }

        return ChatMessage.create(message);
    }

}