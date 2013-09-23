module.exports = function(grunt) {
	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		qunit: {
			all: ['tests/index.html']
		},
		watch: {
			files: ['tests/*.js', 'tests/*.html', 'src/*.js'],
			tasks: ['qunit']
		}
	});

	// Task to run tests
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.registerTask('default', 'qunit');
};