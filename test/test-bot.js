var Q = require('q');
var Bot = require('../bot');
var should = require('should');

var name1 = 'realbot' + parseInt(Math.random()*100);
var name2 = 'testbot' + parseInt(Math.random()*100);

describe('test bot', function() {
  it('bot testing', function(done) {
    this.timeout(40000);

    var realbot = new Bot({name: name1});
    var testbot = new Bot({name: name2});
    realbot.connect()
    .then(function(result) {
      console.log('result is ' + result);
      return testbot.connect();
    })
    .then(function(result) {
      console.log('2nd result is ' + result);

      realbot.say('hi, my name is ' + realbot.name);
      testbot.say('hello, my name is ' + testbot.name);

      realbot.addMessageListener();
      testbot.addMessageListener();

      testbot.say('hi ' + name1);
      return Q.Promise(function(resolve, reject) {
        Q.delay(5000).then(function() {
          resolve('done');
        });
      });
    })
    .then(function(result) {
      console.log('result after delay ' + result);
      console.log('testbot buffer: ' + testbot.buffer);
      testbot.buffer.should.containEql(name2);
      (1).should.be.exactly(1);
      done();
    })
  })
});
