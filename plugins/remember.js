var _ = require('underscore');
var Datastore = require('nedb');

/**
 * Remember definition
 */

exports.events = ['message'];

var file;
if (typeof(option) == 'string') {
  file = option;
}
else {
  file = './remember.db';
}

var db = new Datastore({ filename: file, autoload: true});


exports.help = 'remember: \n' +
               'This plugin enables the bot to remember definitions.\n' +
               'Remember Syntax:\n'+
               '<botname> !remember <foo> is <bar>\n' +
               'Recall Syntax:\n' +
               '<botname> <foo>?';

exports.message = function(from, to, text) {
  // WARNING!! Shitty code below. Need refactoring.
  text = text.toLowerCase();
  var self = this;
  var tempText = text.split(' ');
  if (_.first(tempText).indexOf(self.nick.toLowerCase()) > -1) {
    // Look for the pattern "remember x is y"
    if (tempText[1].indexOf('!remember') > -1) {
      text = text.split('!remember');
      text = text[1].trim();
      tempText = text.split(' is ');  // split "x is y"
      var key = tempText[0].trim();  // key = x
      tempText.shift();
      var value = tempText.join(' is ').trim();  // value = y
      var doc = {string: key, answer: value};
      try {
        db.insert(doc, function(err) {
          if (err) {
            console.log(err);
          }
          else {
            self.say(to, from + ': ok!');
          }
        });
      }
      catch(e) {
        console.log(e);
      }
    }
    else if (text.slice(-1) == '?'){
      text = text.split(' ');
      text.shift();
      text = text.join(' ').trim().slice(0, -1);
      try {
        db.findOne({string: text}, function(err, doc) {
          if (err) {
            console.log(err);
          }
          else {
            if (doc !== null) {
              self.say(to, doc.answer);
            }
            else {
              self.say(to, 'huh?');
            }
          }
        });
      }
      catch(e) {
        console.log(e);
      }
    }
  }
}
