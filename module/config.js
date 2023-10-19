import lang from "../lang/en.json" assert { type: 'json' };
import * as Obj from "./Obj.js";

// An object containing language localization paths and default configurations.
export const animecampaign = Obj.facade(lang).animecampaign;

animecampaign.colors = ['red', 'blue', 'yellow', 'green', 'orange', 'cyan', 'purple', 'grey'];
animecampaign.defaultColor = "#CCCCCC";

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
    </form>
`;

animecampaign.colorDialog = hexcode => `
    <form autocomplete="off">
        <div class="form-group">
            <label>Color</label>
            <div class="form-fields">
                <input type="color" name="color" value="${hexcode}">
            </div>
        </div>
    </form>
`;