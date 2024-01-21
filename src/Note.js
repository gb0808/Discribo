/**
 * @description - Creates and instance of an object representing a note in a musical work.
 * @param {Element} src - The contents of a <note> tag in a .musicxml file. 
 */
function Note(src) {
    this.src = src;

    this.initPitch = function () {
        if (this.src.getElementsByTagName("rest").length > 0 || 
        this.src.getElementsByTagName("step").length == 0 ||
        this.src.getElementsByTagName("octave").length == 0) {
            return "Rest";
        }
        const step = this.src.getElementsByTagName("step")[0].childNodes[0].nodeValue;
        const octave = this.src.getElementsByTagName("octave")[0].childNodes[0].nodeValue;
        return step + octave;
    }

    this.initType = function () {
        const element = this.src.getElementsByTagName("type");
        if (element.length == 0) {
            return "Whole";
        }
        const temp = element[0].childNodes[0].nodeValue;
        return temp.charAt(0).toUpperCase() + temp.slice(1);
    }

    this.initDotted = function () {
        const element = this.src.getElementsByTagName("dot");
        return element.length != 0;
    }

    this.pitch = this.initPitch();
    this.type = this.initType();
    this.dotted = this.initDotted();
}