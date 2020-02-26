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
    console.log('START running FAST function (~9 seconds)');

    const sharpImage = sharp('./big.png')
        .toColorspace('srgb');

    await generateTiles(sharpImage, tileSize, zoomLevel);

    console.log('>>>> FINISHED running FAST function');
};
