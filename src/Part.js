/**
 * @description - Creates and instance of an object representing a part in a musical work.
 * @param {Element} src - The contents of a <part> tag in a .musicxml file. 
 * @param {String} name - The name of the part.
 */
function Part(src, name="untitled") {
    this.src = src;
    this.notes = [];
    this.name = name;
    const xmlMeasures = this.src.getElementsByTagName("measure");
    for (let i = 0; i < xmlMeasures.length; ++i) {
        const xmlNotes = xmlMeasures[i].getElementsByTagName("note");
        for (let j = 0; j < xmlNotes.length; ++j) this.notes.push(new Note(xmlNotes[j]));
    }
}