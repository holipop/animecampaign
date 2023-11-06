// !!! Firefox doesn't support 'assert'.
// !!! Remove the facadeObject.
//import lang from "../lang/en.json" assert { type: 'json' };

import * as AC from "./AC.js";

// An object containing language localization paths and default configurations.
export const animecampaign = langBandaid().animecampaign;

animecampaign.ascii = `                                                                                    
      ██       ▄▄█▀▀▀█▄█  ▀██▀▀▀▀█ ▀██▀  ▀█▀ █▀▀██▀▀█ █▀▀██▀▀█ 
     ▄██▄    ▄██▀     ▀█   ██  ▄    ▀█▄  ▄▀     ██       ██       
    ▄█▀██▄   ██▀       ▀   ██▀▀█     ██  █      ██       ██    
   ▄█  ▀██   ██            ██         ███       ██       ██    
   ████████  ██▄          ▄██▄         █       ▄██▄     ▄██▄   
  █▀      ██ ▀██▄     ▄▀ 
▄███▄   ▄████▄ ▀▀█████▀   v1.0.0`

animecampaign.colorKeys = ['red', 'blue', 'yellow', 'green', 'orange', 'cyan', 'purple', 'grey'];
animecampaign.colors = {
    red: '#df2d48',
    blue: '#4d86d1',
    yellow: '#f1cd00',
    green: '#3ea35a',
    orange: '#ee8420',
    cyan: '#28d5c1',
    purple: '#9639cf',
    grey: '#807f84',
};
animecampaign.defaultColor = "#cccccc";

animecampaign.defaultCategories = [
    {
        name: 'weapon',
        trackers: [
            { tag: 'damage', img: "icons/svg/sword.svg" },
            { tag: 'range' , img: "icons/svg/thrust.svg" },
        ],
    },
    {
        name: 'talent',
        trackers: [
            { tag: 'bonus', img: "icons/svg/heal.svg" },
        ],
    },
    {
        name: 'passive',
        trackers: [],
    },
    {
        name: 'ability',
        trackers: [
            { tag: 'cost', img: "icons/svg/degen.svg" },
        ],
    }
];

animecampaign.textDialog = (name, placeholder) => `
    <form autocomplete="off">
        <div class="form-group">
            <label>${name}</label>
            <div class="form-fields">
                <input type="text" name="name" placeholder="${placeholder}" autofocus>
            </div>
        </div>
    </form>`;

animecampaign.colorDialog = hexcode => `
    <form autocomplete="off">
        <div class="form-group">
            <label>Color</label>
            <div class="form-fields">
                <input type="color" name="color" value="${hexcode}">
            </div>
        </div>
    </form>`;

    
/**
 * ! Hamfisted code, refactor localization in a later step.
 */
function langBandaid () {
    const json = {
        "animecampaign": {
            "test": "Testing Testing One Two Three!",
            "type": {
                "inscribed": {
                    "epithet": "Epithet"
                },
                "mundie": {
                    "expert": "Expert",
                    "powerhouse": "Powerhouse"
                }
            },
            "powerset": {
                "inscribed": "Inscribed",
                "mundie": "Mundie"
            },
            "mainStat": {
                "stamina": "Stamina",
                "proficiency": "Proficiency",
                "movement": "Movement"
            },
            "colorStat": {
                "red": "Red",
                "blue": "Blue",
                "yellow": "Yellow",
                "green": "Green",
                "orange": "Orange",
                "cyan": "Cyan",
                "purple": "Purple",
                "grey": "Grey"
            },
            "category": {
                "weapon": "Weapon",
                "talent": "Talent",
                "passive": "Passive",
                "ability": "Ability"
            },
            "action": {
                "na": "N/A",
                "standard": {
                    "main": "Main",
                    "move": "Move",
                    "anytime": "Anytime",
                    "bonus": "Bonus",
                    "free": "Free"
                },
                "other": {
                    "swift": "Swift"
                }
            },
            "actionType": {
                "standard": "Standard",
                "other": "Other"
            },
            "nav": {
                "biography": "Biography",
                "kit": "Kit",
                "description": "Description",
                "details": "Details"
            },
            "dialog": {
                "create": "Create New Category: {name}",
                "recolor": "Recolor Category [{category}]: {name}",
                "rename": "Rename Category [{category}]: {name}",
                "track": "Track Stat [{category}]: {name}",
                "deleteCategory": "Delete Category [{category}]: {name}",
                "deleteFeature": "Delete Feature [{id}]: {name}",
                "resetColor": "Reset Color"
            },
            "app": {
                "editColor": "Edit Color",
                "roll": "Roll",
                "stats": "Stats",
                "name": "Name",
                "colorStats": "Color Stats",
                "collapseStats": "Collapse Stats",
                "view": "View",
                "addStat": "Add Stat",
                "collapseCategory": "Collapse Category",
                "renameCategory": "Rename Category",
                "colorCategory": "Color Category",
                "floodCategory": "Flood Category",
                "trackStat": "Track Stat",
                "statName": "Stat Name",
                "untrackStat": "Untrack Stat",
                "setStatImage": "Set Stat Image",
                "createCategory": "Create Category",
                "newCategory": "New Category",
                "deleteCategory": "Delete Category",
                "createFeature": "Create Feature",
                "rollFeature": "Roll Feature",
                "expandFeature": "Expand Feature",
                "viewFeature": "View Feature",
                "deleteFeature": "Delete Feature",
                "addSection": "Add Section",
                "collapseSection": "Collapse Section",
                "dragSection": "Drag Section",
                "deleteSection": "Delete Section",
                "toggleSectionVisibility": "Toggle Section Visibility",
                "textEditor": "Text Editor"
            },
            "placeholder": {
                "na": "N/A",
                "value": "Value",
                "max": "Max",
                "spaces": "Spaces",
                "build": "Build",
                "label": "Label",
                "text": "Text",
                "tag": "Tag",
                "word": "Epithet/Core Word",
                "class": "Class",
                "name": "Name",
                "category": "Category"
            },
            "details": {
                "textEditor": "Text Editor",
                "textEditorNote": "Markdown is using plaintext for simple styling. ProseMirror is a rich text editor, \"what you see is what you get\".",
                "rollFormula": "Roll Formula",
                "action": "Action",
                "usage": "Usage",
                "per": "per",
                "usageNote": "i.e. \"1 time per Combat\"."
            },
            "editor": {
                "markdown": "Markdown",
                "prosemirror": "ProseMirror"
            },
            "settings": {
                "defaultTextEditor": "Default Text Editor",
                "defaultTextEditorHint": "Configure which text editor is set on-creation for your actors and items.",
                "diagonalMovement": "Diagonal Movement Rule",
                "diagonalMovementHint": "Configure which diagonal movement rule should be used for games within this system.",
                "diagonalMovement555": "PHB: Equidistant (5/5/5)",
                "diagonalMovement5105": "DMG: Alternating (5/10/5)",
                "diagonalMovementEuclidean": "Euclidean (7.07 ft. Diagonal)"
            }
        }
    }

    return AC.facadeObject(json);
}
