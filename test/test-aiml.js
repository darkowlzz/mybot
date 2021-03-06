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
  plugins: ['aiml']
};

var config2 = {
  nick: nick2,
  channels: ['#hello'],
  server: '127.0.0.1'
};


describe('test aiml plugin', function() {
  var realbot, testbot;

  before(function(done) {
    this.timeout(85000);
    realbot = new Bot(config1);
    testbot = new Bot(config2);

    return Q.try(function() {
      return realbot.connectAll();
    })
    .then(function(result) {
      return testbot.connectAll();
    })
    .then(function(result) {
      done();
    })
    .catch(function(err) {
      done(err);
    });
  });

  describe('test aiml', function() {
    it('should reply as per AIML', function(done) {
      this.timeout(40000);

      testbot.say(testbot.channels[0], realbot.nick +
                  ': earth is rounded');
      testbot.waitAlittle()
      .then(function(result) {
        testbot.buffer[testbot.channels[0]].should.containEql('Definitely.');
        testbot.say(testbot.channels[0], realbot.nick +
                    ': who created aiml?');
        return testbot.waitAlittle();
      })
      .then(function(result) {
        testbot.buffer[testbot.channels[0]].should.containEql(
                              'Dr. Richard S. Wallace created AIML.');
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
