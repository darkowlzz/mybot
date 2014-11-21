var Q = require('q');
var Bot = require('../bot');
var should = require('should');

var nick1 = 'realbot' + parseInt(Math.random()*100);
var nick2 = 'testbot' + parseInt(Math.random()*100);

var config1 = {
  nick: nick1,
  channels: ['#hello', '#intro'],
  server: '127.0.0.1'
};

var config2 = {
  nick: nick2,
  channels: ['#hello', '#intro'],
  server: '127.0.0.1'
};

// Create 2 bots, join 2 channels and mention each other.
describe('test bot', function() {
  it('bot testing', function(done) {
    this.timeout(40000);

    var realbot = new Bot(config1);
    var testbot = new Bot(config2);
    realbot.connect()
    .then(function(result) {
      return testbot.connect();
    })
    .then(function(result) {
      realbot.addMessageListener();
      testbot.addMessageListener();

      realbot.say(realbot.channels[0], 'hi, my name is ' + realbot.nick);
      testbot.say(testbot.channels[0], 'hello, my name is ' + testbot.nick);

      testbot.say(testbot.channels[0], 'hi ' + realbot.nick);
      testbot.say(testbot.channels[1], 'hi ' + realbot.nick);

      return Q.Promise(function(resolve, reject) {
        Q.delay(5000).then(function() {
          resolve('done');
        });
      });
    })
    .then(function(result) {
      testbot.buffer[testbot.channels[0]].should.containEql(testbot.nick);
      testbot.buffer[testbot.channels[1]].should.containEql(testbot.nick);
      done();
    })
  })
});
