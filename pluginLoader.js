module.exports = PluginLoader;

/**
 * PluginLoader class
 *
 * @param {object} The bot object.
 */
function PluginLoader(bot) {
  var that = this;
  that.bot = bot;
}

/**
 *  Plugin load method.
 *
 *  @param {string} Name of the plugin.
 */
PluginLoader.prototype.load = function(pluginName) {
  var that = this;
  var plugin = require('./plugins/' + pluginName);

  // Store plugin help string
  that.bot.help[pluginName] = plugin.help;

  // Plug the plugin logic to the registered event listeners.
  plugin.events.forEach(function(event) {
    switch (event) {
      case 'registered': that.bot.addRegisteredListener(plugin.register);
                         break;
      case 'motd'      : that.bot.addMotdListener(plugin.motd);
                         break;
      case 'names'     : that.bot.addNamesListener(plugin.names);
                         break;
      case 'topic'     : that.bot.addTopicListener(plugin.topic);
                         break;
      case 'join'      : that.bot.addJoinListener(plugin.join);
                         break;
      case 'part'      : that.bot.addPartListener(plugin.part);
                         break;
      case 'quit'      : that.bot.addQuitListener(plugin.quit);
                         break;
      case 'kick'      : that.bot.addKickListener(plugin.kick);
                         break;
      case 'kill'      : that.bot.addKillListener(plugin.kill);
                         break;
      case 'message'   : that.bot.addMessageListener(plugin.message);
                         break;
      case 'notice'    : that.bot.addNoticeListener(plugin.notice);
                         break;
      case 'ping'      : that.bot.addPingListener(plugin.ping);
                         break;
      case 'pm'        : that.bot.addPmListener(plugin.pm);
                         break;
      case 'ctcp'      : that.bot.addCtcpListener(plugin.ctcp);
                         break;
      case 'nick'      : that.bot.addNickListener(plugin.nick);
                         break;
      case 'invite'    : that.bot.addInviteListener(plugin.invite);
                         break;
      case '+mode'     : that.bot.addPlusModeListener(plugin.plusMode);
                         break;
      case '-mode'     : that.bot.addMinusModeListener(plugin.minusMode);
                         break;
      case 'whois'     : that.bot.addWhoisListener(plugin.whois);
                         break;
      case 'channellist_start': 
        that.bot.addChannellistStartListener(plugin.channellistStart);
        break;
      case 'channellist_item':
        that.bot.addChannellistItemListener(plugin.channellistItem);
        break;
      case 'channellist':
        that.bot.addChannellistListener(plugin.channellist);
        break;
      case 'error'     : that.bot.addErrorListener(plugin.error);
                         break;
    }
  });
}
