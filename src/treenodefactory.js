const INT_TO_HEX = {
    0 : '0', 1 : '1', 2 : '2', 3 : '3',
    4 : '4', 5 : '5', 6 : '6', 7 : '7',
    8 : '8', 9 : '9', 10 : 'A', 11 : 'B',
    12 : 'C', 13 : 'D', 14 : 'E', 15 : 'F'
}

const HEX_TO_INT = {
    '0' : 0, '1' : 1, '2' : 2, '3' : 3,
    '4' : 4, '5' : 5, '6' : 6, '7' : 7,
    '8' : 8, '9' : 9, 'A' : 10, 'B' : 11,
    'C' : 12, 'D' : 13, 'E' : 14, 'F' : 15
}

class TreeNodeFactory {
    /**
     * @param {ArrayBuffer} arraybuffer 
     * @pre the array buffer is properly formatted.
     * @returns {SmfNode}
     */
    static SmfNodeFactory(arraybuffer) {
        const size = arraybuffer.byteLength;
        const headerChunkNode = TreeNodeFactory.HeaderChunkNodeFactory(arraybuffer.slice(0, 14));
        const trackChunks = getTrackChunks(arraybuffer.slice(14, size))
        let trackChunkNodes = [];
        for (let i = 0; i < trackChunks.length; i++)
            trackChunkNodes.push(TreeNodeFactory.TrackChunkNodeFactory(trackChunks[i]));
        return new SmfNode(headerChunkNode, trackChunkNodes);
    }

    /**
     * @param {ArrayBuffer} arraybuffer 
     * @pre the array buffer is properly formatted.
     * @returns {HeaderChunkNode}
     * @return {null} on error
     */
    static HeaderChunkNodeFactory(arraybuffer) {
        if (arraybuffer.byteLength != 14)
            return null;
        const mthd = new LeafNode(arraybuffer.slice(0, 4));
        const length = new LeafNode(arraybuffer.slice(4, 8));
        const format = new LeafNode(arraybuffer.slice(8, 10));
        const n = new LeafNode(arraybuffer.slice(10, 12));
        const division = new LeafNode(arraybuffer.slice(12, 14));
        return new HeaderChunkNode(mthd, length, format, n, division);
    }

    /**
     * @param {ArrayBuffer} arraybuffer 
     * @pre the array buffer is properly formatted.
     * @returns {TrackChunkNode}
     */
    static TrackChunkNodeFactory(arraybuffer) {
        const size = arraybuffer.byteLength;
        const mtrk = new LeafNode(arraybuffer.slice(0, 4));
        const length = new LeafNode(arraybuffer.slice(4, 8));
        const events = getTrackEvents(arraybuffer.slice(8, size));
        let eventNodes = [];
        for (let i = 0; i < events.length; i++) 
            eventNodes.push(TreeNodeFactory.TrackEventNodeFactory(events[i]));
        return new TrackChunkNode(mtrk, length, eventNodes);
    }

    /**
     * @param {ArrayBuffer} arraybuffer 
     * @pre the array buffer is properly formatted.
     * @returns {TrackEventNode}
     */
    static TrackEventNodeFactory(arraybuffer) {
        const size = arraybuffer.byteLength;
        const vTimeLength = parseVariableLengthValue(new Uint8Array(arraybuffer));
        const vTime = new LeafNode(arraybuffer.slice(0, vTimeLength));
        const eventBuffer = arraybuffer.slice(vTimeLength, size);
        let event;
        if (isMetaEvent(eventBuffer))
            event = TreeNodeFactory.MetaEventNodeFactory(eventBuffer);
        else if (isSysexEvent(eventBuffer))
            event = TreeNodeFactory.SysexEventNodeFactory(eventBuffer);
        else 
            event = TreeNodeFactory.MidiEventNodeFactory(eventBuffer);
        return new TrackEventNode(vTime, event);
    }

    /**
     * @param {ArrayBuffer} arraybuffer 
     * @pre the array buffer is properly formatted.
     * @returns {MetaEventNode}
     */
    static MetaEventNodeFactory(arraybuffer) {
        const size = arraybuffer.byteLength;
        const lead = new LeafNode(arraybuffer.slice(0, 1));
        const meta_type = new LeafNode(arraybuffer.slice(1, 2));
        const deltaLength = parseVariableLengthValue(
            new Uint8Array(arraybuffer.slice(2, size))
        );
        const length = new LeafNode(arraybuffer.slice(2, 2 + deltaLength));
        const data_bytes = new LeafNode(arraybuffer.slice(2 + deltaLength, size));
        return new MetaEventNode(lead, meta_type, length, data_bytes);
    }

    /**
     * @param {ArrayBuffer} arraybuffer 
     * @pre the array buffer is properly formatted.
     * @returns {SysexEventNode}
     */
    static SysexEventNodeFactory(arraybuffer) {
        const size = arraybuffer.byteLength;
        const lead = new LeafNode(arraybuffer.slice(0, 1));
        const deltaLength = parseVariableLengthValue(
            new Uint8Array(arraybuffer.slice(1, size))
        );
        const length = new LeafNode(arraybuffer.slice(1, 1 + deltaLength));
        const data_bytes = new LeafNode(arraybuffer.slice(1 + deltaLength, size));
        return new SysexEventNode(lead, length, data_bytes);
    }

    /**
     * @param {ArrayBuffer} arraybuffer 
     * @pre the array buffer is properly formatted.
     * @returns {MidiEventNode}
     */
    static MidiEventNodeFactory(arraybuffer) {
        const firstByte = new LeafNode(arraybuffer.slice(0, 1));
        const param1 = new LeafNode(arraybuffer.slice(1, 2));
        const param2 = new LeafNode(arraybuffer.slice(2, 3));
        return new MidiEventNode(firstByte, param1, param2);
    }
}

/**
 * @description - A helper function to help with comparing a byte array to a string.
 * @param {String} str 
 * @param {Int8Array} view 
 * @returns {Boolean}
 */
function strcmp(str, view) {
    let tmp = '';
    for (let i = 0; i < view.length; i++)
        tmp += String.fromCharCode(view[i]);
    return str === tmp;
}

/**
 * @description - Tells you if the first bit in a byte is 
 * @param {Number} byte - One byte
 * @returns {Boolean}
 */
function hasLeadingOne(byte) {
    const s = byte.toString(2);
    if (s.length < 8)
        return false;
    return s[0] === '1';
}

/**
 * @description - Converts a decimal number to hexadecimal.
 * @param {Number} x
 * @returns {[String]} 
 */
function intToHex(x) {
    if (x == 0)
        return ['0'];

    let s = [];
    while (x > 0) {
        const r = x % 16;
        x = Math.floor(x / 16);
        s.push(INT_TO_HEX[r]);
    }
    return s.reverse();
}

/**
 * @description - Converts a series of bytes into an integer.
 * @param {[Number]} bytes 
 * @returns {Number}
 */
function bytesToInt(bytes) {
    let hexBytes = [];
    for (let i = 0; i < bytes.length; i++)
        hexBytes = hexBytes.concat(intToHex(bytes[i]));

    let n = 0;
    for (let i = hexBytes.length - 1, j = 0; i >= 0; i--, j++) {
        const x = HEX_TO_INT[hexBytes[i]];
        n += (x * (16 ** j));
    }

    return n;
}

/**
 * @description - Converts a series of variable length bytes into an integer.
 * @param {[Number]} bytes 
 * @returns {Number}
 */
function variableLengthBytesToInt(bytes) {
    let str = '';
    const length = parseVariableLengthValue(bytes);
    for (let i = 0; i < length; i++) {
        const s = bytes[i].toString(2);
        if (s.length < 8)
            str += s;
        else
            str += s.substring(1, 8);
    }

    let n = 0;
    for (let i = str.length - 1, j = 0; i >= 0; i--, j++)
        n += (parseInt(str[i]) * (2 ** j));
    return n;
}

/**
 * @description - Takes a series of variable-length bytes and tells you the length (in bytes) of 
 *                the first value
 * @param {[Number]} bytes 
 * @return {Number}
 */
function parseVariableLengthValue(bytes) {
    let count = 0;
    for (let i = 0; i < bytes.length; i++) {
        count++;
        if (!hasLeadingOne(bytes[i]))
            break;
    }
    return count > 4 ? 4 : count;
}

/**
 * @description - A helper fuction to help with identifying the type of track event.
 * @param {ArrayBuffer} arraybuffer 
 * @returns {Boolean}
 */
function isMetaEvent(arraybuffer) {
    const tmp = new Uint8Array(arraybuffer);
    return tmp[0] == 0xFF;
}

/**
 * @description - A helper function to get the length of a meta event.
 * @pre - isMetaEvent must return true on the array buffer being passed.
 * @param {ArrayBuffer} arraybuffer 
 * @returns {Number}
 */
function getMetaEventLength(arraybuffer) {
    const view = new Uint8Array(arraybuffer.slice(2, arraybuffer.byteLength));
    let bytes = []
    for (let i = 0; i < view.length; i++) {
        bytes.push(view[i]);
        if (!hasLeadingOne(view[i])) 
            break;
    }
    return variableLengthBytesToInt(bytes);
}

/**
 * @description - A helper fuction to help with identifying the type of track event.
 * @param {ArrayBuffer} arraybuffer 
 * @returns {Boolean}
 */
function isSysexEvent(arraybuffer) {
    const tmp = new Uint8Array(arraybuffer);
    const val = (tmp[0] * 16) + tmp[1];
    return val == 0xF0 || val == 0xF7;
}

/**
 * @description - A helper function to get the length of a sysex event.
 * @pre - isSysexEvent must return true on the array buffer being passed.
 * @param {ArrayBuffer} arraybuffer 
 * @returns {Number}
 */
function getSysexEventLength(arraybuffer) {
    const view = new Uint8Array(arraybuffer.slice(1, arraybuffer.byteLength));
    let bytes = []
    for (let i = 0; i < view.length; i++) {
        bytes.push(view[i]);
        if (!hasLeadingOne(view[i])) 
            break;
    }
    return variableLengthBytesToInt(bytes);
}

/**
 * @description - Separates the track chunks in a midi file and stores them in an array.
 * @param {ArrayBuffer} arraybuffer 
 * @returns {[ArrayBuffer]} - an array where each element is an array buffer for a track chunk.
 */
function getTrackChunks(arraybuffer) {
    const view = new Uint8Array(arraybuffer);
    const size = arraybuffer.byteLength;
    let trackChunks = [];
    let i = 0, j = 0;
    for (; j < size - 4; j++) {
        if (strcmp('MTrk', view.slice(j, j + 4)) && j != 0) {
            trackChunks.push(arraybuffer.slice(i, j));
            i = j;
        } 
    }
    trackChunks.push(arraybuffer.slice(i, size));
    return trackChunks;
}

/**
 * @description - Separates the track events in a midi file and stores them in an array.
 * @param {ArrayBuffer} arraybuffer 
 * @returns {[ArrayBuffer]}
 */
function getTrackEvents(arraybuffer) {
    const size = arraybuffer.byteLength;
    let trackEvents = [];
    for (let i = 0; i < size;) {
        const deltaTimeRaw = new Uint8Array(arraybuffer.slice(i, size));
        const deltaTimeLength = parseVariableLengthValue(deltaTimeRaw);
        const deltaTimeBuffer = arraybuffer.slice(i, i + deltaTimeLength);
        i += deltaTimeLength;

        const slice = arraybuffer.slice(i, size);
        let eventBuffer;
        if (isMetaEvent(slice)) {
            const datalength = getMetaEventLength(slice);
            const variableLength = parseVariableLengthValue(
                new Uint8Array(slice.slice(2, slice.length))
            );
            eventBuffer = slice.slice(0, 2 + variableLength + datalength);
            i += (2 + variableLength + datalength);
        }  else if (isSysexEvent(slice)) {
            // TODO
            throw (new Error('sysex event not recognized'));
        } else {
            eventBuffer = slice.slice(0, 3)
            i += 3;
        }

        const tmp = new Uint8Array(deltaTimeBuffer.byteLength + eventBuffer.byteLength);
        tmp.set(new Uint8Array(deltaTimeBuffer), 0);
        tmp.set(new Uint8Array(eventBuffer), deltaTimeBuffer.byteLength);
        trackEvents.push(tmp.buffer);
    }

    return trackEvents;
}