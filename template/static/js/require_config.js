'use strict';
// 配置require js的路径
/***********************************
 *
 * 注意事项
 * components目录下的文件引用都以'components'作为前缀
 * js目录下的文件引用都以'js'作为前缀
 * vendor目录下的文件引用都以'vendor'作为前缀
 *
 * 
 ***********************************/

var staticUrl = window._global.url.matrix + '/static';

// GULPUSE
var requireConfig = {
    config: {
        text: {
            useXhr: function () {
                // allow crossdomain requests
                // remote server allows CORS
                return true;
            }
        }
    },
    paths: {
            "js"                    : staticUrl + '/js',
            "nav"                   : staticUrl + '/js/nav',
            "core"                  : staticUrl + '/js/components/util',
            "components"            : staticUrl + '/js/components',
            "vendor"                : staticUrl + '/vendor',
            "text"                  : staticUrl + '/vendor/text',
            "underscore"            : staticUrl + '/vendor/underscore',
            "backbone"              : staticUrl + '/vendor/backbone',
            "marionette"            : staticUrl + '/vendor/backbone.marionette',
            "backbone.wreqr"        : staticUrl + '/vendor/backbone.wreqr',
            "backbone.babysitter"   : staticUrl + '/vendor/backbone.babysitter',
            "backbone.modelbinder"  : staticUrl + '/vendor/backbone.modelbinder.min',
            "jquery"                : staticUrl + '/vendor/jquery',
            "semantic"              : staticUrl + '/vendor/semantic/semantic',
            "stickytableheaders"    : staticUrl + '/vendor/plugin/jquery.stickytableheaders',
            "photoswipe"            : staticUrl + '/vendor/photoswipe/photoswipe',
            "photoswipeui"          : staticUrl + '/vendor/photoswipe/photoswipe-ui-default',
            "chart"                 : staticUrl + '/vendor/echarts/build/dist/chart',

            // 常用库配置
            "moment"                : staticUrl + '/vendor/moment'
    },
    shim: {
        "jquery": {
            "exports": "$"
        },
        "jqueryui": {
            "deps": ["jquery"]
        },
        "stickytableheaders": {
            "deps": ["jquery"]
        },
        "underscore": {
            "exports": "_"
        },
        // Backbone
        "backbone": {
            // Depends on underscore/lodash and jQuery
            "deps": ["underscore", "jquery"],

            // Exports the global window.Backbone object
            "exports": "Backbone"
        },
        "semantic": {
            "deps": ["jquery"]
        },
        "moment": {
            "exports": "moment"
        }
    },

    exclude: [
        'underscore',
        'backbone',
        'jquery',
        'semantic'
    ]
};
// GULPUSE

require && require.config(requireConfig);