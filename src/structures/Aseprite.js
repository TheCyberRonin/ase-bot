const zlib = require('zlib');
const {formatBytes} = require('../lib/utility');
class Aseprite {
  constructor(buffer, name) {
    this._offset = 0;
    this._buffer = buffer;
    this.frames = [];
    this.layers = [];
    this.fileSize;
    this.numFrames;
    this.width;
    this.height;
    this.colorDepth;
    this.numColors;
    this.pixelRatio;
    this.name = name;
  }
  readNextByte() {
    const nextByte = this._buffer.readUInt8(this._offset);
    this._offset += 1;
    return nextByte;
  }
  readByte(offset) {
    return this._buffer.readUInt8(offset);
  }
  readNextWord() {
    const word = this._buffer.readUInt16LE(this._offset);
    this._offset += 2;
    return word;
  }
  readWord(offset) {
    return this._buffer.readUInt16LE(offset);
  }
  readNextShort() {
    const short = this._buffer.readInt16LE(this._offset);
    this._offset += 2;
    return short;
  }
  readShort(offset) {
    return this._buffer.readInt16LE(offset);
  }
  readNextDWord() {
    const dWord = this._buffer.readUInt32LE(this._offset);
    this._offset += 4;
    return dWord;
  }
  readDWord(offset) {
    return this._buffer.readUInt32LE(offset);
  }
  readNextLong() {
    const long = this._buffer.readInt32LE(this._offset);
    this._offset += 4;
    return long;
  }
  readLong(offset) {
    return this._buffer.readInt32LE(offset);
  }
  readNextFixed() {
    const fixed = this._buffer.readFloatLE(this._offset);
    this._offset += 4;
    return fixed;
  }
  readFixed(offset) {
    return this._buffer.readFloatLE(offset);
  }
  readNextBytes(numBytes) {
    let strBuff = Buffer.alloc(numBytes);
    for (let i = 0; i < numBytes; i++) {
      strBuff.writeUInt8(this.readNextByte(), i);
    }
    return strBuff.toString();
  }
  readNextRawBytes(numBytes) {
    let buff = Buffer.alloc(numBytes);
    for (let i = 0; i < numBytes; i++) {
      buff.writeUInt8(this.readNextByte(), i);
    }
    return buff;
  }
  //reads numBytes bytes of buffer b offset by offset bytes
  readRawBytes(numBytes, b, offset) {
    let buff = Buffer.alloc(numBytes - offset);
    for (let i = 0; i < numBytes - offset; i++) {
      buff.writeUInt8(b.readUInt8(offset + i), i);
    }
    return buff;
  }
  readNextString() {
    const numBytes = this.readNextWord();
    return this.readNextBytes(numBytes);
  }
  skipBytes(numBytes) {
    this._offset += numBytes;
  }
  // adopted from:
  //   http://www.onicos.com/staff/iz/amuse/javascript/expert/utf.txt

  /* utf.js - UTF-8 <=> UTF-16 convertion
   *
   * Copyright (C) 1999 Masanao Izumo <iz@onicos.co.jp>
   * Version: 1.0
   * LastModified: Dec 25 1999
   * This library is free.  You can redistribute it and/or modify it.
   */

  Utf8ArrayToStr(array) {
    var out, i, len, c;
    var char2, char3;

    out = "";
    len = array.length;
    i = 0;
    while (i < len) {
      c = array[i++];
      switch (c >> 4) {
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
          // 0xxxxxxx
          out += String.fromCharCode(c);
          break;
        case 12:
        case 13:
          // 110x xxxx   10xx xxxx
          char2 = array[i++];
          out += String.fromCharCode(((c & 0x1f) << 6) | (char2 & 0x3f));
          break;
        case 14:
          // 1110 xxxx  10xx xxxx  10xx xxxx
          char2 = array[i++];
          char3 = array[i++];
          out += String.fromCharCode(
            ((c & 0x0f) << 12) | ((char2 & 0x3f) << 6) | ((char3 & 0x3f) << 0)
          );
          break;
      }
    }
    return out;
  }
  readHeader() {
    this.fileSize = this.readNextDWord();
    this.readNextWord();
    this.numFrames = this.readNextWord();
    this.width = this.readNextWord();
    this.height = this.readNextWord();
    this.colorDepth = this.readNextWord();
    this.skipBytes(18);
    this.numColors = this.readNextWord();
    const pixW = this.readNextByte();
    const pixH = this.readNextByte();
    this.pixelRatio = `${pixW}:${pixH}`;
    this.skipBytes(92);
    return this.numFrames;
  }
  readFrame() {
    const bytesInFrame = this.readNextDWord();
    this.skipBytes(2);
    const oldChunk = this.readNextWord();
    const frameDuration = this.readNextWord();
    this.skipBytes(2);
    const newChunk = this.readNextDWord();
    console.log({
      bytesInFrame,
      oldChunk,
      frameDuration,
      newChunk
    });
    let cels = [];
    //return newChunk;
    for(let i = 0; i < newChunk; i ++) {
      let chunkData = this.readChunk();
      switch(chunkData.type) {
        case 0x0004:
          this.skipBytes(chunkData.chunkSize - 6);
          break;
        case 0x2004:
          console.log('Layer');
          this.readLayerChunk();
          break;
        case 0x2005:
          console.log('Cel')
          let celData = this.readCelChunk(chunkData.chunkSize);
          cels.push(celData);
          break;
        case 0x2007:
          this.readColorProfileChunk();
          break;
        case 0x2019:
          console.log('Palette');
          this.palette = this.readPaletteChunk();
          break;
      }
    }
    this.frames.push({ bytesInFrame,
      frameDuration,
      numChunks: newChunk,
      cels});
  }
  readColorProfileChunk() {
    const type = this.readNextWord();
    const flag = this.readNextWord();
    const fGamma = this.readNextFixed();
    this.skipBytes(8);
    console.log({
      type,
      flag,
      fGamma
    });
    this.colorProfile = {type,
      flag,
      fGamma};
  }
  readPaletteChunk() {
    const paletteSize = this.readNextDWord();
    const firstColor = this.readNextDWord();
    const secondColor = this.readNextDWord();
    this.skipBytes(8);
    let colors = [];
    for (let i = 0; i < paletteSize; i++) {
      let flag = this.readNextWord();
      let red = this.readNextByte();
      let green = this.readNextByte();
      let blue = this.readNextByte();
      let alpha = this.readNextByte();
      let name;
      if (flag === 1) {
        name = this.readNextString();
      }
      colors.push({
        flag,
        red,
        green,
        blue,
        alpha,
        name: name !== undefined ? name : "none"
      });
    }
    console.log({
      paletteSize,
      firstColor,
      secondColor,
      colors
    });
    return { paletteSize,
      firstColor,
      lastColor: secondColor,
      colors };
  }
  readLayerChunk() {
    const flags = this.readNextWord();
    const type = this.readNextWord();
    const layerChildLevel = this.readNextWord();
    this.skipBytes(4);
    const blendMode = this.readNextWord();
    const opacity = this.readNextByte();
    this.skipBytes(3);
    const name = this.readNextString();
    this.layers.push({ flags,
      type,
      layerChildLevel,
      blendMode,
      opacity,
      name});
    console.log({
      flags,
      type,
      layerChildLevel,
      blendMode,
      opacity,
      name
    });
  }
  //size of chunk in bytes for the WHOLE thing
  readCelChunk(chunkSize) {
    const layerIndex = this.readNextWord();
    const x = this.readNextShort();
    const y = this.readNextShort();
    const opacity = this.readNextByte();
    const celType = this.readNextWord();
    this.skipBytes(7);
    console.log(this._offset);
    const w = this.readNextWord();
    const h = this.readNextWord();
    const buff = this.readNextRawBytes(chunkSize - 26); //take the first 20 bytes off for the data above and chunk info

    console.log({
      layerIndex,
      x,
      y,
      opacity,
      celType,
      w,
      h
    });
    const rawCel = zlib.inflateSync(buff);
    return { layerIndex,
      xpos: x,
      ypos: y,
      opacity,
      celType,
      w,
      h,
      rawCelData: rawCel}
  }
  readChunk() {
    const cSize = this.readNextDWord();
    const type = this.readNextWord();;
    console.log({
      cSize,
      type
    });
    return {chunkSize: cSize, type: type};
  }
  parse() {
    const numFrames = this.readHeader();
    //for(let i = 0; i < numFrames; i ++) {
      this.readFrame();
    //}
   
  }
  formatBytes(bytes,decimals) {
    if (bytes === 0) {
      return '0 Byte';
    }
    const k = 1024;
    const dm = decimals + 1 || 3;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  toEmbed() {
    const fileName = this.name.replace('.aseprite', '.png');
    const emb = { title: fileName};
    emb.image = {url: `attachment://${fileName}`}
    emb.fields = [];
    //size
    emb.fields.push({name: 'Size', value: this.formatBytes(this.fileSize, 2)});
    //framecount
    emb.fields.push({name: 'Frames', value: this.numFrames});
    //width and height
    emb.fields.push({name: 'Dimensions', value: `${this.width}X${this.height}`});
    //pixel ratio
    emb.fields.push({name: 'Pixel Ratio' ,value: this.pixelRatio});
    return emb;
  }
  toJSON() {
    return {
      fileSize: this.fileSize,
      frames: this.numFrames,
      width: this.width,
      height: this.height,
      colorDepth: this.colorDepth,
      numColors: this.numColors,
      pixelRatio: this.pixelRatio,
      layers: this.layers
    };
  }
}

module.exports = Aseprite;
