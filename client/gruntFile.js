module.exports = function(grunt) {

  // grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-recess');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['jshint','uglify','recess']);

  // Project configuration.
  grunt.initConfig({
    src: {
      js: ['vendor/**/*.js', 'src/main.js', 'src/**/*.js'],
      less: ['less/bootstrap.less']
    },
    targetdir: '../server-php/public_html',
    uglify: {
      options: {
        mangle: false
      },
      siteJS: {
        files: { '<%= targetdir %>/js/app.min.js': '<%= src.js %>' }
        // src: ['<%= src.js %>'],
        // dest: '<%= targetdir %>/js/app.min.js'
      }
    },
    recess: {
      min: {
        files: {
          '<%= targetdir %>/css/bootstrap.min.css': ['<%= src.less %>'] },
        options: {
          compress: true
        }
      }
    },
    watch: {
      scripts: {
        files: ['<%= src.js %>'],
        tasks: 'uglify'
      }
    },
    jshint:{
      files:['gruntFile.js', 'src/**/*.js'],
      options:{
        globals:{}
      }
    }
  });

};
