// A mixin for shared methods between sheets.
export const SheetMixin = {

    /** Submits the form for textareas whenever the enter key is pressed.
     * @param {*} html 
     */
    submitOnEnter (html) {
        const enter = html.find('[data-enter]');

        enter.each((index, element) => {
            $(element).on('keypress', event => {
                if (event.code == 'Enter') {
                    event.preventDefault();
                    this.submit();
                }
            });
        });
    },

    /** Resizes the font of the name such that any length fits cleanly.
     * @param {*} html 
     */
    resizeName (html) {
        const SCALE_DELTA = .05;
        const PX_PER_REM = 16;

        const name = html.find("[data-name]");
        const initialRem = parseInt(name.css('font-size')) / PX_PER_REM;
        const maxPxHeight = parseInt(name.css('height'));

        const scale = () => {
            const element = name[0];

            element.style.height = 0;
            element.style.height = element.scrollHeight + "px";
            
            element.style.fontSize = `${initialRem}rem`;
    
            for (let i = 1; i > 0; i -= SCALE_DELTA) {
                element.style.fontSize = `${initialRem * i}rem`;

                if (element.scrollHeight <= maxPxHeight) break;
            }
        }

        const resizeObserver = new ResizeObserver(scale);

        resizeObserver.observe(name[0]);
        resizeObserver.observe(html[0]);

        html.ready(scale);
        name.on('input', scale);
    },
    
    /** Resizes the height of a textarea dynamically as you type more.
     * @param {*} html 
     */
    resizeTextArea (html) {
        const resize = html.find('textarea[data-resize]');

        resize.each(function() {
            this.setAttribute("style", `height:${this.scrollHeight}px;overflow-y:hidden;`);
        });

        resize.on("input", function() {
            this.style.height = 0;
            this.style.height = this.scrollHeight + "px";
        });
    },
}
