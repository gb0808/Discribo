/**
 * @description - An object that models a <part> tag in a MusicXML file.
 * @class
 */
class Part {

    /**
     * @description - Creates and instance of an object representing a part in a musical work.
     * @param {Object} src - The contents of a <part> tag in a .musicxml file. 
     */
    constructor(src) {
        this.src = src;
        this.notes = [];
        this.#scanForNotes();
    }

    /**
     * @returns {[String]} - An array of note names.
     */
    getNotes() { return this.notes; }

    /**
     * @description - Removes and returns the next note in the array.
     * @returns {String} - The note name of the "next" note in the piece.
     */
    popNote() { return this.notes.shift(); }

    /**
     * @description - Parses through a MusicXML file and finds all the notes.
     * @private
     */
    #scanForNotes() {
        const pitchs = this.src.getElementsByTagName("pitch");
        for (let i = 0; i < pitchs.length; ++i) {
            const note = pitchs[i].getElementsByTagName("step")[0].childNodes[0].nodeValue 
                + "/" + pitchs[i].getElementsByTagName("octave")[0].childNodes[0].nodeValue;
            this.notes.push(note);
        }
    }

}