'use strict';
var util = require('util');
var path = require('path');
var spawn = require('child_process').spawn;
var yeoman = require('yeoman-generator');
var _ = require('underscore.string');

var AppGenerator = module.exports = function Appgenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  // setup the test-framework property, Gruntfile template will need this
  this.testFramework = options['test-framework'] || 'mocha';

  // for hooks to resolve on mocha by default
  if (!options['test-framework']) {
    options['test-framework'] = 'mocha';
  }

  // resolved to mocha by default (could be switched to jasmine for instance)
  this.hookFor('test-framework', { as: 'app' });

  //this.indexFile = this.readFileAsString(path.join(this.sourceRoot(), 'index.html'));
  this.mainCoffeeFile = 'console.log "\'Allo from CoffeeScript!"';

  this.on('end', function () {
    this.installDependencies({ skipInstall: options['skip-install'] });
  });

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(AppGenerator, yeoman.generators.Base);

AppGenerator.prototype.askFor = function askFor() {
  var cb = this.async();

  // welcome message
  console.log(this.yeoman);
  console.log('Out of the box I include HTML5 Boilerplate, jQuery and Modernizr.');

  var prompts = [{
    name: 'masterName',
    message: 'What is the name of your master file?'
  },
  {
    type: 'confirm',
    name: 'compassBootstrap',
    message: 'Would you like to include Twitter Bootstrap for Sass?',
    default: true
  },
  // {
  //   type: 'confirm',
  //   name: 'includeRequireJS',
  //   message: 'Would you like to include RequireJS (for AMD support)?',
  //   default: true
  // },
  {
    type: 'confirm',
    name: 'autoprefixer',
    message: 'Would you like to use autoprefixer for your CSS?',
    default: false
  },
  {
    name: 'webDavProperty',
    message: "Provide a property name for the WebDav Root Url (we're looking in ENV and .webdavconf)"
  }
  ];

  this.prompt(prompts, function (props) {
    // manually deal with the response, get back and store the results.
    // we change a bit this way of doing to automatically do this in the self.prompt() method.
    this.compassBootstrap = props.compassBootstrap;
    this.includeRequireJS = false;//props.includeRequireJS;
    this.autoprefixer = props.autoprefixer;
    this.masterName = props.masterName;
    this.webDavProperty = props.webDavProperty;
    this.masterSlug = _.slugify(this.masterName);

    cb();
  }.bind(this));
};

AppGenerator.prototype.gruntfile = function gruntfile() {
  this.template('Gruntfile.coffee');
};

AppGenerator.prototype.webDavConfig = function webDavConfig(){
  this.template('_webdavconf.json','.webdavconf.json');
}

AppGenerator.prototype.packageJSON = function packageJSON() {
  this.template('_package.json', 'package.json');
};

AppGenerator.prototype.git = function git() {
  this.copy('gitignore', '.gitignore');
  this.copy('gitattributes', '.gitattributes');
};

AppGenerator.prototype.bower = function bower() {
  this.copy('bowerrc', '.bowerrc');
  this.copy('_bower.json', 'bower.json');
};

AppGenerator.prototype.jshint = function jshint() {
  this.copy('jshintrc', '.jshintrc');
};

AppGenerator.prototype.editorConfig = function editorConfig() {
  this.copy('editorconfig', '.editorconfig');
};

AppGenerator.prototype.h5bp = function h5bp() {
  this.copy('favicon.ico', 'app/images/favicon.ico');
};

AppGenerator.prototype.bootstrapImg = function bootstrapImg() {
  if (this.compassBootstrap) {
    this.copy('glyphicons-halflings.png', 'app/images/glyphicons-halflings.png');
    this.copy('glyphicons-halflings-white.png', 'app/images/glyphicons-halflings-white.png');
  }
};

AppGenerator.prototype.bootstrapJs = function bootstrapJs() {
  // TODO: create a Bower component for this
  if (this.compassBootstrap) {
    this.copy('bootstrap.js', 'app/scripts/vendor/bootstrap.js');
  }
};

AppGenerator.prototype.mainStylesheet = function mainStylesheet() {
  if (this.compassBootstrap) {
    this.copy('main.scss', 'app/styles/main.scss');
  } else {
    this.copy('main.css', 'app/styles/main.css');
  }
};

AppGenerator.prototype.jadeFiles = function jadeFiles() {
  this.template('master.jade', 'app/jade/' + this.masterSlug + '.jade');
  this.template('layout.jade', 'app/jade/layout.jade');
};

// AppGenerator.prototype.writeIndex = function writeIndex() {
//   // prepare default content text
//   var defaults = ['HTML5 Boilerplate'];
//   var contentText = [
//     '        <div class="container">',
//     '            <div class="hero-unit">',
//     '                <h1>\'Allo, \'Allo!</h1>',
//     '                <p>You now have</p>',
//     '                <ul>'
//   ];
//
//   if (!this.includeRequireJS) {
//     this.indexFile = this.appendScripts(this.indexFile, 'scripts/main.js', [
//       'bower_components/jquery/jquery.js',
//       'scripts/main.js'
//     ]);
//
//     this.indexFile = this.appendFiles({
//       html: this.indexFile,
//       fileType: 'js',
//       optimizedPath: 'scripts/coffee.js',
//       sourceFileList: ['scripts/hello.js'],
//       searchPath: '.tmp'
//     });
//   }
//
//   if (this.compassBootstrap) {
//     defaults.push('Twitter Bootstrap');
//   }
//
//   if (this.compassBootstrap && !this.includeRequireJS) {
//     // wire Twitter Bootstrap plugins
//     this.indexFile = this.appendScripts(this.indexFile, 'scripts/plugins.js', [
//       'bower_components/sass-bootstrap/js/bootstrap-affix.js',
//       'bower_components/sass-bootstrap/js/bootstrap-alert.js',
//       'bower_components/sass-bootstrap/js/bootstrap-dropdown.js',
//       'bower_components/sass-bootstrap/js/bootstrap-tooltip.js',
//       'bower_components/sass-bootstrap/js/bootstrap-modal.js',
//       'bower_components/sass-bootstrap/js/bootstrap-transition.js',
//       'bower_components/sass-bootstrap/js/bootstrap-button.js',
//       'bower_components/sass-bootstrap/js/bootstrap-popover.js',
//       'bower_components/sass-bootstrap/js/bootstrap-typeahead.js',
//       'bower_components/sass-bootstrap/js/bootstrap-carousel.js',
//       'bower_components/sass-bootstrap/js/bootstrap-scrollspy.js',
//       'bower_components/sass-bootstrap/js/bootstrap-collapse.js',
//       'bower_components/sass-bootstrap/js/bootstrap-tab.js'
//     ]);
//   }
//
//   if (this.includeRequireJS) {
//     defaults.push('RequireJS');
//   }
//
//   // iterate over defaults and create content string
//   defaults.forEach(function (el) {
//     contentText.push('                    <li>' + el  +'</li>');
//   });
//
//   contentText = contentText.concat([
//     '                </ul>',
//     '                <p>installed.</p>',
//     '                <h3>Enjoy coding! - Yeoman</h3>',
//     '            </div>',
//     '        </div>',
//     ''
//   ]);
//
//   // append the default content
//   this.indexFile = this.indexFile.replace('<body>', '<body>\n' + contentText.join('\n'));
// };

// TODO(mklabs): to be put in a subgenerator like rjs:app
// AppGenerator.prototype.requirejs = function requirejs() {
//   if (!this.includeRequireJS) {
//     return;
//   }
//
//   this.indexFile = this.appendScripts(this.indexFile, 'scripts/main.js', ['bower_components/requirejs/require.js'], {
//     'data-main': 'scripts/main'
//   });
//
//   // add a basic amd module
//   this.write('app/scripts/app.js', [
//     '/*global define */',
//     'define([], function () {',
//     '    \'use strict\';\n',
//     '    return \'\\\'Allo \\\'Allo!\';',
//     '});'
//   ].join('\n'));
//
//   this.template('require_main.js', 'app/scripts/main.js');
// };

AppGenerator.prototype.app = function app() {
  this.mkdir('app');
  this.mkdir('app/scripts');
  this.mkdir('app/styles');
  this.mkdir('app/images');
  this.mkdir('app/jade');
 // this.write('app/jade/' + this.masterSlug +'.jade', this.masterFile);
  this.write('app/scripts/hello.coffee', this.mainCoffeeFile);
  if (!this.includeRequireJS) {
    this.write('app/scripts/main.js', 'console.log(\'\\\'Allo \\\'Allo!\');');
  }
};
