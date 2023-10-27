const notes = new Map();

class NoteVisualiser {

    /**
     * Creates a note on the staff.
     * @param {MIDIMessage} midiMessage - MIDI data taken from the user.
     */
    static createNote(midiMessage) {
        const noteName = AudioStream.noteValues[midiMessage.getNote()];
        const note = new Note(noteName);
        note.showNote();
        notes.set(noteName, note);
    }
    /**
     * Removes a note from the staff.
     * @param {MIDIMessage} midiMessage - MIDI data taken from the user.
     */
    static removeNote(midiMessage) {
        const noteName = AudioStream.noteValues[midiMessage.getNote()];
        if (notes.has(noteName)) {
            notes.get(noteName).removeNote();
            notes.delete(noteName);
        }
    }
}