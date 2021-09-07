/**
 * Helper module to generate uuid's
 *
 * @module lib/uuid
 */

/**
 * Generates a uuid version 4
 *
 * @return {String}
 *
 * @see https://www.tutorialspoint.com/how-to-create-guid-uuid-in-javascript
 */
export function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
   });
}
