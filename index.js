const fileUpload = document.getElementById('music-file');
fileUpload.addEventListener("change", (event) => {
    const fileList = event.target.files;
    const file = fileList[0];

    const reader = new FileReader();
    reader.onload = () => {
        const read = new MusicReader(reader.result);
        const write = new MusicWriter(read);
        const xmlLink = document.getElementById("xml-link");
        xmlLink.href = URL.createObjectURL(write.getFile(), { type: "text/xml" });
        xmlLink.click();
    };

    reader.readAsText(file);
});