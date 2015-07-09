var _ = require('lodash');
var async = require('async');
var exec = require('child_process').exec;
var gutil = require('gulp-util');
var path = require('path');
var through = require('through2');
var through_concurrent = require('through2-concurrent');

var PLUGIN_NAME = 'gulp-async-shell'

// Returns a function that async.parallel will use, each function is its own shell command
function genShellExecFunction(command, file, options) {
  return function (callback) {
    var context = _.extend({file: file}, options.templateData)
    command = gutil.template(command, context)

    var child = exec(command, {
      env: options.env,
      cwd: options.cwd,
      maxBuffer: options.maxBuffer,
      timeout: options.timeout
    }, function (error, stdout, stderr) {
      process.stdin.unpipe(child.stdin)
      process.stdin.resume()
      process.stdin.pause()

      if (error && !options.ignoreErrors) {
        error.stdout = stdout
        error.stderr = stderr

        var errorContext = _.extend({
          command: command,
          file: file,
          error: error
        }, options.templateData)

        error.message = gutil.template(options.errorMessage, errorContext)
      }
      var date = new Date()
      var hours = date.getHours()
      hours = hours <= 9 ? "0"+hours : ""+hours
      var time = hours+":"+date.getMinutes()+":"+date.getSeconds()
      if(!options.quiet && options.logMessage){
        var compiledTemplate = _.template(options.logMessage);
        templatedMessage = compiledTemplate({'file':file})
        console.log("["+time+"] "+ templatedMessage)
    }
      callback(options.ignoreErrors ? null : error, null)
    });

    // This fixes the MaxListeners problem
    process.stdin.setMaxListeners(0)
    process.stdout.setMaxListeners(0)
    process.stderr.setMaxListeners(0)

    process.stdin.resume()
    process.stdin.setEncoding('utf8')
    process.stdin.pipe(child.stdin)

    if (!options.quiet) {

      child.stdout.pipe(process.stdout)
      child.stderr.pipe(process.stderr)
    }
  }
}


function shell(commands, options) {
  if (typeof commands === 'string') {
    commands = [commands]
  }

  if (!Array.isArray(commands)) {
    throw new gutil.PluginError(PLUGIN_NAME, 'Missing commands')
  }

  options = _.extend({
    ignoreErrors: false,
    errorMessage: 'Command `<%= command %>` failed with exit code <%= error.code %>',
    quiet: false,
    cwd: process.cwd(),
    maxBuffer: 16 * 1024 * 1024
  }, options)

  var pathToBin = path.join(process.cwd(), 'node_modules/.bin')
  var pathName = /^win/.test(process.platform) ? 'Path' : 'PATH'
  var newPath = pathToBin + path.delimiter + process.env[pathName]
  options.env = _.extend(process.env, _.object([[pathName, newPath]]), options.env)

  var stream = through_concurrent.obj({maxConcurrency:10},function (file, unused, done) {
    var self = this

    var tasks = []
    for (var i in commands) {
      tasks.push(genShellExecFunction(commands[i], file, options))
    }

    async.parallel(tasks, function (error, result) {
      if (error) {
        self.emit('error', new gutil.PluginError({
          plugin: PLUGIN_NAME,
          message: error.message
        }))
      } else {
        self.push(file)
      }
      done()
    })

  })
  stream.resume()

  return stream
}

shell.task = function (commands, options) {
  return function () {
    var stream = shell(commands, options)

    stream.write(new gutil.File())
    stream.end()

    return stream
  }
}

module.exports = shell
