/* global module */
module.exports = function(grunt) {
    // Project configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: ['Gruntfile.js', 'service-worker.js', 'src/*.js'],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        connect: {
            server: {
                options: {
                    port: 8080
                }
            }
        },
        watch: {
            scripts: {
                files: ['**/*.js', '!**/node_modules/**', '**/node_modules/dwv/**'],
                options: {
                    spawn: false,
                    livereload: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Task to run tests
    grunt.registerTask('test', ['jshint']);
    grunt.registerTask('start', ['connect', 'watch']);
};
