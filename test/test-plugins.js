'use strict';

var Q = require('q');
var Bot = require('../bot');
var should = require('should');

var nick1 = 'realbot' + parseInt(Math.random()*100);
var nick2 = 'testbot' + parseInt(Math.random()*100);

var config1 = {
  nick: nick1,
  channels: ['#hello'],
  server: '127.0.0.1',
  plugins: ['remember', 'cookies']
};

var config2 = {
  nick: nick2,
  channels: ['#hello'],
  server: '127.0.0.1'
};

// A short blocking delay
function waitAlittle() {
  return Q.Promise(function(resolve, reject) {
    Q.delay(5000).then(function() {
      resolve('done');
    });
  });
}

describe('test help', function() {
  var realbot, testbot;

  before(function(done) {
    this.timeout(45000);
    realbot = new Bot(config1);
    testbot = new Bot(config2);

    return Q.try(function() {
      return realbot.connect();
    })
    .then(function(result) {
      return testbot.connect();
    })
    .then(function(result) {
      testbot.addMessageListener();
      done();
    })
    .catch(function(err) {
      done(err);
    });
  });

  describe('test plugins', function() {
    it('plugins should be present', function() {
      realbot.plugins.should.containEql('cookies');
      realbot.plugins.should.containEql('remember');
    });

    it('should list loaded plugins', function(done) {
      this.timeout(40000);
      testbot.say(testbot.channels[0], realbot.nick + ' help');
      waitAlittle()
      .then(function(result) {
        testbot.buffer[testbot.channels[0]].should.containEql('remember cookies');
        done();
      })
      .catch(function(err) {
        done(err);
      });
    });

    it('!help <pluginName> should reply description', function(done) {
      this.timeout(40000);
      testbot.say(testbot.channels[0], realbot.nick + ' !help cookies');
      waitAlittle()
      .then(function(result) {
        testbot.buffer[testbot.channels[0]].should.containEql('<botname> !cookie');
        done();
      })
      .catch(function(err) {
        done(err);
      });
    });
  });
});
