var _ = require('underscore');
var fortune = require('fortune-teller');

/**
 * Fortune cookies
 */

exports.events = ['message'];

exports.help = 'fortune:\n' +
               'This plugin helps the bot to retrieve fortunes.\n' +
               'Syntax: \n' +
               '<botname> !cookie';

exports.message = function (from, to, text) {
  text = text.toLowerCase();
  var self = this;
  var tempText = text.split(' ');
  if (_.first(tempText).indexOf(self.nick.toLowerCase()) > -1) {
    if (tempText[1].indexOf('!cookie') > -1) {
      self.say(to, fortune.fortune());
    }
  }
}
