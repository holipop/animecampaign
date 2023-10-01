// Extending the base Actor class for system-specific logic.
export default class ACActor extends Actor {

    /** This method is called whenever an embedded document is created.
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

    /** Creates a new category for each created owned feature that can't be included.
     * @param {Document[]} documents 
     */
    createMissingCategories (documents) {
        const features = documents.filter(document => document.type == 'Feature');
        const categories = [...this.system.categories];

        features.forEach(feature => {
            const category = feature.system.category;

            if (!categories.includes(category)) categories.push(category);
        });

        this.update({ 'system.categories': categories });
    }
}
