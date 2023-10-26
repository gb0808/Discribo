const fileUpload = document.getElementById('music-file');
fileUpload.addEventListener("change", (event) => {
    const fileList = event.target.files;
    const file = fileList[0];

    const reader = new FileReader();
    reader.onload = () => {
        const music = new MusicReader(reader.result);
        console.log(music.getNotes());
    };

    reader.readAsText(file);
});