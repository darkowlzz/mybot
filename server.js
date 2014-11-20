var http = require('http');
var irc = require('irc');
var request = require('request');
var port = process.env.PORT || 5000;

CHANNEL_NAME = '#hello';
BOT_NAME = 'dummybot';

var client = new irc.Client('127.0.0.1', BOT_NAME, {
  autoConnect: false
});

client.connect(5, function(input) {
  console.log('Connected!');
  client.join(CHANNEL_NAME, function(input) {
    console.log('joined ' + CHANNEL_NAME);
  });
});

client.addListener('message', function(from, to, text) {
  console.log(from + ' => ' + to + ': ' + text);

  if (text.indexOf(BOT_NAME) > -1) {
    if (text.indexOf('love you') > -1) {
      client.say(to, 'love you too ' + from);
    }
    else if (text.indexOf('hi') > -1) {
      client.say(to, 'hello ' + from);
    }
  }
});

var server = http.createServer(function(request, response) {
  response.writeHeader(200, {'Content-Type': 'text/plain'});
  response.write('Hello World!');
  response.end();
});

server.listen(port);
console.log('Server running on ' + port);
