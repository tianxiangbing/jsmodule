/*
 * Created with Sublime Text 2.
 * User: 田想兵
 * Date: 2015-01-27
 * Time: 18:14:14
 * Contact: 55342775@qq.com
 */
var fs = require("fs");
var path = require("path");
module.exports = function(grunt) {

    var publishVersion = '1.0.0';

    var today = new Date();

    var config = {
        version: [today.getFullYear(), today.getMonth() + 1, today.getDate(), today.getTime()].join('.'),
        pkg: grunt.file.readJSON('package.json'),
        publishVersion: publishVersion
    };


    var pagesMap ={} ;
    var List = [];
      //读screen目录下的文件 动态生成html文件
    var List =fs.readdirSync('screen');
    config.replace =config.replace||{};
    List.forEach(function(item){
        var fileName = item.split('.')[0];
        var content = fs.readFileSync('screen/'+item, "utf-8");
        // var panorama = fs.readFileSync('screen/panorama.vm', "utf-8");
        var targetName = item.replace('.','_');
          console.log(targetName)
         // console.log("screen/"+item)
        pagesMap["src/"+fileName+".html"]=["layout/default.vm"];
        config.replace[targetName]={
            src:["src/"+fileName+".html"],
            overwrite:true,
            replacements:[{
                from :"$screen_placeholder",
                to:content
            }
            ]
        };

        var controlList =content .match( new RegExp(/\$control\.setTemplate\(\"(\w+\.vm)\"\)/gm) );
        if(controlList){
            var controlReplace =[]
            controlList.forEach(function(item){
                var controlFileName=item.match(/(?!\")(\w+\.\w+)/g)[1];
                var controlName= controlFileName.split('.')[0];
                // console.log(fileName+":::::::::"+controlName);
                var controlContent =fs.readFileSync('control/'+controlFileName, "utf-8");//控件内容
                controlReplace.push({from:item,to:controlContent});
            });
            // console.log(controlReplace)
            config.replace["controlReplace"+fileName]={
                src:["html/"+fileName+".html"],
                overwrite:true,
                replacements:controlReplace
            }
        }
    });
    config.concat = {
        // 生成入口文件
        makePages: {
            files: pagesMap
        }
    }

    config.watch = {
        html:{
             files: [
                'screen/**/*.vm',
                'layout/default.vm',
                'control/*.vm'
            ],
            tasks: ['html'],
            options: {
                livereload: true
            }
        },
        js:{
            files:[
                'src/**/*.js'
            ],
            options:{
                livereload:true
            }
        },
        css:{
            files:[
                'src/**/*.css'
            ],
            options:{
                livereload:true
            }
        }
    };

    grunt.initConfig(config);
    grunt.loadNpmTasks("grunt-cmd-nice");
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('html',[
        'concat:makePages',
        'replace'
        ])

    grunt.registerTask('default', [
        'cmd_concat',
        'replace',
    ]);
};