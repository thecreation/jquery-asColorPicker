'use strict';

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %>\n' + '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' + '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' + ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
        // Task configuration.
        clean: {
            files: ['dist']
        },
        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            dist: {
                src: ['src/jquery-asColorInput-core.js', 'src/jquery-asColorInput-keyboard.js', 'src/jquery-asColorInput-hAlpha.js', 'src/jquery-asColorInput-hHue.js', 'src/jquery-asColorInput-alpha.js', 'src/jquery-asColorInput-check.js', 'src/jquery-asColorInput-hex.js', 'src/jquery-asColorInput-hue.js', 'src/jquery-asColorInput-info.js', 'src/jquery-asColorInput-palettes.js', 'src/jquery-asColorInput-preview.js', 'src/jquery-asColorInput-saturation.js', 'src/jquery-asColorInput-gradient.js'],
                dest: 'dist/<%= pkg.name %>.js'
            },

        },
        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            dist: {
                src: '<%= concat.dist.dest %>',
                dest: 'dist/<%= pkg.name %>.min.js'
            },
            keyboard: {
                src: 'src/jquery-asColorInput-keyboard.js',
                dest: 'dist/jquery-asColorInput-keyboard.min.js'
            },
            hAlpha: {
                src: 'src/jquery-asColorInput-hAlpha.js',
                dest: 'dist/jquery-asColorInput-hAlpha.min.js'
            },
            hHue: {
                src: 'src/jquery-asColorInput-hHue.js',
                dest: 'dist/jquery-asColorInput-hHue.min.js'
            },
            alpha: {
                src: 'src/jquery-asColorInput-alpha.js',
                dest: 'dist/jquery-asColorInput-alpha.min.js'
            },
            check: {
                src: 'src/jquery-asColorInput-check.js',
                dest: 'dist/jquery-asColorInput-check.min.js'
            },
            hex: {
                src: 'src/jquery-asColorInput-hex.js',
                dest: 'dist/jquery-asColorInput-hex.min.js'
            },
            hue: {
                src: 'src/jquery-asColorInput-hue.js',
                dest: 'dist/jquery-asColorInput-hue.min.js'
            },
            info: {
                src: 'src/jquery-asColorInput-info.js',
                dest: 'dist/jquery-asColorInput-info.min.js'
            },
            palettes: {
                src: 'src/jquery-asColorInput-palettes.js',
                dest: 'dist/jquery-asColorInput-palettes.min.js'
            },
            preview: {
                src: 'src/jquery-asColorInput-preview.js',
                dest: 'dist/jquery-asColorInput-preview.min.js'
            },
            saturation: {
                src: 'src/jquery-asColorInput-saturation.js',
                dest: 'dist/jquery-asColorInput-saturation.min.js'
            },
            gradient: {
                src: 'src/jquery-asColorInput-gradient.js',
                dest: 'dist/jquery-asColorInput-gradient.min.js'
            }

        },

        jshint: {
            gruntfile: {
                options: {
                    jshintrc: '.jshintrc'
                },
                src: 'Gruntfile.js'
            },
            src: {
                options: {
                    jshintrc: 'src/.jshintrc'
                },
                src: ['src/**/*.js']
            },
            test: {
                options: {
                    jshintrc: 'test/.jshintrc'
                },
                src: ['test/**/*.js']
            },
        },

        jsbeautifier: {
            files: ['Gruntfile.js', "src/**/*.js", "less/*.less"],
            options: {
                "indent_size": 4,
                "indent_char": " ",
                "indent_level": 0,
                "indent_with_tabs": false,
                "preserve_newlines": true,
                "max_preserve_newlines": 10,
                "jslint_happy": false,
                "brace_style": "collapse",
                "keep_array_indentation": false,
                "keep_function_indentation": false,
                "space_before_conditional": true,
                "eval_code": false,
                "indent_case": false,
                "unescape_strings": false
            }
        },
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            src: {
                files: '<%= jshint.src.src %>',
                tasks: ['jshint:src', 'qunit']
            },
            test: {
                files: '<%= jshint.test.src %>',
                tasks: ['jshint:test', 'qunit']
            },
        },

        recess: {
            dist: {
                options: {
                    compile: true
                },
                files: {
                    'demo/css/asColorInput.css': ['less/jquery-asColorInput.less']
                }
            }
        },
        replace: {
            bower: {
                src: ['bower.json'],
                overwrite: true, // overwrite matched source files
                replacements: [{
                    from: /("version": ")([0-9\.]+)(")/g,
                    to: "$1<%= pkg.version %>$3"
                }]
            },
            jquery: {
                src: ['asColorInput.jquery.json'],
                overwrite: true, // overwrite matched source files
                replacements: [{
                    from: /("version": ")([0-9\.]+)(")/g,
                    to: "$1<%= pkg.version %>$3"
                }]
            },
        },
        copy: {
            bower: {
                files: [{
                    expand: true,
                    flatten: true,
                    cwd: 'bower_components/',
                    src: [
                        'jquery-asColor/dist/*.js',
                    ],
                    dest: 'demo/js/'
                }]
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.loadNpmTasks('grunt-jsbeautifier');
    grunt.loadNpmTasks('grunt-recess');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-contrib-copy');

    // Default task.
    grunt.registerTask('default', ['jshint', 'clean', 'concat']);
    grunt.registerTask('dist', ['concat', 'uglify']);
    grunt.registerTask('dev', ['concat']);

    grunt.registerTask('css', ['recess']);
    grunt.registerTask('cp', ['copy']);

    grunt.registerTask('js', ['jsbeautifier', 'jshint']);

    grunt.registerTask('version', [
        'replace:bower',
        'replace:jquery'
    ]);

};