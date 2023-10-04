import lang from "../lang/en.json" assert { type: 'json' };
import * as AC from "./AC.js";

// An object containing language localization paths and default configurations.
export const animecampaign = AC.facadeObject(lang).animecampaign;

animecampaign.colors = ['red', 'blue', 'yellow', 'green', 'orange', 'cyan', 'purple', 'grey'];
animecampaign.defaultCategories = ['weapon', 'talent', 'passive', 'ability'];
animecampaign.defaultColor = "#CCCCCC";

animecampaign.createCategoryDialogContent = `
    <form autocomplete="off">
        <div class="form-group">
            <label>${animecampaign.app.name}</label>
            <div class="form-fields">
                <input type="text" name="name" placeholder=${animecampaign.app.newCategory}" autofocus>
            </div>
        </div>
    </form>
`;
