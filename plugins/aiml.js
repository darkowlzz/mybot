var fs = require('fs');
var _ = require('underscore');
var AIMLInterpreter = require('aimlinterpreter');

/**
 * LoadAIML
 *
 * @param {Object} option
 *    If no argument is passed, the default aiml files are loaded.
 *    The argument should be a list of filepath to be loaded.
 *    e.g.: ['file1.aiml', 'file2.aiml']
 */

exports.name = 'aiml';
exports.type = 'event';
exports.events = ['message'];

var aimlFiles;
/*
if (option === undefined) {
  option = 'all';
}
else if (typeof(option) === 'object') {
  aimlFiles = option;
}
*/
var that = this;
var aimlInterpreter = new AIMLInterpreter(); //{name: that.nick}
var option = 'all';

if (option === 'all') {
  aimlFiles = fs.readdirSync('./aiml/');
  aimlFiles = _.map(aimlFiles, function(file){ return './aiml/' + file;});
  aimlInterpreter.loadAIMLFilesIntoArray(aimlFiles);
}
else {
  aimlInterpreter.loadAIMLFilesIntoArray(aimlFiles);
}

exports.help = 'AIML loader help';

exports.message = function(from, to, text) {
  var self = this;
  var tempText = text.split(' ');
  // checking just the first word to avoid mid sentence mentions
  if (_.first(tempText).indexOf(self.nick.toLowerCase()) > -1) {
    text = text.split(':');  // get rid of mentioned name
    text.shift();
    text = text.join(':').trim();
    aimlInterpreter.findAnswerInLoadedAIMLFiles(
        text, function(answer, wildCardArray) {
          self.say(to, from + ': ' + answer);
        });
  }
}
