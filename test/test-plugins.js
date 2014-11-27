'use strict';

var Q = require('q');
var Bot = require('../');
var should = require('should');

var nick1 = 'realbot' + parseInt(Math.random()*100);
var nick2 = 'testbot' + parseInt(Math.random()*100);

var config1 = {
  nick: nick1,
  channels: ['#hello'],
  server: '127.0.0.1',
  plugins: ['remember', 'fortune']
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

describe('test plugins', function() {
  var realbot, testbot;

  before(function(done) {
    this.timeout(85000);
    realbot = new Bot(config1);
    testbot = new Bot(config2);

    return Q.try(function() {
      return realbot.connect();
    })
    .then(function(result) {
      return testbot.connect();
    })
    .then(function(result) {
      done();
    })
    .catch(function(err) {
      done(err);
    });
  });

  describe('test plugins', function() {
    it('plugins should be present', function() {
      realbot.plugins.should.containEql('fortune');
      realbot.plugins.should.containEql('remember');
    });

    it('should list loaded plugins', function(done) {
      this.timeout(40000);
      testbot.say(testbot.channels[0], realbot.nick + ' help');
      waitAlittle()
      .then(function(result) {
        testbot.buffer[testbot.channels[0]].should.containEql('remember fortune');
        done();
      })
      .catch(function(err) {
        done(err);
      });
    });

    it('!help <pluginName> should reply description', function(done) {
      this.timeout(40000);
      testbot.say(testbot.channels[0], realbot.nick + ' !help fortune');
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

  after(function() {
    realbot.kill();
    testbot.kill();
  });
});
