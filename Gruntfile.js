/*global module:false*/
module.exports = function(grunt) {
    var jsFiles = [ "deps.js", "target/classes/stjs.js", "target/classes/rtalkjs.js"];

    grunt
            .initConfig({
                watch : {
                    scripts : {
                        files : jsFiles,
                        tasks : [ 'default' ]
                    }
                },
                concat : {
                    "bundle" : {
                        src : jsFiles,
                        dest : "rtalk.js"
                    }
                }
            });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', [ 'concat:bundle']);
};
