/** A namespace for operations on ArrayFields.
 * @module List 
 */


import * as AC from './AC.js'

/** Adds an entry to a list, optionally at a specified index.
 * @param {Object[]} arr 
 * @param {Object?} obj 
 * @param {Number?} index 
 * @returns {Object[]}
 */
export function add (arr, obj = {}, index = null) {
    if (index == null) index = arr.length;

    return arr.toSpliced(index, 0, obj);
}

/** Removes an entry from a list given a query.
 * @param {Object[]} arr 
 * @param {Number|Object} query 
 * @returns {Object[]}
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
 * @param {Object[]} arr 
 * @param {Number|Object} query 
 * @returns {Object}
 */
export function get (arr, query) {
    const obj = (typeof query === 'number')
        ? arr[query]
        : arr.find(entry => {
            const filteredEntry = filterObject(entry, query);
            return objectsEqual(filteredEntry, query);
        });

    if (obj === undefined) return;
    return AC.plainObject(obj);
}

/** Change an entry of a list, returning an updated clone of the array with the changed entry becoming a plain object.
 * @param {Object[]} arr 
 * @param {Number|Object} query 
 * @param {Object} changes 
 * @returns {Object[]}
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
    update[index] = AC.plainObject(mergeObject(update[index], changes));
    return update;
}

/** Check if a list contains an entry that matches the query.
 * @param {Object[]} arr 
 * @param {Number|Object} query 
 * @returns 
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
 * @param {*} arr 
 * @param {*} query 
 * @returns 
 */
export function index (arr, query) {
    return arr.findIndex(entry => {
        const filteredEntry = filterObject(entry, query);
        return objectsEqual(filteredEntry, query);
    });
}
