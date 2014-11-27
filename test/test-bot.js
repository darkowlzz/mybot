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

// A short blocking delay
function waitAlittle() {
  return Q.Promise(function(resolve, reject) {
    Q.delay(5000).then(function() {
      resolve('done');
    });
  });
}


describe('test bot', function() {
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
      realbot.addPartListener();
      realbot.addJoinListener();
      testbot.addPartListener();
      testbot.addJoinListener();

      realbot.say(realbot.channels[0], 'hi, my name is ' + realbot.nick);
      testbot.say(testbot.channels[0], 'hello, my name is ' + testbot.nick);

      done();
    })
    .catch(function(err) {
      done(err);
    });
  });

  describe('test mention', function() {
    it('should reply when greeted', function(done) {
      this.timeout(40000);
      testbot.say(testbot.channels[0], realbot.nick + ' hi');
      testbot.say(testbot.channels[1], realbot.nick + ' hi');
      waitAlittle()
      .then(function(result) {
        testbot.buffer[testbot.channels[0]].should.containEql(testbot.nick);
        testbot.buffer[testbot.channels[1]].should.containEql(testbot.nick);
        done();
      })
      .catch(function(err) {
        done(err);
      });
    });
  });

  describe('test part', function() {
    it('should listen to part event', function(done) {
      this.timeout(40000);
      realbot.part(realbot.channels[0], 'gtg');
      waitAlittle()
      .then(function(result) {
        testbot.buffer[testbot.channels[0]].should.containEql(realbot.nick);
        testbot.buffer[testbot.channels[0]].should.containEql('gtg');
        done();
      })
      .catch(function(err) {
        done(err);
      });
    });
  });

  describe('test join', function() {
    it('should listen to join event', function(done) {
      this.timeout(40000);
      realbot.join(realbot.channels[0]);
      waitAlittle()
      .then(function(result) {
        testbot.buffer[testbot.channels[0]].should.containEql(realbot.nick);
        testbot.buffer[testbot.channels[0]].should.containEql('joined');
        done();
      })
      .catch(function(err) {
        done(err);
      });
    });
  });

  describe('test custom message listener', function() {
    it('should reply as per the defined action', function(done) {
      this.timeout(40000);

      realbot.addMessageListener(function(from, to, text) {
        if (text.indexOf(this.nick) > -1) {
          if (text.indexOf('what is irc') > -1) {
            this.say(to, 'Internet Relay Chat');
          }
        }
      });

      waitAlittle()
      .then(function(result) {
        testbot.say(testbot.channels[0], realbot.nick + ' what is irc?');
        return waitAlittle();
      })
      .then(function(result) {
        testbot.buffer[testbot.channels[0]].should.containEql(
                                           'Internet Relay Chat');
        done();
      })
      .catch(function(err) {
        done(err);
      });
    });
  });

  /*
  describe('test loadAIML', function() {
    it('should reply as per AIML', function(done) {
      this.timeout(40000);

      realbot.loadAIML();
      waitAlittle()
      .then(function(result) {
        testbot.say(testbot.channels[0], realbot.nick +
                    ': earth is rounded');
        return waitAlittle();
      })
      .then(function(result) {
        testbot.buffer[testbot.channels[0]].should.containEql('Definitely.');
        testbot.say(testbot.channels[0], realbot.nick +
                    ': who created aiml?');
        return waitAlittle();
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
  */

  after(function() {
    realbot.kill();
    testbot.kill();
  });
});


/*
describe('test fortune cookie', function() {
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
      realbot.fortune();
      done();
    })
    .catch(function(err) {
      done(err);
    });
  });

  describe('test !cookie', function() {
    it('should paste a fortune cookie', function(done) {
      this.timeout(40000);
      testbot.say(testbot.channels[0],
                  realbot.nick + ': !cookie');
      waitAlittle()
      .then(function(result) {
        testbot.buffer[testbot.channels[0]].should.not.be.empty;
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
*/
