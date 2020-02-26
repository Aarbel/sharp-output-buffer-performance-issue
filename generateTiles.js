const _ = require('lodash');
const Promise = require("bluebird");

const createBigSquarePageImage = async (processedBigImage, tileSize) => {
    const metadata = await processedBigImage.metadata();
    const inputSize = Math.max(metadata.width, metadata.height);

    /* Fit the processedBigImage with tiles sizes
       ex : const outputSize = 4000 + ((512 - 4000) % 512) = 3584 */
    const outputSize = inputSize + (tileSize - inputSize % tileSize);

    const resizedImage = processedBigImage
        .resize({
            width: outputSize,
            height: outputSize,
            fit: 'contain',
            background: 'white',
        });

    return resizedImage;
};

/* Returns all the tile transformers for a given zoom level. */
const zoomLevelTransformers = (rawBigImage, zoomLevel, tileSize) => {
    /** 
     * rootSize = 4096px x 4096px if zoomLevel is 3
     * rootSize = 8192px x 8192px if zoomLevel is 4 
    */
    const rootSize = tileSize * 2 ** zoomLevel;

    /* Resize the rawBigImage image to root size of zoom level */
    const zoomRoot = rawBigImage
        .resize({
            width: rootSize,
            height: rootSize,
        });

    const tileColumnCount = 2 ** zoomLevel;

    const gridNumbers = _.range(tileColumnCount);

    const zoomTiles = _.flatMap(gridNumbers, x => gridNumbers.map(y => {
            const newZoomRootInstance = zoomRoot.clone();

            const tile = newZoomRootInstance.extract({
                left: tileSize * x,
                top: tileSize * y,
                width: tileSize,
                height: tileSize,
            })


            const newTile = {
                x,
                y,
                sharpTile: tile,
                zoomLevel,
            }

            return newTile;
        })
    )

    return zoomTiles;
};


const generateTiles = async (sharpImage, tileSize, zoomLevel) => {
    
    /* Create a square  image that is multiple if tileSize (512px) */
    const rawBigSquareImage = await createBigSquarePageImage(sharpImage, tileSize);
    
    const zoomLevelRange =_.range(zoomLevel);

    console.log('>>>> GENERATE TILES WITH SHARP BUFFERS');
    const zoomLevelsTiles = _.flatMap(zoomLevelRange, (zoomLevel) => {
        console.log('Generating ZoomLevel :', zoomLevel);
        return zoomLevelTransformers(rawBigSquareImage, zoomLevel, tileSize);
    });


    console.log('>>>> GENERATE TILES WITH RAW BUFFERS');
    const zoomLevelsTilesBuffers = await Promise.mapSeries(zoomLevelsTiles,
        async tileObject => {

            const tileBuffer = await tileObject.sharpTile
                    .png()
                    .toBuffer()

            console.log('createdPngBuffer success — ', `Z-${tileObject.zoomLevel}-${tileObject.x}-${tileObject.y}`);
            
            return {
                ...tileObject,
                tileBuffer,
            }
        }
    )

    console.log('>>>> FINISHED GENERATING TILES BUFFERS');

};

module.exports = {
    generateTiles,
}

