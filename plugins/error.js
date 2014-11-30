exports.type = 'event';

exports.events = ['error'];

exports.help = 'Error:\n' +
               'Listens to error events and log them to console.';

exports.error = function(message) {
  console.log('error: ' + message);
};
