import lang from "../lang/en.json" assert { type: 'json' };
import { facadeObject } from "./AC.js";

// An object containing language localization paths.
export const animecampaign = facadeObject(lang).animecampaign;

animecampaign.colors = ['red', 'blue', 'yellow', 'green', 'orange', 'cyan', 'purple', 'grey'];
animecampaign.defaultCategories = ['weapon', 'talent', 'passive', 'ability'];
animecampaign.defaultColor = "#CCCCCC";

animecampaign.createCategoryDialogContent = `
    <form autocomplete="off">
        <div class="form-group">
            <label>Name</label>
            <div class="form-fields">
                <input type="text" name="name" placeholder="New Category" autofocus>
            </div>
        </div>
    </form>
`;
