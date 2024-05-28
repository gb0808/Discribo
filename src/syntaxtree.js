const MIDI_NOTE_ON = 0x9;
const MIDI_NOTE_OFF = 0x8;
const TRACK_NAME_EVENT = 0x03;

class SyntaxTree {
    
    #root

    /**
     * @description creates a syntax tree representation of the given midi file.
     * @param {ArrayBuffer} arraybuffer - the given midi file
     */
    constructor(arraybuffer) {
        this.#root = TreeNodeFactory.SmfNodeFactory(arraybuffer);
    }

    /**
     * @description returns all the notes in a midi file
     * @returns {[Object{name: String, notes: [Note]}]}
     */
    getNotes() {
        const headerChunk = this.#root.lookup(HeaderChunkNode)[0];
        const division = headerChunk.division.toInt();
        if (division < 0)
            throw (new Error('division type not yet supported'));
        const trackChunks = this.#root.lookup(TrackChunkNode);
        let notes = [];
        for (let i = 0; i < trackChunks.length; i++)
            notes.push({name: trackChunks[i].getName(), notes: trackChunks[i].getNotes(division)});
        return notes;
    }    
}

class TreeNode {

    nodes
    
    /**
     * @constructor
     * @param {[Object]} nodes - the child nodes of this node.
     */
    constructor(nodes) {
        if (nodes.length == 0)
            this.nodes = null;
        else {
            this.nodes = [];
            for (let i = 0; i < nodes.length; i++)
                this.add(nodes[i]);
        }
    }

    /**
     * @description adds a child node to the current node.
     * @param {Object} node - the node being added.
     */
    add(node) {
        if (node instanceof Array)
            this.nodes = this.nodes.concat(node);
        else
            this.nodes.push(node);
    }

    /**
     * @description finds all instances in the tree of a specific subclass.
     * @param {Object} targetInstance
     * @returns {[Object]}
     */
    lookup(targetInstance) {
        let tmp = [];
        if (this instanceof targetInstance)
            tmp.push(this);
        for (let i = 0; i < this.nodes.length; i++)
            tmp = tmp.concat(this.nodes[i].lookup(targetInstance));
        return tmp;
    }
}

class LeafNode extends TreeNode {

    #arraybuffer

    constructor(arraybuffer) {
        super([]);
        this.#arraybuffer = arraybuffer;
    }

    addNode(node) {
        return;
    }

    lookup(targetInstance) {
        return [];
    }

    getBuffer() {
        return this.#arraybuffer;
    }

    toInt() {
        if (this.#arraybuffer.byteLength == 1)
            return (new Uint8Array(this.#arraybuffer))[0];
        return bytesToInt(new Uint8Array(this.#arraybuffer));
    }

    toVariableLengthInt() {
        if (this.#arraybuffer.byteLength == 1)
            return (new Uint8Array(this.#arraybuffer))[0];
        return variableLengthBytesToInt(new Uint8Array(this.#arraybuffer));
    }

    getByteLength() {
        return this.#arraybuffer.byteLength;
    }
}

class SmfNode extends TreeNode {
    /**
     * @constructor
     * @param {HeaderChunkNode} headerChunk 
     * @param {[TrackChunkNode]} trackChunk 
     */
    constructor(headerChunk, trackChunk) {
        super(arguments);
    }
}

class HeaderChunkNode extends TreeNode {
    
    division
    
    /**
     * @constructor
     * @param {LeafNode} mthd - the literal string MThd
     * @param {LeafNode} length - length of the header chunk
     * @param {LeafNode} format - track format
     * @param {LeafNode} n - number of tracks that follow
     * @param {LeafNode} division - unit of time for delta timing
     */
    constructor(mthd, length, format, n, division) {
        super(arguments);
        this.division = division;
    }
}

class TrackChunkNode extends TreeNode {

    /**
     * @constructor
     * @param {LeafNode} mtrk - the literal string MTrk
     * @param {LeafNode} length - the number of bytes in the track chunk following this number
     * @param {[TrackEventNode]} trackEvent - a sequenced track event
     */
    constructor(mtrk, length, trackEvent) {
        super(arguments);
    }

    /**
     * @description gets this name of this midi track
     * @return {String} if found
     * @return {null} if not found
     */
    getName() {
        const metaEvents = this.lookup(MetaEventNode);
        for (let i = 0; i < metaEvents.length; i++)
            if (metaEvents[i].getType() === TRACK_NAME_EVENT)
                return metaEvents[i].getDataAsString();
        return null;
    }

    /**
     * @description gets all the notes in the notes they are played in a track.
     * @param {Number} division - the number of ticks per quarter note
     * @returns {[Note]}
     */
    getNotes(division) {
        const commands = this.#getMidiCommands().sort((x, y) => x.time - y.time);
        let notesRecord = {};
        let notes = [];
        for (let i = 0; i < commands.length; i++) {
            if (notesRecord[commands[i].note] === undefined)
                notesRecord[commands[i].note] = commands[i].time;
            else {
                const duration = (commands[i].time - notesRecord[commands[i].note]) / division;
                notes.push(new Note(commands[i].note, duration));
                notesRecord[commands[i].note] = undefined;
            }
        }
        return notes;
    }

    /**
     * @description A helper function to list all the midi commands in the files.
     * @returns {[Object{note: Number, time: Number, type: Number}]}
     */
    #getMidiCommands() {
        const trackEvents = this.lookup(TrackEventNode);
        let currentTime = 0;
        let midiCommands = [];
        for (let i = 0; i < trackEvents.length; i++) {
            currentTime += trackEvents[i].v_time.toVariableLengthInt();
            const event = trackEvents[i].event;
            const type = event.getType();
            if (event instanceof MidiEventNode && type === MIDI_NOTE_ON || type === MIDI_NOTE_OFF) {
                midiCommands.push({
                    note: event.getNote(),
                    time: currentTime,
                    type: type,
                });
            }  
        }
        return midiCommands;
    }
}

class TrackEventNode extends TreeNode {

    v_time
    event

    /**
     * @constructor
     * @param {LeafNode} v_time - a variable length value specifying the elapsed time (delta time) 
     *                            from the previous event to this event.
     * @param {MetaEventNode | LeafNode | SysexEventNode} event 
     */
    constructor(v_time, event) {
        super(arguments);
        this.v_time = v_time;
        this.event = event;
    }
}

class MetaEventNode extends TreeNode {

    /**
     * @constructor
     * @param {LeafNode} lead - the byte 0xFF
     * @param {LeafNode} meta_type - the event type
     * @param {LeafNode} v_length - length of meta event data expressed as a variable length value.
     * @param {LeafNode} event_data_bytes - the actual event data.
     */
    constructor(lead, meta_type, v_length, event_data_bytes) {
        super(arguments);
    }

    /**
     * @description gets the type of the meta event
     * @returns {Number}
     */
    getType() {
        return this.nodes[1].toInt();
    }

    /**
     * @description gets the data for the meta event
     * @returns {ArrayBuffer}
     */
    getData() {
        return this.nodes[3].getBuffer();
    }

    /**
     * @description gets the data for the meta event and converts it to a string
     * @returns {String}
     */
    getDataAsString() {
        const buffer = this.getData();
        const bytes = new Uint8Array(buffer);
        let s = '';
        for (let i = 0; i < bytes.length; i++)
            s += String.fromCharCode(bytes[i]);
        return s;
    }

    /**
     * @description gets the length of the data chunk in the meta event.
     * @return {Number}
     */
    getDataLength() {
        return this.nodes[2].toInt();
    }
}

class SysexEventNode extends TreeNode {
    /**
     * @constructor
     * @param {LeafNode} lead - the byte 0xF0 or 0xF7
     * * @param {LeafNode} v_length - length of event data expressed as a variable length value.
     * @param {LeafNode} data_bytes - the data
     */
    constructor(lead, v_length, data_bytes) {
        super(arguments)
    }
}

class MidiEventNode extends TreeNode {

    /**
     * @constructor
     * @param {LeafNode} firstByte
     * @param {LeafNode} param1 
     * @param {LeafNode} param2 
     */
    constructor(firstByte, param1, param2) {
        super(arguments);
    }

    /**
     * @returns {Number} the type of midi event
     */
    getType() {
        const firstByteHex = intToHex(this.nodes[0].toInt());
        if (firstByteHex.length == 1)
            return 0;
        return HEX_TO_INT[firstByteHex[0]];
    }

    /**
     * @returns {Number} the midi channel
     */
    getMidiChannel() {
        const firstByteHex = intToHex(this.nodes[0].toInt());
        if (firstByteHex.length == 1)
            return HEX_TO_INT[firstByteHex[0]];
        return HEX_TO_INT[firstByteHex[1]];
    }

    /**
     * @returns {Number} the midi note number
     */
    getNote() {
        return this.nodes[1].toInt();
    }
}

function Note(value, duration) {
    this.value = value;
    this.duration = duration;
}