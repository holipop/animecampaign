/** A namespace for migration scripts.
 * @module Migrate
 */

import * as Utils from './Utils.js'

const convert = new showdown.Converter();

/** Migration to v1.0 for anyone who used the previous version of AC FVTT
 * ! Change for v2.0.
 */
export async function toV1 () {
    ui.notifications.warn(
        "<b>Beginning v1.0 Migration.</b> Please wait a moment and do not close your came or shut down your server.",
        { permanent: true }
    );

    // Migrate World Actors
    const actors = game.actors
        .map(actor => [actor, true])
        .concat(Array
            .from(game.actors.invalidDocumentIds)
            .map(id => [game.actors.getInvalid(id), false])
        );
    for (const [actor, valid] of actors) {
        try {
            const source = (valid)
                ? actor.toObject()
                : game.data.actors.find(a => a._id == actor._id);
            const data = migrateActor(source);
            Utils.log(`Migrating Actor document "${actor.name}" [${actor._id}].`)
            await actor.update(data);
        } catch (err) {
            err.message = `Failed AC FVTT system migration for Actor ${actor.name}: ${err.message}`;
            console.error(err);
        }
    }

    // Migrate World Items
    const items = game.items
        .map(item => [item, true])
        .concat(Array
            .from(game.items.invalidDocumentIds)
            .map(id => [game.items.getInvalid(id), false])
        );
    for (const [item, valid] of items) {
        try {
            const source = (valid)
                ? item.toObject()
                : game.data.items.find(i => i._id == item._id);
            const data = migrateItem(source);
            Utils.log(`Migrating Item document "${item.name}" [${item._id}].`)
            await item.update(data);
        } catch (err) {
            err.message = `Failed AC FVTT system migration for Item ${item.name}: ${err.message}`;
            console.error(err);
        }
    }


    // Migrate Scenes
    for (const scene of game.scenes) {
        try {
            const data = migrateScene(scene);
            Utils.log(`Migrating Scene document "${scene.name}" [${scene._id}].`)
            await scene.update(data);
        } catch (err) {
            err.message = `Failed AC FVTT system migration for Scene ${scene.name}: ${err.message}`;
            console.error(err);
        }
    }

    // Migrate Compendia
    for (const pack of game.packs) {
        if ( pack.metadata.packageType !== "world" ) continue;
        if ( !["Actor", "Item", "Scene"].includes(pack.documentName) ) continue;

        // Unlock the pack for editing
        const wasLocked = pack.locked;
        await pack.configure({locked: false});

        // Begin by requesting server-side data model migration and get the migrated content
        await pack.migrate();
        const documents = await pack.getDocuments();

        // Migrate documents
        for (const doc of documents) {
            let data = {};
            const source = doc.toObject();

            try {
                switch (pack.documentName) {
                    case 'Actor':
                        data = migrateActor(source);
                        break;
                    case 'Item':
                        data = migrateItem(source);
                        break;
                    case 'Scene':
                        data = migrateScene(source);
                        break;
                }
                await doc.update(data);
            } catch (err) {
                err.message = `Failed AC FVTT system migration for document ${doc.name} in pack ${pack.collection}: ${err.message}`;
                console.error(err);
            }
        }

        await pack.configure({locked: wasLocked});
        Utils.log(`Migrated all ${pack.documentName} documents from Compendium ${pack.collection}`);
    }
    
    // After 5 seconds, prompt to reload.
    game.settings.set('animecampaign', 'systemMigrationVersion', 'v1.0')
    ui.notifications.info(
        "<b>v1.0 Migration Complete!</b> Please reload your world.",
        { permanent: true }
        );
    }


/** Migrates pre-v1.0 actors.
 * @param {*} source 
 * @returns {*}
 */
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
 */
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
    const categories = new Set(
        source.system.categories.map(category => category.name)
    );
    for (const item of source.items) {
        categories.add(item.system.category)
    }
    source.system.categories = [...categories].map(category => {
        return {
            name: category?.toLowerCase(),
        }
    });

    //console.log(source);
    return source;
}

/** Migrates pre-v1.0 items.
 * @param {*} source 
 * @returns {*}
 */
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
 */
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
 */
function migrateSection (source) {
    return {
        name: source.label,
        collapsed: false,
        visible: !source.hidden,
        richtext: source.text,
        plaintext: convert.makeMarkdown(source.text || '')
    }
}
