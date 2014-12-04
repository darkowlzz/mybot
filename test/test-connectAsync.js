'use strict';

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


describe('test async connect', function () {
  var realbot, testbot;

  before(function (done) {
    this.timeout(85000);
    realbot = new Bot(config1);
    testbot = new Bot(config2);

    realbot.connectAllAsync(function () {
      testbot.connectAllAsync(function () {
        realbot.say(realbot.channels[0], 'async hi');
        done();
      });
    });
  });

  describe('test message', function () {
    it ('should listen to message', function (done) {
      this.timeout(40000);
      testbot.waitAlittle()
      .then(function (result) {
        testbot.buffer[testbot.channels[0]].should.containEql('async hi');
        done();
      })
      .catch(function (err) {
        done(err);
      });
    });
  });

  after(function() {
    realbot.kill();
    testbot.kill();
  });
});
