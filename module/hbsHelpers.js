// A an object containing system-specific Handlebars Helpers.
export const hbsHelpers = {

    /** Changes the context given a string path.
     * @param {string} path 
     * @param {*} options
     * @returns {Object} 
     */
    //! This can already be accomplished with the lookup inline-helper.
    __search: function (path, options) {
        const root = options.data.root;
        const context = typeof path == 'string' ? path : path.string; 

        return options.fn(getProperty(root, context));
    }
}
