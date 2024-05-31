/** A namespace for operations on ArrayFields.
 * @module List 
 */


import * as Utils from './Utils.js'

/** Adds an entry to a list, optionally at a specified index.
 * @param {*[]} arr 
 * @param {*?} obj 
 * @param {Number?} index 
 * @returns {*[]}
 */
export function add (arr, obj = {}, index = null) {
    if (index == null) index = arr.length;

    return arr.toSpliced(index, 0, obj);
}

/** Removes an entry from a list given a query.
 * @param {*[]} arr 
 * @param {Number|*} query 
 * @returns {*[]}
 */
export function remove (arr, query) {
    const index = (typeof query === 'number')
        ? query
        : arr.findIndex(entry => {
            const filteredEntry = filterObject(entry, query);
            return objectsEqual(filteredEntry, query);
        });

    if (arr[index] === undefined) return arr;
    return arr.toSpliced(index, 1);
}

/** Gets the first entry that matches a query in a list. Returns as a plain object.
 * @param {*[]} arr 
 * @param {Number|*} query 
 * @returns {*}
 */
export function get (arr, query) {
    const obj = (typeof query === 'number')
        ? arr[query]
        : arr.find(entry => {
            const filteredEntry = filterObject(entry, query);
            return objectsEqual(filteredEntry, query);
        });

    if (obj === undefined) return;
    return Utils.plainObject(obj);
}

/** Change an entry of a list, returning an updated clone of the array with the changed entry becoming a plain object.
 * @param {*[]} arr 
 * @param {Number|*} query 
 * @param {*} changes 
 * @returns {*[]}
 */
export function set (arr, query, changes) {
    const index = (typeof query === 'number')
        ? query
        : arr.findIndex(entry => {
            const filteredEntry = filterObject(entry, query);
            return objectsEqual(filteredEntry, query);
        });

    if (arr[index] === undefined) return arr;

    const update = [...arr]
    update[index] = Utils.plainObject(foundry.utils.mergeObject(update[index], changes));
    return update;
}

/** Check if a list contains an entry that matches the query.
 * @param {*[]} arr 
 * @param {Number|*} query 
 * @returns {Boolean}
 */
export function has (arr, query) {
    const index = (typeof query === 'number')
        ? query
        : arr.findIndex(entry => {
            const filteredEntry = filterObject(entry, query);
            return objectsEqual(filteredEntry, query);
        });

    return (arr[index] !== undefined);
}

/** Returns the index of the first entry that matches the query.
 * @param {*[]} arr 
 * @param {*} query 
 * @returns {Number}
 */
export function index (arr, query) {
    return arr.findIndex(entry => {
        const filteredEntry = filterObject(entry, query);
        return objectsEqual(filteredEntry, query);
    });
}

/** A shorthand for converting a list into an object with indexed keys and plain values.
 * @param {*[]} arr 
 * @returns {*}
 */
export function toObject (arr) {
    const list = arr.map(entry => Utils.plainObject(entry));
    return Object.fromEntries(list.entries()); 
}