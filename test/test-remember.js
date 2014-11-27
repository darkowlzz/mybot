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
  plugins: ['remember']
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

describe('test remember plugin', function() {
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

  describe('test remember', function() {
    it('should reply ok when saved', function(done) {
      this.timeout(40000);
      testbot.say(testbot.channels[0],
                  realbot.nick + ': !remember foo is bar');
      waitAlittle()
      .then(function(result) {
        testbot.buffer[testbot.channels[0]].should.containEql('ok!');
        done();
      })
      .catch(function(err) {
        done(err);
      });
    });

    it('should answer correctly', function(done) {
      this.timeout(40000);
      testbot.say(testbot.channels[0],
                  realbot.nick + ': foo?');
      waitAlittle()
      .then(function(result) {
        testbot.buffer[testbot.channels[0]].should.containEql('bar');
        done();
      })
      .catch(function(err) {
        done(err);
      });
    });

    it('should reply huh?', function(done) {
      this.timeout(40000);
      testbot.say(testbot.channels[0],
                  realbot.nick + ': YOLO?');
      waitAlittle()
      .then(function(result) {
        testbot.buffer[testbot.channels[0]].should.containEql('huh?');
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
