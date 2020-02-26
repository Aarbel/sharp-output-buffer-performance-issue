'use strict';

const fastApp = require('../../app-fast.js');
const slowApp = require('../../app-slow.js');
const chai = require('chai');
const expect = chai.expect;
const event = {
    body: {
        "tileSize": 512,
        "zoomLevel": 4,
    },
};


describe('Tests index', function () {
    it('tests fast app', async () => {
        await fastApp.lambdaHandler(event)
    });
    it('tests slow app', async () => {
        await slowApp.lambdaHandler(event)
    });
});
