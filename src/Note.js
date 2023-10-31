class Note {

    /**
     * @description - Creates and instance of an object representing a note in a musical work.
     * @param {Object} src - The contents of a <note> tag in a .musicxml file. 
     */
    constructor(src) {
        this.src = src;
        this.pitch = this.#getPitch();
    }

    /**
     * @description - Parses through a <pitch> tag and formats the contents.
     * @return {String} - A string representation of the note.
     */
    #getPitch() {
        if (this.src.getElementsByTagName("rest").length > 0) return "Rest";
        const step = this.src.getElementsByTagName("step")[0].childNodes[0].nodeValue;
        const octave = this.src.getElementsByTagName("octave")[0].childNodes[0].nodeValue;
        return step + "/" + octave;
    }

}