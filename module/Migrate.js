import ACActor from "./documents/ACActor.js"
import ACItem from "./documents/ACItem.js"

/**
 * Fancy printing for clarity.
 * @param {string} message 
 */
function aclog (message) {
    console.log(`%c${message}`, 'color: #db7093;')
}

/**
 * Migrates a v1 Actor.
 * @param {Partial<ACActor>} source 
 */
function migrateActor (source) {
    // Migrate description
    if (source.system) {
        source.system.description = source?.system?.biography?.richtext
        source.system.stats = source?.system?._stats
    }

    for (let item of source?.items) {
        item.parentImage = source?.img
        item = migrateItem(item)
    }

    console.log(source)
    return source
}

/**
 * Migrates a v1 Item.
 * @param {Partial<ACItem>} source 
 */
function migrateItem (source) {
    if (source.system) {
        let description = ""
        for (const section of source.system.sections) {
            description += `<h1>${(section.visible) ? "" : "<"}${section.name}</h1>${section.richtext}`
        }
        source.system.description = description

        if (source.system.details.action == "[object Object]") {
            source.system.details.action = ""
        }
    }

    if (source.img == "icons/svg/item-bag.svg" || source.img == source?.parentImage) {
        source.img = null
    }

    console.log(source)
    return source
}

/**
 * Migrates a scene.
 * @param {Scene} source 
 */
function migrateScene (source) {
    const tokens = source.tokens.map(token => {
        const t = token instanceof foundry.abstract.DataModel 
            ? token.toObject() 
            : token

        if (!game.actors.has(t.actorId)) t.actorId = null
        if (!t.actorId || t.actorLink) t.actorData = {}
        else if (!t.actorLink) {
            const actor = token.delta?.toObject() ?? foundry.utils.deepClone(t.actorData)
            const update = migrateActor(actor)
            t.delta = update
        }
        
        return t
    })

    return { tokens }
}

export async function toV2 () {
    ui.notifications.warn(
        game.i18n.localize("AC.Migration.V2MigrationBegin"),
        { permanent: true }
    )
    
    // Migrate World Actors
    const actors = game.actors
        .map(actor => [actor, true])
        .concat(Array
            .from(game.actors.invalidDocumentIds)
            .map(id => [game.actors.getInvalid(id), false])
        )
    
    for (const [actor, valid] of actors) {
        try {
            const source = (valid)
                ? actor.toObject()
                : game.data.actors.find(a => a._id == actor._id)
            const data = migrateActor(source)

            aclog(game.i18n.format("AC.Migration.MigratingDocument", {
                document: 'Actor',
                name: actor.name,
                id: actor._id,
            }), 'color: tomato;')

            await actor.update(data)
        } catch (err) {
            err.message = game.i18n.format("AC.Migration.FailedMigration", {
                document: 'Actor',
                name: actor.name,
                id: actor._id,
                error: err.message
            })
            console.error(err)
        }
    }

    // Migrate World Items
    const items = game.items
        .map(item => [item, true])
        .concat(Array
            .from(game.items.invalidDocumentIds)
            .map(id => [game.items.getInvalid(id), false])
        )

    for (const [item, valid] of items) {
        try {
            const source = (valid)
                ? item.toObject()
                : game.data.items.find(i => i._id == item._id)
            const data = migrateItem(source)

            aclog(game.i18n.format("AC.Migration.MigratingDocument", {
                document: 'Item',
                name: item.name,
                id: item._id,
            }), 'color: tomato;')

            await item.update(data)
        } catch (err) {
            err.message = game.i18n.format("AC.Migration.FailedMigration", {
                document: 'Item',
                name: item.name,
                id: item._id,
                error: err.message
            })
            console.error(err)
        }
    }

    // Migrate Scenes
    for (const scene of game.scenes) {
        try {
            const data = migrateScene(scene);

            aclog(game.i18n.format("AC.Migration.MigratingDocument", {
                document: 'Scene',
                name: scene.name,
                id: scene._id,
            }), 'color: tomato;')
            
            await scene.update(data);
        } catch (err) {
            err.message = game.i18n.format("AC.Migration.FailedMigration", {
                document: 'Scene',
                name: scene.name,
                id: scene._id,
                error: err.message
            })

            console.error(err);
        }
    }

    // Migrate Compendia
    for (const pack of game.packs) {
        if ( pack.metadata.packageType !== "world" ) continue
        if ( !["Actor", "Item", "Scene"].includes(pack.documentName) ) continue

        // Unlock the pack for editing
        const wasLocked = pack.locked
        await pack.configure({locked: false})

        // Begin by requesting server-side data model migration and get the migrated content
        await pack.migrate()
        const documents = await pack.getDocuments()

        // Migrate documents
        for (const doc of documents) {
            let data = {}
            const source = doc.toObject()

            try {
                switch (pack.documentName) {
                    case 'Actor':
                        data = migrateActor(source)
                        break
                    case 'Item':
                        data = migrateItem(source)
                        break
                    case 'Scene':
                        data = migrateScene(source)
                        break
                }
                await doc.update(data)
            } catch (err) {
                err.message = game.i18n.format("AC.Migration.FailedMigrationInPack", {
                    document: pack.documentName,
                    name: doc.name,
                    id: doc._id,
                    error: err.message,
                    pack: pack.collection
                })
                console.error(err)
            }
        }

        await pack.configure({locked: wasLocked})
        Utils.log(game.i18n.format("AC.Migration.MigratingPack", {
            document: pack.documentName,
            pack: pack.collection
        }))
    }

    // Prompt to reload.
    game.settings.set('animecampaign', 'systemMigrationVersion', "v2.0")
    ui.notifications.info(
        game.i18n.localize("AC.Migration.V2MigrationComplete"),
        { permanent: true }
    )
}





/*

/** Migrates pre-v1.0 actors.
 * @param {*} source 
 * @returns {*}
function migrateScene (source) {
    const tokens = source.tokens.map(token => {
        const t = token instanceof foundry.abstract.DataModel 
            ? token.toObject() 
            : token;

        if (!game.actors.has(t.actorId)) t.actorId = null;
        if (!t.actorId || t.actorLink) t.actorData = {};
        else if (!t.actorLink) {
            const actor = token.delta?.toObject() ?? foundry.utils.deepClone(t.actorData);
            const update = migrateActor(actor);
            t.delta = update;
        }
        
        return t;
    })

    return { tokens };
}

/** Migrates pre-v1.0 actors.
 * @param {*} source 
 * @returns {*}
function migrateActor (source) {
    // Migrate Stats
    if (source.system.stats && source.system.stats.length > 0) {
        source.system._stats = {}
        const colors = [...CONFIG.AC.colorKeys];

        for (const stat of source.system.stats) {
            if (['stamina', 'proficiency', 'movement'].includes(stat.name)) {
                source.system[stat.name] = migrateStat(stat);
            } else if (colors.length > 0) {
                const color = colors.shift();
                source.system._stats[color] = migrateStat(stat, color);
            }
        }
        source.system.stats = [{}];
    }

    // Migrate Biography
    if (source.system.description) {
        source.system.biography = {
            editor: 'markdown',
            richtext: source.system.description,
            plaintext: convert.makeMarkdown(source.system.description)
        }
    }

    // Migrate Items
    source.items = (source.items || []).map(item => migrateItem(item));

    // Migrate Categories
    const categories = (source.system.categories) 
        ? new Set(source.system.categories.map(category => category.name))
        : new Set()
    
    for (const item of source.items) {
        categories.add(item.system.category)
    }
    source.system.categories = [...categories].map(category => {
        const name = category?.toLowerCase();
        const trackers = List.get(CONFIG.AC.defaultCategories, { name })?.trackers ?? []
        return { name, trackers }
    });

    //console.log(source);
    return source;
}

/** Migrates pre-v1.0 items.
 * @param {*} source 
 * @returns {*}
function migrateItem (source) {
    source.type = 'Feature';

    source.system = {
        stats: (source.system.stats || []).map(s => migrateStat(s)),
        sections: (source.system.sections || []).map(s => migrateSection(s)),

        category: (source.system.type == 'custom')
            ? source.system.customType.toLowerCase()
            : source.system.type.toLowerCase()
    }

    source.system.details = {
        editor: 'markdown',
        formula: source.system.formula,
        action: {
            name: source.system.action,
        }
    }

    //console.log(source);
    return source;
}

/** Migrates pre-v1.0 stats.
 * @param {*} source 
 * @param {String?} color 
 * @returns {*}
function migrateStat (source, color = '') {
    const stat = {
        color,
        tag: source.name,
        value: Number(source.value) || 0,
        max: Number(source.max) || 0,
    }

    switch (source.settings.display) {
        case 'single':
            if (isNaN(Number(source.value))) {
                stat.view = 'label';
                stat.label = source.value;
            } else {
                stat.view = 'value';
            }
            break;
        case 'double':
            stat.view = 'resource';
            break;
    }

    return stat;
}

/** Migrates pre-v1.0 sections.
 * @param {*} source 
 * @returns {*}
function migrateSection (source) {
    return {
        name: source.label,
        collapsed: false,
        visible: !source.hidden,
        richtext: source.text,
        plaintext: convert.makeMarkdown(source.text || '')
    }
}
*/