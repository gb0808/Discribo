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
        this.measures = [];
        this.#getMeasureData();
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
     * @description - Parses through a MusicXML file and collects data on all the measures.
     * @private
     */
    #getMeasureData() {
        const xmlMeasures = this.src.getElementsByTagName("measure");
        for (let i = 0; i < xmlMeasures.length; ++i) {
            let measure = [];
            const notes = xmlMeasures[i].getElementsByTagName("note");
            for (let j = 0; j < notes.length; ++j) measure.push(new Note(notes[j]));
            this.measures.push(measure);
        }
    }

}