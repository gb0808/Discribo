/**
 * @description - Creates a MusicWriter object with the data from a MusicReader.
 * @constructor
 * @param {MusicReader} musicReader - The contents of a MusicReader.
 */
function MusicWriter(musicReader) {
    const DEFAULT_TEMP0 = 60;
    this.mMusicReader = musicReader;
    this.myRoot = new Document();
}

/**
 * @description - Creates a .xml file to pass back to the user.
 * @returns {String} - A String holding the contents of the .xml file.
 */
MusicWriter.prototype.getFile = function () {
    this.initFile()
    return new XMLSerializer().serializeToString(this.myRoot.documentElement);
}

/**
 * @description - This function starts the process of converting a Music XML file into a usable 
 *                NetsBlox project.
 */
MusicWriter.prototype.initFile = function () {
    const room = this.createRoom();
    this.myRoot.appendChild(room);
}

/**
 * @description - This function creates the content of a <room> tag in a NetsBlox project.
 * @returns {Element} - The <room> tag.
 */
MusicWriter.prototype.createRoom = function () {
    const room = this.myRoot.createElement("room");
    room.setAttribute("name", this.mMusicReader.name);
    room.setAttribute("app", "NetsBlox 2.3.2, http://netsblox.org");
    const role = this.createRole("myRole");
    room.appendChild(role);
    return room;
}

/**
 * @description - This function creates the content of a <role> tag in a NetsBlox project.
 * @param {String} name - The name of the role.
 * @returns {Element} - The <role> tag.
 */
MusicWriter.prototype.createRole = function (name) {
    const role = this.myRoot.createElement("role");
    role.setAttribute("name", name);
    const project = this.createProject(name);
    role.appendChild(project);
    return role;
}

/**
 * @description - This function creates the content of a <project> tag in a NetsBlox project.
 * @param {String} roleName - The name of the role the project is being created in.
 * @returns {Element} - The <project> tag.
 */
MusicWriter.prototype.createProject = function (roleName) {
    const project = this.myRoot.createElement("project");
    project.setAttribute("name", roleName);
    project.setAttribute("app", "NetsBlox 2.3.2, http://netsblox.org");
    project.setAttribute("version", "2.3.2");
    const stage = this.createStage();
    project.appendChild(stage);
    const variables = this.createVariables();
    project.appendChild(variables);
    return project;
}

/**
 * @description - This function creates the content of a <stage> tag in a NetsBlox project.
 * @param {Element} name  - The name of the stage.
 * @returns {Element} - The <stage> tag.
 */
MusicWriter.prototype.createStage = function (name = "Stage") {
    const stage = this.myRoot.createElement("stage");
    stage.setAttribute("name", name);
    stage.setAttribute("temp", this.DEFAULT_TEMP0);
    const blocks = this.createBlocks();
    stage.appendChild(blocks);
    const scripts = this.createScripts();
    scripts.appendChild(this.createStartScript());
    stage.appendChild(scripts);
    const variables = this.createVariables();
    stage.appendChild(variables);
    const sprites = this.createSprites();
    stage.appendChild(sprites);
    return stage;
}

/**
 * @description - This function creates the content of a <blocks> tag in a NetsBlox project. It 
 *                populates it with previously created <block> elements.
 * @param {[Element]} blocksContent - The <block> elements being put inside the <blocks> tag. If 
 *                                    the array is empty, an empty <blocks> tag is returned.
 * @returns {Element} - The <blocks> tag.
 * @see MusicWriter.prototype.createBlock
 */
MusicWriter.prototype.createBlocks = function (blocksContent = []) {
    const blocks = this.myRoot.createElement("blocks");
    for (let i = 0; i < blocksContent.length; ++i) {
        blocks.appendChild(blocksContent[i]);
    }
    return blocks;
}

/**
 * @description - This function creates the content of a <scripts> tag in a NetsBlox project. It 
 *                populates it with previously created <script> elements.
 * @param {[Element]} scriptsContent - The <script> elements being put inside the <scripts> tag. If 
 *                                     the array is empty, an empty <scripts> tag is returned.
 * @returns {Element} - The <scripts> tag.
 * @see MusicWriter.prototype.createScript
 */
MusicWriter.prototype.createScripts = function (scriptsContent = []) {
    const scripts = this.myRoot.createElement("scripts");
    for (let i = 0; i < scriptsContent.length; ++i) {
        scripts.appendChild(scriptsContent[i]);
    }
    return scripts;
}

/**
 * @description - This function creates the content of a <variables> tag in a NetsBlox project. It 
 *                populates it with previously created <variable> elements.
 * @param {[Element]} variablesContent - The <variable> elements being put inside the <variables> 
 *                                       tag. If the array is empty, an empty <variables> tag is
 *                                       returned.
 * @returns {Element} - The <variables> tag.
 * @see MusicWriter.prototype.createVariable
 */
MusicWriter.prototype.createVariables = function (variablesContent = []) {
    const variables = this.myRoot.createElement("variables");
    for (let i = 0; i < variablesContent.length; ++i) {
        variables.appendChild(variablesContent[i]);
    }
    return variables;
}

/**
 * @description - This function creates the content of a <sprites> tag in a NetsBlox project. Each 
 *                part in a score becomes its own sprite.
 * @returns {Element} - The <sprites> tag.
 * @see MusicWriter.prototype.createSprite
 */
MusicWriter.prototype.createSprites = function () {
    const sprites = this.myRoot.createElement("sprites");
    for (let i = 0; i < this.mMusicReader.parts.length; ++i) {
        const sprite = this.createSprite(this.mMusicReader.parts[i]);
        sprites.appendChild(sprite);
    }
    return sprites;
}

/**
 * @description - This function creates a sprite in a NetsBlox project. Each sprite represents a 
 *                part in a musical score.
 * @param {Element} part - The part in the score
 * @returns {Element} - The <sprite> tag.
 */
MusicWriter.prototype.createSprite = function (part) {
    const sprite = this.myRoot.createElement("sprite");
    sprite.setAttribute("name", part.name);
    sprite.setAttribute("scale", "1");
    sprite.setAttribute("draggable", "true");
    sprite.setAttribute("volume", "100");
    sprite.setAttribute("pan", "0");
    const blocks = this.createBlocks();
    sprite.appendChild(blocks);
    const scripts = this.createScripts([this.writeMusic(part)]);
    sprite.appendChild(scripts);
    const variableList = [
        this.createVariable("notes"),
        this.createVariable("duration"),
        this.createVariable("dotted"),
    ];
    const variables = this.createVariables(variableList);
    sprite.appendChild(variables);
    return sprite;
}

/**
 * @description - Converts a music staff into NetsBlox code.
 * @param {Part} part - An object that models a <part> tag in a MusicXML file.
 * @returns {Element} - A <script> tag.
 */
MusicWriter.prototype.writeMusic = function (part) {
    const script = this.myRoot.createElement("script");

    // create the broadcast receiver.
    const receiver = this.myRoot.createElement("block");
    receiver.setAttribute("s", "receiveMessage");
    const l = this.myRoot.createElement("l");
    const text = this.myRoot.createTextNode("play");
    l.appendChild(text);
    receiver.appendChild(l);

    // set default instrument
    const instrument = this.setInstrument();

    // create arrays to hold the note data and set them to NetsBlox variables
    let noteNamesData = [], noteDurationsData = [], noteDottedData = [];
    for (let i = 0; i < part.notes.length; ++i) {
        noteNamesData.push(part.notes[i].pitch);
        if (part.notes[i].type == "16th") {
            noteDurationsData.push("Sixteenth");
        } else if (part.notes[i].type == "32nd") {
            noteDurationsData.push("ThirtySecond")
        } else {
            noteDurationsData.push(part.notes[i].type);
        }
        if (part.notes[i].dotted) {
            noteDottedData.push("Dotted");
        } else {
            noteDottedData.push("");
        }
    }
    const noteNames = this.createSetBlock("notes", this.createListBlock(noteNamesData));
    const noteDurations = this.createSetBlock("duration", this.createListBlock(noteDurationsData));
    const noteDotted = this.createSetBlock("dotted", this.createListBlock(noteDottedData));

    // create a script to play the notes.
    const length = this.createLengthOption("notes");
    const getDuration = this.listGetAtI("duration");
    const getDotted = this.listGetAtI("dotted");
    const getNote = this.listGetAtI("notes");
    const playNote = this.createNoteBlock(getDuration, getDotted, getNote);
    const scriptContainer = this.myRoot.createElement("script");
    scriptContainer.appendChild(playNote);
    const loop = this.createForLoop(length, scriptContainer);

    // script to play through the notes
    script.appendChild(receiver);
    script.appendChild(instrument);
    script.appendChild(noteNames);
    script.appendChild(noteDurations);
    script.appendChild(noteDotted);
    script.appendChild(loop);
    
    return script;
}

/**
 * @description - A helper function to create a NetsBlox list.
 * @param {String} arr - The data being entered into the list.
 * @return {Element} - The <block> tag holding a list.
 */
MusicWriter.prototype.createListBlock = function (arr) {
    const block = this.myRoot.createElement("block");
    block.setAttribute("s", "reportNewList");
    const list = this.myRoot.createElement("list");
    for (let i = 0; i < arr.length; ++i) {
        const l = this.myRoot.createElement("l");
        const text = this.myRoot.createTextNode(arr[i]);
        l.appendChild(text);
        list.appendChild(l);
    }
    block.appendChild(list);
    return block;
}

/**
 * @description - A helper function to create a NetsBlox variable.
 * @param {String} name - The name of the variable.
 * @param {Element} value - The value of the variable.
 * @returns {Element} - The <block> tag holding a set block.
 */
MusicWriter.prototype.createSetBlock = function (name, value) {
    const block = this.myRoot.createElement("block");
    block.setAttribute("s", "doSetVar");
    const nameTag = this.myRoot.createElement("l");
    const nameText = this.myRoot.createTextNode(name);
    nameTag.appendChild(nameText);
    block.appendChild(nameTag);
    block.appendChild(value);
    return block;
}

/**
 * @description - A helper function to create the <block> tag in the document.
 * @param {Element} duration - A reporter that has the duration of the note.
 * @param {Element} dotted - A reporter that indicated if a note is dotted.
 * @param {Element} note - A reporter that has the name of the note.
 * @returns {Element} - The <block> tag.
 */
MusicWriter.prototype.createNoteBlock = function (duration, dotted, note) {
    const block = this.myRoot.createElement("block");
    block.setAttribute("s", "playNote");
    block.appendChild(duration);
    block.appendChild(dotted);
    block.appendChild(note);
    return block;
}

/**
 * @description - Creates a uninitialized NetsBlox variable.
 * @param {String} name - The name of the variable.
 * @returns {Element} - The <variable> tag.
 */
MusicWriter.prototype.createVariable = function (name) {
    const variable = this.myRoot.createElement("variable");
    variable.setAttribute("name", name);
    const l = this.myRoot.createElement("l");
    const value = this.myRoot.createTextNode("0");
    l.appendChild(value);
    variable.appendChild(l);
    return variable;
}

/**
 * @description - Creates a NetsBlox for-loop.
 * @param {Element} upperBound - The upper bound of the for-loop as a reporter.
 * @param {Element} script - The script being inserted in the for-loop.
 * @returns {Element} - A <block> tag.
 */
MusicWriter.prototype.createForLoop = function (upperBound, script) {
    const loop = this.myRoot.createElement("block");
    loop.setAttribute("s", "doFor");
    const indexContainer = this.myRoot.createElement("l");
    const indexText = this.myRoot.createTextNode("i");
    indexContainer.appendChild(indexText);
    loop.appendChild(indexContainer);
    const startContainer = this.myRoot.createElement("l");
    const startText = this.myRoot.createTextNode("1");
    startContainer.appendChild(startText);
    loop.appendChild(startContainer);
    loop.appendChild(upperBound);
    loop.appendChild(script);
    return loop;
}

/**
 * @description - This block creates a reporter that returns the length of an array.
 * @param {String} name - The name of the variable holding the list.
 * @returns {Element} - A <block> tag.
 */
MusicWriter.prototype.createLengthOption = function (name) {
    const reporter = this.myRoot.createElement("block");
    reporter.setAttribute("s", "reportListAttribute");
    const l = this.myRoot.createElement("l");
    const option = this.myRoot.createElement("option")
    const text = this.myRoot.createTextNode("length");
    option.appendChild(text);
    l.appendChild(option);
    reporter.appendChild(l);
    const variable = this.myRoot.createElement("block");
    variable.setAttribute("var", name);
    reporter.appendChild(variable);
    return reporter;
}

/**
 * @description - This block creates a report that gets a value at the ith index in a list.
 * @param {String} name - The name of the list.
 * @return {Element} - A <block> tag.
 */
MusicWriter.prototype.listGetAtI = function (name) {
    const block = this.myRoot.createElement("block");
    block.setAttribute("s", "reportListItem");
    const i = this.myRoot.createElement("block");
    i.setAttribute("var", "i");
    block.appendChild(i);
    const notes = this.myRoot.createElement("block");
    notes.setAttribute("var", name);
    block.appendChild(notes);
    return block;
}

/**
 * @description - This function creates a setInstrument block.
 * @param {String} name - The name of the instrument.
 * @returns {Element} - A block tag.
 */
MusicWriter.prototype.setInstrument = function (name = "Grand Piano") {
    const instrument = this.myRoot.createElement("block");
    instrument.setAttribute("s", "setInstrument");
    const l = this.myRoot.createElement("l");
    const text = this.myRoot.createTextNode(name);
    l.appendChild(text);
    instrument.appendChild(l);
    return instrument;
}

/**
 * @description - This function create the first script that gets loaded onto the stage when the 
 *                project is opened.
 * @returns {Element} - A <script> tag
 */
MusicWriter.prototype.createStartScript = function () {
    const startScript = this.myRoot.createElement("script");
    const start = this.myRoot.createElement("block");
    start.setAttribute("s", "receiveGo");
    const broadcast = this.myRoot.createElement("block");
    broadcast.setAttribute("s", "doBroadcast");
    const l = this.myRoot.createElement("l");
    const text = this.myRoot.createTextNode("play");
    l.appendChild(text);
    broadcast.appendChild(l);
    startScript.appendChild(start);
    startScript.appendChild(broadcast);
    return startScript;
}