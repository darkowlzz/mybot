module.exports = PluginLoader;

function PluginLoader(bot) {
  var that = this;
  that.bot = bot;
}

PluginLoader.prototype.load = function(pluginName) {
  var that = this;
  var plugin = require('./plugins/' + pluginName);

  that.bot.help[pluginName] = plugin.help;
  that.bot.addMessageListener(plugin.main);
}
