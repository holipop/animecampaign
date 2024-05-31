/**
 * An extension of the Dialog class.
 */
export default class ACDialog extends Dialog {

    /** Sets the default options for this application.
     * @returns {Object}
     */
    static get defaultOptions () {
        const options = foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["animecampaign", "dialog"],
            template: "systems/animecampaign/templates/dialog/ac-dialog.hbs"
        });

        return options;
    }

    /** A helper factory method to generate a yes/no dialog.
     * @override
     * @param {*} config 
     * @returns {Promise<*>}
     */
    static async confirm ({ title, content, yes, no, render, defaultYes = true, rejectClose = false, options = {} } = {}) {
        return this.wait({
            title, content, render,
            focus: true,
            default: defaultYes ? "yes" : "no",
            close: () => {
                if (rejectClose) return
                return null
            },
            buttons: {
                yes: {
                    icon: 'check',
                    label: game.i18n.localize("Yes"),
                    callback: html => yes ? yes(html) : true
                },
                no: {
                    icon: 'close',
                    label: game.i18n.localize("No"),
                    callback: html => no ? no(html) : false
                }
            }
        }, options)
    }

    /** A helper factory method for a simple prompt with one button.
     * @override
     * @param {config} param0 
     * @returns {Promise<*>}
     */
    static async prompt({title, content, label, callback, render, rejectClose=true, options={}}={}) {
        return this.wait({
            title, content, render,
            default: "ok",
            close: () => {
                if ( rejectClose ) return;
                return null;
            },
            buttons: {
                ok: { icon: 'check', label, callback }
            }
        }, options);
    }

}