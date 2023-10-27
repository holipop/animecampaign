/** A namespace for chat messages.
 * @module Roll
 */


export function listeners (message, html, data) {

    void function test () {
        const thing = html.find('[data-thing]')

        console.log(thing);

        thing.on('press', event => {
            console.log({ message, html, data })
        })
    }()

}