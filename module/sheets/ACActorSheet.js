import { ACSheetMixin } from "../mixins.js";

//
//  Defining the schema for Actor Sheets.
//
export default class ACActorSheet extends ActorSheet {
    
    //  Sets the default options for the ActorSheet.
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 520,
            height: 500,
            classes: ["animecampaign", "sheet", "actor"]
        });
    }

    //  Retrieves the Handlebars filepath to load depending on the type of Actor.
    get template() {
        return `systems/animecampaign/templates/sheets/${this.actor.type}-sheet.hbs`;
    }

    //  Returns an object for Handlebars usage.
    async getData() {
        const data = super.getData()
        
        data.config = CONFIG.animecampaign; //  Localization paths
        data.system = data.actor.system;    //  Actor schema that we defined

        return data;
    }

    //  This is where we put any custom event listeners for our sheets.
    activateListeners(html) {

        this.updateName(html, 3, 60);

        // Update Class
        const CLASS = html.find('.class');
        CLASS.on('blur', e => this.actor.update({ 'system.class':  CLASS.text() }));
        CLASS[0].addEventListener('paste', e => e.preventDefault());

        // Create Navigation Tabs
        const tabs = new Tabs({
            navSelector: ".tabs", 
            contentSelector: ".content", 
            initial: "kit", 
            callback: () => {}
        });
        tabs.bind(html[0]);

        this.updateBackground(html, 0.5);

        super.activateListeners(html);
    }
}

//  Composites mixins with this class
Object.assign(ACActorSheet.prototype, ACSheetMixin);