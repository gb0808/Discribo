/**
 * @description - Creates a MusicReader object that parses MusicXML files.
 * @constructor
 * @param {String} src - The contents of a .musicxml file.
 * @param {String} name - The name of the MusicReader.
 */
function MusicReader(src, name = "untitled") {
    this.src = src;
    this.name = name;
    this.parts = [];
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(this.src, "text/xml");
    const parts = xmlDoc.getElementsByTagName("part");
    const scoreParts = xmlDoc.getElementsByTagName("part-name");
    for (let i = 0; i < parts.length; ++i) {
        this.parts.push(new Part(parts[i], scoreParts[i].textContent));
    }
}