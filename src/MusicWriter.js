/**
 * @description - Takes data from a MusicReader and creates a NetsBlox project 
 * @class
 * @requires MusicReader.js
 */
class MusicWriter{

    /**
     * @description - Creates a MusicWriter object with the data from a MusicReader.
     * @constructor
     * @param {MusicReader} musicReader - The contents of a MusicReader.
     */
    constructor(musicReader) {
        this.mMusicReader = musicReader;
        this.myRoot = new Document();
        this.#createFileTemplate();
    }

    /**
     * @description - Creates a .xml file to pass back to the user.
     * @returns {Blob} - A Blob holding the contents of the .xml file.
     */
    getFile() {
        const xmlString = new XMLSerializer().serializeToString(this.myRoot.documentElement);
        return new Blob([xmlString], { type: "text/xml" });
    }

    /**
     * @description - Sets up a default NetsBlox .xml file.
     */
    #createFileTemplate() {
        for (let i = 0; i < this.mMusicReader.parts.length; ++i) {
            const script = this.#createScript(this.mMusicReader.parts[i]);
            this.myRoot.appendChild(script);
        }
    }

    /**
     * @description - A helper function to create the <script> tag in the document.
     * @param {Part} part - An object that models a <part> tag in a MusicXML file.
     * @returns {Object} - The <script> tag.
     */
    #createScript(part) {
        const script = this.myRoot.createElement("script");
        for (let i = 0; i < part.measures.length; ++i) {
            for (let j = 0; j < part.measures[i].length; ++j) {
                const block = this.#createBlock(part.measures[i][j]);
                script.appendChild(block);
            }
        }
        return script;
    }

    /**
     * @description - A helper function to create the <block> tag in the document.
     * @param {Note} note - An object that models a <note> tag in a MusicXML file.
     * @returns {Object} - The <block> tag.
     */
    #createBlock(note) {
        const block = this.myRoot.createElement("block");
        block.setAttribute("s", "playNote");

        const noteLengthTag = this.myRoot.createElement("l");
        const noteLengthText = this.myRoot.createTextNode(note.type);
        noteLengthTag.appendChild(noteLengthText);

        const noteNameTag = this.myRoot.createElement("l");
        const noteNameText = this.myRoot.createTextNode(note.pitch);
        noteNameTag.appendChild(noteNameText);

        block.appendChild(noteLengthTag);
        block.appendChild(noteNameTag);
        return block;
    }
}