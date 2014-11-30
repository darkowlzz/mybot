exports.type = 'event';

exports.events = ['join'];

exports.help = 'Join:\n' +
               'Listens to join events and logs into the respective ' +
               'channel buffer';

exports.join = function (channel, nick) {
  var self = this;
  if (nick !== self.nick) {
    self.buffer[channel] = nick + ' has joined';
  }
};
