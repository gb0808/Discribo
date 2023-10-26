const fileUpload = document.getElementById('music-file');
fileUpload.addEventListener("change", (event) => {
    const fileList = event.target.files;
    const file = fileList[0];

    let reader = new FileReader();
    reader.onload = () => {
        const music = new MusicReader(reader.result);
        console.log(music.getNotes());
    };

    reader.readAsText(file);
});


/**
 * Parses through a MusicXML file and finds all the notes.
 * 
 * @param {String} src - a string holding the contents of a .musicxml file
 * @returns an array holding all the notes.
 */
function getNotes(src) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(src, 'text/xml');
    const parts = xmlDoc.getElementsByTagName('part');
    let notes = [];

    for (let i = 0; i < parts.length; ++i) {
        const pitchs = parts[i].getElementsByTagName("pitch");
        let temp = [];
        for (let i = 0; i < pitchs.length; ++i) {
            const note = pitchs[i].getElementsByTagName("step")[0].childNodes[0].nodeValue + "" +
              pitchs[i].getElementsByTagName("octave")[0].childNodes[0].nodeValue;
            temp.push(note);
        }
        notes.push(temp);
    }
    return notes;
}
