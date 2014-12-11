module.exports = PluginLoader;

var fs = require('fs');
var Q = require('q');

// Constants
var PLUGIN_PATH = './plugins/';
var NOT_FOUND_CODE = 'MODULE_NOT_FOUND';
var HELP_MSG = 'Install the plugin via npm or provide the correct ' +
               'module path/name.js';


/**
 * PluginLoader class
 *
 * @param {object} The bot object.
 */
function PluginLoader(bot, moduleContext) {
  var that = this;
  that.bot = bot;
  that.moduleContext = moduleContext;
}

PluginLoader.prototype = {
  /**
   * Plugin load method.
   *
   * @param {string} Name of the plugin.
   */
  load: function(pluginName) {
    var that = this;
    that.bot.log('loading plugin: ', pluginName);

    that.getPlugin(pluginName)
    .then(function (plugin) {
      that.bot.loadedPlugins.push(plugin.name);
      // Store plugin help string
      that.bot.help[plugin.name] = plugin.help || '';
      // Run any main part of the plugin
      if (!! plugin.main) {
        plugin.main(that.bot);
      }
      // Attach any event part of the plugin
      if (plugin.type === 'event') {
        that.plugToEvent(plugin);
      }
    })
    .catch();
  },

  /**
   * Get the plugin from source. The source could be plugins/ dir or
   * node_modules.
   *
   * @param {string} Name of the plugin.
   * @return A promise object which resolves to a plugin object.
   */
  getPlugin: function (name) {
    var that = this,
        re = new RegExp('(\.js)$'),
        plugin;

    return Q.Promise(function(resolve, reject) {
      try {
        // test if it's a downloaded plugin
        if (re.test(name)) {
          plugin = that.moduleContext.require('./' + name);
          resolve(plugin);
        }
        else {
          // import built-in plugin
          plugin = require(PLUGIN_PATH + name);
          resolve(plugin);
        }
      }
      catch (e) {
        try {
          // import from node_modules
          plugin = require(name);
          resolve(plugin);
        }
        catch (e) {
          if (e.code === NOT_FOUND_CODE) {
            console.log('Plugin ' + name + ' not found.');
            console.log(HELP_MSG);
          }
          reject(new Error('Plugin not found'));
        }
      }
    });
  },

  /**
   * Plug the plugin to events.
   *
   * @param {Object} A plugin object.
   */
  plugToEvent: function (plugin) {
    var that = this;
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
};
