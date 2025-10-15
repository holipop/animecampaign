// Anime Campaign for Foundry VTT
// by Holipop


import * as config from './module/config.js'
import * as Description from "./module/Description.js"
import * as Macro from './module/Macro.js'
import * as Migrate from "./module/Migrate.js"

import ACActor from './module/documents/ACActor.js'
import ACItem from './module/documents/ACItem.js'
import CharacterData from './module/data-models/CharacterData.js'
import FeatureData from './module/data-models/FeatureData.js'
import CharacterSheetV2 from './module/applications-v2/CharacterSheetV2.js'
import FeatureSheetV2 from './module/applications-v2/FeatureSheetV2.js'

globalThis.AC = {
    Actor: ACActor,
    Item: ACItem,
    CharacterData,
    FeatureData,
    CharacterSheetV2,
    FeatureSheetV2,
    Macro: { ...Macro }
}

Hooks.once('init', () => {
    console.log(`%cAnime Campaign | ${config.AC.ascii}`, 'color: #db7093;');
    console.log("%cAnime Campaign | Initializing Anime Campaign System!", "color: #db7093;");

    CONFIG.AC = config.AC;
    game.AC = AC

    CONFIG.Actor.documentClass = ACActor;
    CONFIG.Actor.dataModels["Character"] = CharacterData;

    CONFIG.Item.documentClass = ACItem;
    CONFIG.Item.dataModels["Feature"] = FeatureData;

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("animecampaign", CharacterSheetV2, { 
        types: ["Character"],
        makeDefault: true 
    });

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("animecampaign", FeatureSheetV2, { 
        types: ["Feature"],
        makeDefault: true 
    });

    game.settings.register('animecampaign', 'systemMigrationVersion', {
        name: "System Migration Version",
        scope: 'world',
        config: false,
        type: String,
        default: ""
    })

    const partials = {
        "generic.nav": "systems/animecampaign/templates/generic/nav.hbs",
        "generic.details": "systems/animecampaign/templates/generic/details.hbs",

        "character.summary": "systems/animecampaign/templates/character-v2/summary.hbs",
        "character.stats": "systems/animecampaign/templates/character-v2/stats.hbs",
        "character.kit": "systems/animecampaign/templates/character-v2/kit.hbs",
        "character.feature-entry": "systems/animecampaign/templates/character-v2/feature-entry.hbs",

        "feature.summary": "systems/animecampaign/templates/feature-v2/summary.hbs",
        "feature.stats": "systems/animecampaign/templates/feature-v2/stats.hbs",
    }
    loadTemplates(partials)
})

Hooks.on('ready', () => {
    const NEEDS_MIGRATION_VERSION = "v1.0"
    const currentVersion = game.settings.get('animecampaign', 'systemMigrationVersion')

    if (currentVersion === game.system.version || foundry.utils.isNewerVersion(game.system.version, "v2.0")) {
        game.settings.set("animecampaign", "systemMigrationVersion", game.system.version)
        return
    }

    // If this is a brand new world, skip migration.
    const totalDocuments = game.actors.size + game.scenes.size + game.items.size
    if (!currentVersion && totalDocuments === 0) { 
        game.settings.set("animecampaign", "systemMigrationVersion", game.system.version)
        return 
    }
    
    if (foundry.utils.isNewerVersion(game.system.version, NEEDS_MIGRATION_VERSION)) {
        if (!game.user.isGM) {
            ui.notifications.warn(game.i18n.localize("AC.Migration.WarnForGM"))
            return
        }
        Migrate.toV2()
    }

    game.settings.set("animecampaign", "systemMigrationVersion", game.system.version)
})

Hooks.on('renderChatMessage', (message, html, data) => {
    const messageElement = html[0].querySelector(".JS-ChatMessage")
    if (!messageElement) return

    // Expand roll tooltip on click
    const roll = messageElement.querySelector(".JS-ExpandTooltip")
    if (roll) {
        const tooltip = messageElement.querySelector("div.dice-tooltip")

        roll.addEventListener("click", event => {
            const display = tooltip.style.display
            tooltip.style.display = (display) ? "" : "block"
        })
    }
    
    const content = messageElement.querySelector(".JS-Content")
    Description.attachSections(content)
})

Hooks.on('hotbarDrop', Macro.createMacro)


/**
 * This was an attempt at making buttons inside the prosemirror editor for marking sections as hidden.
 * No matter what, it doesn't really like to budge.
 */
Hooks.on('createProseMirrorEditor', (uuid, plugins, options) => {
    //console.log(uuid, plugins, options)

    /* // override headings to allow for toggling section visibility
    const heading = {
        attrs: {
            level: {default: 1},
            hidden: {default: false},
        },
        content: "inline*",
        group: "block",
        defining: true,
        parseDOM: [
            {tag: "h1", attrs: {level: 1}},
            {tag: "h2", attrs: {level: 2}},
            {tag: "h3", attrs: {level: 3}},
            {tag: "h4", attrs: {level: 4}},
            {tag: "h5", attrs: {level: 5}},
            {tag: "h6", attrs: {level: 6}}
        ],
        toDOM: node => [`h${node.attrs.level}`, { 
            "attr-hide": (node.attrs.hidden) ? true : false, 
            style: `opacity: ${(node.attrs.hidden) ? .75 : 1};`
        }, 0 ]
    }

    const schema = new ProseMirror.Schema({
        nodes: options.state.schema.spec.nodes.update("heading", heading),
        marks: options.state.schema.spec.marks
    })

    // override the editor state with new content
    const content = ProseMirror.dom.serializeString(options.state.doc, { schema })
    const state = ProseMirror.EditorState.create({ doc: ProseMirror.dom.parseString(content) })

    console.log(content, state) */

    /* const serializer = ProseMirror.DOMSerializer.fromSchema(schema)
    const html = serializer.serializeFragment(options.state.doc.content)
    console.log(html)

    options.state = ProseMirror.EditorState.create({
        doc: ProseMirror.DOMParser.fromSchema(schema).parse(html),
        plugins: options.state.plugins
    }) */

    /* const state = ProseMirror.EditorState.create({ schema, plugins: options.state.plugins })

    state.doc = options.state.doc
    options.state = state*/
})

Hooks.on('getProseMirrorMenuItems', (menu, items) => {
    //console.log(menu, items)

    /* menu.items = items.unshift({
        action: "toggle-visibility",
        title: "AC.ToggleVisibility",
        icon: '<i class="fa-solid fa-eye-slash"></i>',
        scope: "text",
        cmd: (state, dispatch, view) => {
            console.log(state, dispatch, view)

            // get header node
            const { $from } = state.selection
            const node = $from.parent

            if (!node || node.type.name != "heading" ) return false
            console.log(node)

            if (dispatch) {
                //console.log(state.tr.setNodeAttribute(node, "_preserve", { "style": "color:red;" }))
                //dispatch(state.tr.setNodeAttribute(state.selection.from, "_preserve", { "style": "color:red;" }))
            }

            /* if (state.selection.empty) return false
            if (dispatch) dispatch(state.tr.insertText("sexo!!").scrollIntoView())
            return true
        }
    }) */
})
