var _ = require('underscore');

/**
 * Introduction
 *
 * Performs general greetings and help related tasks.
 */

exports.events = ['message'];

exports.help = 'Intro:\n' +
               'Enables listening to all the messages in all the channels' +
               ' (excluding own messages).\n' +
               'Commands:\n' +
               'hi - replies with greetings message\n' +
               'help - replies with help instructions';

exports.message = function (from, to, text) {
  var self = this;
  if (from !== self.nick) {
    self.buffer[to] = text;
  }

  text = text.split(' ');
  if (_.first(text).indexOf(self.nick) > -1) {
    if (text[1] == 'hi') {
      self.say(to, 'hello there ' + from);
    }
    else if (text[1] == 'help') {
      var helpText = 'Need help? Query help on any of the ' +
                     'loaded plugins as\n' +
                     '<mynick> !help <pluginName>\n';
      var listPlugins = 'Following are the available plugins:\n';
      self.plugins.forEach(function(plugin) {
        listPlugins += plugin + ' ';
      })
      self.say(to, from + ': ' + helpText + listPlugins);
    }
    else if (text[1] === '!help') {
      try {
        self.say(to, from + ': ' + self.help[text[2]]);
      }
      catch(e) {
        self.say(to, from + ': plugin not found');
      }
    }
  }
}
