/**
 * @description - An object that is able to parse MusicXML files.
 * @class
 * @requires Part.js
 */
class MusicReader {

    /**
     * @description - Creates a MusicReader object that parses MusicXML files.
     * @constructor
     * @param {String} src - The contents of a .musicxml file.
     * @param {String} name - The name of the MusicReader.
     */
    constructor(src, name = "untitled") {
        this.src = src;
        this.name = name;
        this.parts = [];
        this.#scanForParts();
    }  

    /**
     * @param {Number} partNumber - The part you are trying to pull a note from. Follows one-based
     *                              indexing.
     * @returns {[String]} - an array of note names.
     */
    getNotes(partNumber = 0) { return this.parts[partNumber].getNotes(); }

    /**
     * @description - Removes and returns the next note in a part.
     * @param {Number} partNumber - The part you are trying to pull a note from. Follows one-based
     *                              indexing.
     * @returns {String} - The note name of the "next" note in the part.
     */
    popNote(partNumber = 0) { return this.parts[partNumber].popNote(); }

    /**
     * @description - Parses through a MusicXML file and finds all the parts.
     * @private
     */
    #scanForParts() {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(this.src, "text/xml");
        const parts = xmlDoc.getElementsByTagName("part");
        for (let i = 0; i < parts.length; ++i) this.parts.push(new Part(parts[i]));
    }

}