class MidiReader {

    #syntaxtree;

    constructor(arraybuffer) {
        this.#syntaxtree = new SyntaxTree(arraybuffer);
    }

    getNotes() {
        return this.#syntaxtree.getNotes();
    }
}