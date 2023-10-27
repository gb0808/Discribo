const fileUpload = document.getElementById('music-file');
fileUpload.addEventListener("change", (event) => {
    const fileList = event.target.files;
    const file = fileList[0];

    const reader = new FileReader();
    reader.onload = () => {
        const music = new MusicReader(reader.result);
        let offset = 0;
        while (music.getNotes().length > 0) {
            const note = new Note(music.popNote());
            const noteName = note.getNoteName();
            setTimeout(async () => { 
                const message = new MIDIMessage(144, AudioStream.noteValues.indexOf(noteName), 60);
                AudioStream.startSound(message);
                note.showNote(); 
            }, 1000 * offset++);
            setTimeout(async () => {
                const message = new MIDIMessage(128, AudioStream.noteValues.indexOf(noteName), 60);
                AudioStream.stopSound(message);
                note.removeNote();
            }, 1000 * offset++ + 500);
        }
    };

    reader.readAsText(file);
});