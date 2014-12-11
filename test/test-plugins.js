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
  plugins: ['remember', 'mybot-fortune']
};

var config2 = {
  nick: nick2,
  channels: ['#hello'],
  server: '127.0.0.1'
};

var config3 = {
  nick: 'xxzzyy',
  channels: ['#hello'],
  server: '127.0.0.1',
  plugins: ['fooplugin.js']
};


describe('test plugins', function() {
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

  describe('test plugins', function() {
    it('plugins should be present', function() {
      realbot.loadedPlugins.should.containEql('fortune');
      realbot.loadedPlugins.should.containEql('remember');
    });

    it('should list loaded plugins', function(done) {
      this.timeout(40000);
      testbot.say(testbot.channels[0], realbot.nick + ' help');
      testbot.waitAlittle()
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
      testbot.waitAlittle()
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

describe('test downloaded plugin', function () {
  var testbot;

  before(function() {
    testbot = new Bot(config3);
  });

  describe('load downloaded plugin', function() {
    it ('should load downloaded plugin', function () {
      testbot.help['fooplugin'].should.containEql('dummy plugin');
    });
  });
});
