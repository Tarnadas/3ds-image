'use strict';

var _jimp = require('jimp');

var _jimp2 = _interopRequireDefault(_jimp);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function mortonEnc(x, y, w) {
    let i = x & 7 | (y & 7) << 8;
    i = (i ^ i << 2) & 0x1313;
    i = (i ^ i << 1) & 0x1515;
    i = (i | i >>> 7) & 0x3F;
    let offset = (x & ~7) * 8;
    let m = (i + offset) * 2;
    let o = (y & ~7) * w;
    //console.log(`pix ${x}x${y} i=${i} offset=${offset} m=${m} o=${o}`);
    return m + o;
};

async function from3DS(imageBuffer) {
    // no idea how to create an empty image with jimp, so I created one in Gimp and wrote its header to buffer
    let buffer3DS = Buffer.concat([Buffer.from(`42 4D 0A 1C 01 00 00 00 00 00 8A 00 00 00 7C 00 
            00 00 D8 00 00 00 A8 00 00 00 01 00 10 00 03 00 
            00 00 80 1B 01 00 13 0B 00 00 13 0B 00 00 00 00 
            00 00 00 00 00 00 00 F8 00 00 E0 07 00 00 1F 00 
            00 00 00 00 00 00 42 47 52 73 00 00 00 00 00 00 
            00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
            00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
            00 00 00 00 00 00 00 00 00 00 02 00 00 00 00 00 
            00 00 00 00 00 00 00 00 00 00`.replace(/\s+/g, ''), 'hex')], 0x11C0A);
    let image = await _jimp2.default.read(buffer3DS);
    //let arr = [];
    for (let y = 0; y < 216; y++) {
        for (let x = 0; x < 168; x++) {
            let s = mortonEnc(x, y, 168);
            //console.log(s.toString(16));
            //arr.push(s);
            let rgb565 = imageBuffer.readUInt16LE(s);
            let hex = _jimp2.default.rgbaToInt((rgb565 & 0xF800) >>> 11 << 3, (rgb565 & 0x7E0) >>> 5 << 2, (rgb565 & 0x1F) << 3, 0xFF);
            image.setPixelColor(hex, y, 167 - x);
        }
    }
    image.quality(100).write(_path2.default.join(__dirname, '../image3ds.jpg'));

    buffer3DS = Buffer.concat([Buffer.from(`42 4D 8A 3C 00 00 00 00 00 00 8A 00 00 00 7C 00 
            00 00 F0 00 00 00 20 00 00 00 01 00 10 00 03 00 
            00 00 00 3C 00 00 13 0B 00 00 13 0B 00 00 00 00 
            00 00 00 00 00 00 00 F8 00 00 E0 07 00 00 1F 00 
            00 00 00 00 00 00 42 47 52 73 00 00 00 00 00 00 
            00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
            00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
            00 00 00 00 00 00 00 00 00 00 02 00 00 00 00 00 
            00 00 00 00 00 00 00 00 00 00 
            `.replace(/\s+/g, ''), 'hex')], 0x3C8A);
    image = await _jimp2.default.read(buffer3DS);
    for (let y = 0; y < 240; y++) {
        for (let x = 0; x < 32; x++) {
            let s = mortonEnc(x, y, 32);
            //arr.push(s);
            s += 0x11B80;
            let rgb565 = imageBuffer.readUInt16LE(s);
            let hex = _jimp2.default.rgbaToInt((rgb565 & 0xF800) >>> 11 << 3, (rgb565 & 0x7E0) >>> 5 << 2, (rgb565 & 0x1F) << 3, 0xFF);
            image.setPixelColor(hex, y, 199 - x);
        }
    }
    //arr.sort((a, b) => (a - b));
    //console.log(arr);
    image.quality(100).write(_path2.default.join(__dirname, '../image3ds_wide.jpg'));
}

/**
 * main
 */

(async () => {
    const course = _fs2.default.readFileSync(_path2.default.join(__dirname, '../course000'));
    const imageBuffer = course.slice(0x2A05C, 0x2A05C + 0x157C0);
    await from3DS(imageBuffer);
})();