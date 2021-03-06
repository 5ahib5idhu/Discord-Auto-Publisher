const bot = require('../bot.js');
const { intervals } = require('../config.json');
const logger = require('../modules/Logger.js');
const shutdown = require('../modules/owner_commands/shutdown.js');
const Util = require('../modules/UtilFunctions.js');
const Spam = require('../modules/SpamManager.js');

module.exports = async () => {
	logger.log('Connected!', 'ready');

	// Set the presence and start the update interval
	Util.presence();
	setInterval(() => Util.presence(), intervals.presence * 60 * 1000);

	// Checks for blacklisted guilds and leaves them
	Spam.startupCheck();

	// Start the hourly spam cache audit & memory check interval
	setInterval(() => {
		Spam.cacheAudit();
		if (bot.guilds.cache.size >= 250 &&
		(((process.memoryUsage().rss / (1024 ** 2)) * 1.2) >= bot.guilds.cache.size)) {
			logger.log('Memory threshold reached, restarting.');
			shutdown.run();
		}
	}, 1000 * 60 * 60);

	logger.log(`Startup time: ${((Date.now() - bot.startedAt) / 1000).toFixed(2)}s`);
	delete bot.startedAt;
};