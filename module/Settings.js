/** A namespace for settings.
 * @module Settings
 */


/** Loads the system-specific settings.
 */
export function register () {

    //* WORLD */

    // Internal System Migration Version
    game.settings.register('animecampaign', 'systemMigrationVersion', {
        name: "System Migration Version",
        scope: 'world',
        config: false,
        type: String,
        default: ""
    })

    // Diagonal Movement Rule
    // (Taken directly from DnD5e)
    // ! Is now a core setting in v12
    /* game.settings.register('animecampaign', "diagonalMovement", {
        name: "AC.SETTINGS.DiagonalMovement.Name",
        hint:  "AC.SETTINGS.DiagonalMovement.Hint",
        scope: "world",
        config: true,
        default: "5105",
        type: String,
        choices: {
            "555": "AC.SETTINGS.DiagonalMovement.555",
            "5105": "AC.SETTINGS.DiagonalMovement.5105",
            "EUCL": "AC.SETTINGS.DiagonalMovement.EUCL",
        },
        onChange: value => canvas.grid.diagonalRule = value
    }); */

    // Token Bar Clamp
    game.settings.register('animecampaign', 'tokenBarClamp', {
        name: "AC.SETTINGS.TokenBarClamp.Name",
        hint: "AC.SETTINGS.TokenBarClamp.Hint",
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
        onChange: () => {},
    })

    //* CLIENT */

    // Default Text Editor
    game.settings.register('animecampaign', 'defaultTextEditor', {
        name: "AC.SETTINGS.DefaultTextEditor.Name",
        hint: "AC.SETTINGS.DefaultTextEditor.Hint",
        scope: 'client',
        config: true,
        type: String,
        choices: {
            "markdown": "AC.LABEL.Markdown",
            "prosemirror": "AC.LABEL.ProseMirror",
        },
        default: "markdown",
        onChange: () => {},
    });

    // Default Feature Image
    game.settings.register('animecampaign', 'defaultFeatureImage', {
        name: "AC.SETTINGS.DefaultFeatureImage.Name",
        hint: "AC.SETTINGS.DefaultFeatureImage.Hint",
        scope: 'client',
        config: true,
        type: Boolean,
        default: false,
        onChange: () => {},
    })

}