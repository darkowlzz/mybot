exports.events = ['part'];

exports.help = 'Part:\n' +
               'Listens to part events and logs into the respective ' +
               'channel buffer';

exports.part = function (channel, nick, reason) {
  var self = this;
  if (nick !== self.nick) {
    self.buffer[channel] = nick + ' has left(' + reason + ')';
  }
};
