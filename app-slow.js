const sharp = require('sharp');
const fs = require('fs').promises;
const { generateTiles } = require('./generateTiles');


exports.lambdaHandler = async (event) => {
    const { body } = event;
    const { 
        tileSize, // Size of a tile
        zoomLevel, // Total zoom levels allowed (saved in the file)
    } = body;

    console.log('');
    console.log('');
    console.log('START running SLOOWWW function (~80 seconds)');

    let fileBuffer
    await fs.readFile('./big.png')
        .then((data) => {
            console.log('File read success');
            fileBuffer = data;
        })
        .catch((err) => {
            console.log('File read error');
            console.log(err.code, "-", err.message);
        })

    /* Here the input of sharp is a Buffer, not a string path */
    const sharpImage = sharp(fileBuffer, { sequentialRead: true })
        .toColorspace('srgb');


    await generateTiles(sharpImage, tileSize, zoomLevel);


    console.log('>>>> FINISHED running SLOOWWW function');
};
