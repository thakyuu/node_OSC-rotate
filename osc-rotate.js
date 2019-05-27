'use strict'

//Library
const fs = require('fs');
const util = require('util');
const osc = require('node-osc');
const log4js = require('log4js');
const sharp = require('sharp');

//Logging
log4js.configure({
	appenders : {
		logfile : {type : 'file', filename : 'osc-rotate.log'},
		stdout : {type : 'stdout'}
	},
	categories : {
		default : {appenders : ['logfile', 'stdout'], level : 'debug'}
	}
});
const logger = log4js.getLogger();
logger.level = 'debug';

process.on('uncaughtException', err => {
	logger.fatal(err);
	process.exit(1);
})

//Static
const config = JSON.parse(fs.readFileSync(__dirname + '/config.json').toString());

//Initialize
logger.level = config.log.level;

//RotateServer
const oscImageServer = new osc.Server(config.osc.image.listenPort);
oscImageServer.on('message', (msg, rinfo) => {
	logger.debug('Receive OSC:' + msg);
	imgRotate(msg[1])
})
logger.info(config.osc.image.listenPort + 'で待受を開始しました。')


function imgRotate(imgPath){
	logger.debug('Rotate Start: ' + imgPath);
	const img = sharp(imgPath);

	img.stats().then(stat => {
		logger.debug('Stats: ' + util.inspect(stat));
	})
	img.metadata().then(meta => {
		logger.debug('Metadata: ' + util.inspect(meta));
	})
	img.rotate(90).toBuffer().then(rotatedImg => {
		logger.debug('Rotate End: ' + imgPath);
		logger.debug('File Write Start: ' + imgPath);
		fs.writeFileSync(imgPath, rotatedImg);
		logger.debug('File Write End: ' + imgPath);
	}).catch(err => {
		logger.error(err);
	})
}

