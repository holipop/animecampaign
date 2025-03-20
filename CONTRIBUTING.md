# So, you wanna develop for ACFVTT?
With the release of 2.1, I'm opening up contributions and collaborators to off-load a lot of the responsibility I feel with being the sole developer. I still wanna have a hand in this, so I'm creating this contributions guide/style guide to make sure things still stay consistent with the code I've written.


## Setup

This project uses TypeScript for annotating and Less for preprocessing CSS alongside the EasyLess VSCode extension\*. To set up your project:
- Fork this repository.
- Clone the repo into your `systems` folder.
- If you have npm, run `npm install` to install dependencies.

> If you're not using VSCode, feel free to implement your own build tools to compile .less files.


## Git

All contributions should be done via Pull Request (PR) on the `dev-2` branch. Highly recommend that all your work is done in its own branch that's eventually merged into `dev-2`. `main` is only touched for releases.


## Style

I'm too lazy to use a linter, so I only encourage all code contributions follow these consistencies:
- Indent with 4 spaces.
- If you need to seperate sections of large files, comment with 4 hyphens on each side and a gap between the label: `---- Section ----`.
- Keep your code readable, if you're writing something that is hard to understand just through code: comment the reason *why* you're doing something and not *what*.
- All file names use kebab-case except in `modules` where class and namespace files use PascalCase.

### JavaScript

This project uses JSDoc and TypeScript Declaration Files for type annotations.
- One class per file.
- Annotate the class and all class properties with JSDoc.
- Name your classes in PascalCase, every other variable should be camelCase (though feel free to name constants with capitalized SNAKE_CASE).
- System-specific extensions of core Foundry API should start with `AC` (e.g. `ACActor`, `ACDialogV2`)
- If you need to declare a small type, use the directory's `_types.d.ts` file.
- Prefer `const` over `let`. This is more of a soft recommendation, I personally find it makes it lot easier to keep track of code.

### Handlebars (HTML)

- Weird but classes are written in PascalCase.
- Any element that you plan on styling should have a class.
- If you want to hook up JS to an element, use a class with the prefix `JS-`.
- Classes should be the first attribute in a tag, data attributes should be last.

### Less (CSS)

- This project uses a remix of the [BEM](https://getbem.com/) methodology for writing HTML/CSS. The only difference is that I write my classes with PascalCase. (e.g. StatEntry__Input--Numerator)
- Namespace your CSS, always make sure it's nested in an `.animecampaign` block.
- Use `rem` units, avoid `px`.
- Make use of the `ColorScheme` mixin.
- Have a gap between the mixins, layout, and visuals of an element's properties.
```less
.animecampaign {
    .SomeClass {
        #ColorScheme({ color: "txt" }); // mixins
        #InputSkinning();

        height: 10rem;  // layout
        width: 15rem;

        background: @stam-main-color;   // visuals
        opacity: 1;
        transition: opacity .75s;
    }
}
```


## Localization

Foundry requires released game systems and modules to be made with localization in mind. Whenever you have a piece of text that the user will see, **don't keep it hard-coded**! In `.hbs` files, use the `{{localize}}` helper. In `.js` files, use `game.i18n.localize()` or `game.i18n.format()`. The first argument to all of these functions should be a string that points to a key in `lang/en.json`.

Language files are generally structured by template (e.g. `"AC.CharacterSheet.EditColor"`).


## Issues

For any bug or feature request, please use the Issues page. Make sure it isn't a duplicate issue and, if it's a bug, make sure it's reproducable. You don't have to use tags or assign anyone, a title and small description is fine.
