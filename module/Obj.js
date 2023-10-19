// A utility namespace for Object functions.

/** Assigns each property a string of its own dot notation.
 * @param {object} obj
 * @returns {object}
 */
export function facade (obj) {
    let paths = Object.keys(flattenObject(obj));
    paths.forEach(element => {
        setProperty(obj, element, element);
    });
    return obj;
}

/** Create an object where all of the properties have identical values.
 * @param {string[]} keyArr The names of each property.
 * @param {*} value The value for each property.
 * @returns {Object}
 */
export function uniform (keyArr, value) {
    const obj = {};
    keyArr.forEach(element => {
        obj[element] = value;
    });
    return obj;
}

/** Gets the first entry that matches a query in an array of objects. Returns as a plain object.
 * @param {Object[]} arr 
 * @param {Object} query 
 * @returns {Object}
 */
export function getEntry (arr, query) {
    const obj = arr.find(entry => {
        const filteredEntry = filterObject(entry, query);

        return objectsEqual(filteredEntry, query);
    })

    if (obj === undefined) return;
    return plain(obj);
}

/** Change an entry of an array of objects, returning an updated clone of the array with the changed entry becoming a plain object.
 * @param {Object[]} arr 
 * @param {Object} query 
 * @param {Object} changes 
 * @returns {Object[]}
 */
export function setEntry (arr, query, changes) {
    const index = arr.findIndex(entry => {
        const filteredEntry = filterObject(entry, query);

        return objectsEqual(filteredEntry, query);
    })
    const entry = deepClone(arr[index]);
    const obj = mergeObject(entry, changes);

    return arr.toSpliced(index, 1, plain(obj));
}

/** Check if an array of objects contains an entry that matches the query.
 * @param {Object[]} arr 
 * @param {Object} query 
 * @return {boolean}
 */
export function hasEntry (arr, query) {
    const index = arr.findIndex(entry => {
        const filteredEntry = filterObject(entry, query);

        return objectsEqual(filteredEntry, query);
    })

    return (index !== -1);
}

/** Converts a instance of a class into a plain object.
 * @param {Object} instance 
 * @returns {Object}
 */
export function plain (instance) {
    const copy = { ...instance };
    for (const [key, value] of Object.entries(copy)) {
        if (value === null) { }
        else if (Array.isArray(value)) { }
        else if (typeof value === 'object') {
            copy[key] = plain(value);
        }
    }
    return copy;
}