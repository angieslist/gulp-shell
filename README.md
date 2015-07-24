# gulp-shell

> A handy command line interface for gulp now with asynchronous goodness
> Forked from [gulp-shell](https://github.com/sun-zheng-an/gulp-shell)



## Usage

```js
var gulp  = require('gulp')
var shell = require('gulp-shell')

gulp.task('example', function () {
  return gulp.src('*.js', {read: false})
    .pipe(shell([
      'echo <%= f(file.path) %>',
      'ls -l <%= file.path %>'
    ], {
      templateData: {
        f: function (s) {
          return s.replace(/$/, '.bak')
        }
      }
    }))
})
```

If you just want to execute a series of commands only once, starting the stream with `gulp.src('')` should do the trick.

Or you can use this shorthand:

```js
gulp.task('shorthand', shell.task([
  'echo hello',
  'echo world'
]))
```

You can find more examples in the [gulpfile][] of this project.

[gulpfile]: https://github.com/sun-zheng-an/gulp-shell/blob/master/gulpfile.js

## API

### shell(commands, options) or shell.task(commands, options)

#### commands

type: `Array` or `String`

A command can be a [template][] which can be interpolated by some [file][] info (e.g. `file.path`).

[template]: http://lodash.com/docs#template
[file]:     https://github.com/wearefractal/vinyl

#### options.errorMessage

type: `String`

default: ``Command `<%= command %>` failed with exit code <%= error.code %>``

You can add a custom error message for when the command fails.
This can be a [template][] which can be interpolated with the current `command`, some [file][] info (e.g. `file.path`) and some [error][] info (e.g. `error.code`).

[error]: http://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback

#### options.ignoreErrors

type: `Boolean`

default: `false`

By default, it will emit an `error` event when the command finishes unsuccessfully.

#### options.quiet

type: `Boolean`

default: `false`

By default, it will print the command output.

#### options.cwd

type: `String`

default: [`process.cwd()`](http://nodejs.org/api/process.html#process_process_cwd)

Sets the current working directory for the command.

#### options.templateData

type: `Object`

The data that can be accessed in template.

#### options.maxBuffer

type: `Number`

default: 16MB(16 * 1024 * 1024)

You won't need to set this option unless you encounter a "stdout maxBuffer exceeded" error.

#### options.timeout

type: `Number`

default: undefined (no timeout)

The maximum amount of time in milliseconds the process is allowed to run.

#### options.env

type: `Object`

By default, all the commands will be executed in an environment with all the variables in [`process.env`](http://nodejs.org/api/process.html#process_process_env) and `PATH` prepended by `./node_modules/.bin` (allowing you to run executables in your Node's dependencies).

You can override any environment variables with this option.

For example, setting it to `{PATH: process.env.PATH}` will reset the `PATH` if the default one brings your some troubles.

#### options.logMessage

type: `String`

An easy way to print out a log statement when a task has finished. This can be a templated string using the file object or can be a normal string.

```js
shell(['pwd'], {logMessage:'Finished processing <%&= file.realtive %>'})
```

##Testing
 Tests are in the test folder. They can be run with gulp
 ```shell
 gulp test
```
