var gulp = require('gulp')
, sass = require('gulp-sass')
, gulpLog = require('gulp-log')
, path = require('path')
, gulpMd5 = require('gulp-md5')
, clean = require('gulp-clean')
, rjs = require('gulp-requirejs')
, child_process = require('child_process')
, qiniuUpload = require('qiniu_cdn')
, uglify = require('gulp-uglify')
, fs = require('fs')
, _ = require('underscore')
, Q = require('q')
, qExec = Q.denodeify(child_process.exec)
, readFile = Q.denodeify(fs.readFile);

// config
var cdnPrefix = 'matrix/'
, cdnConfig = {
    accessKey: '',
    secretKey: '',
    bucket: ''
}
, env = {
    isProduction: process.env.KDT_NODE_RUN_MODE == 'production',
    cssCompress: process.env.KDT_NODE_RUN_MODE == 'production'
};
var pathConfig = {
    static: sr('./'),
    sass: [sr('./sass/**/*.scss'), sr('!./sass/**/_*')],
    sassImagePath: sr('../../../../asset/img'),
    cssLocal: sr('./build/local/css/'),
    cssProduct: sr('./build/product/css/'),
    requireJs: sr('./js'),
    compressedJs: sr('./build/product/'),
    requireConfig: sr('./js/require_config.js'),
    product: sr('./build/product')
};

// tool
function sr(rp){
    return path.join('static/', rp);
}

function qFind(execStr){
    return qExec(execStr)
        .then(function(data){
            return data[0].split('\n').filter(function(data){return data});
        });
}

function printVersionMap(phpPath, array){
    var k, str = '', hash = {};

    array.forEach(function(item){
        var k = item.match(/build\/product\/(.+)_\w{10}\.[js|css]/)[1];
        hash[k] = item;
    });

    str += '<?php return array(\n';
    for(k in hash){
        str += ' "' + k + '" => "' + hash[k] + '"\n,';
    }

    str = str.slice(0, str.length-1);
    str += '); ?>';

    fs.writeFileSync(phpPath, str);
    console.log('hash写入 ' + path.join(__dirname, phpPath) + ' 成功');
    console.log('共 ' + Object.keys(hash).length +' 个文件');
}
// tool

gulp.task('sass', env.cssCompress ? ['clean:sass'] : null, function(){
    if(env.cssCompress){
        return gulp.src(pathConfig.sass)
            .pipe(sass({
                includePaths: ['sass'],
                imagePath: pathConfig.sassImagePath,
                outputStyle: 'compressed'
            }))
            .pipe(gulpMd5(10))
            .pipe(gulp.dest(pathConfig.cssProduct))
            .pipe(gulpLog('编译完毕 --->'));
    } else {
        return gulp.src(pathConfig.sass)
            .pipe(sass({
                includePaths: ['sass'],
                imagePath: pathConfig.sassImagePath,
                outputStyle: 'expanded'
            }))
            .pipe(gulp.dest(pathConfig.cssLocal))
            .pipe(gulpLog('编译完毕 --->'));
    }
})
.task('clean:js', function(){
    return gulp.src([path.join(pathConfig.compressedJs, '**/*.js')], {read: false})
        .pipe(clean())
        .pipe(gulpLog('删除'));
})
.task('clean:sass', function(){
    return gulp.src([path.join(pathConfig.cssProduct, '**/*.css')], {read: false})
        .pipe(clean())
        .pipe(gulpLog('删除'));
})
.task('watch:sass', function(){
    gulp.watch(pathConfig.sass, function(e) {
        var _filename = e.path.split('/').pop();
        return gulp.src(sr('sass/**/' + _filename))
            .pipe(sass({
                includePaths: ['sass'],
                imagePath: pathConfig.sassImagePath,
                outputStyle: 'expanded'
            }))
            .pipe(gulp.dest(pathConfig.cssLocal))
            .pipe(gulpLog('编译完毕 --->'));
    });
    gulp.watch([sr('./sass/**/_*.scss')], function() {
        gulp.run('sass');
    });
    gulp.run('sass');
})
.task('cdn', function(){
    qiniuUpload({
        src: sr('./build/product/**'),
        dest: cdnPrefix + 'build/product/'
    }, cdnConfig);
})
.task('cdn:vendor', function(){
    qiniuUpload({
        src: sr('./vendor/**'),
        dest: cdnPrefix + 'vendor/'
    }, cdnConfig);
})
.task('cdn:image', function(){
    qiniuUpload({
        src: sr('./asset/img/**'),
        dest: cdnPrefix + 'asset/img/'
    }, cdnConfig);
})
.task('requirejs', ['clean:js'], function(){
    readFile(pathConfig.requireConfig)
        .then(function(buffer){
        var configCode = buffer.toString()
        , result = configCode.match(/GULPUSE([\s\S]*)GULPUSE/)
        , staticUrl = path.join(__dirname, pathConfig.static);

        with(staticUrl) {
            eval(result[1]);
        }

        if(requireConfig == undefined){
            return Q.reject('没有正确获取requirejs配置信息');
        }

        return qFind('find ' + pathConfig.requireJs + ' -name main.js')
            .then(function(data){
                var config;

                return data.map(function(item){
                    item = item.split('/main.js')[0];

                    item = path.relative(pathConfig.static, item);

                    config = _.extend({}, requireConfig, {
                        stubModules: ['text', 'tpl', 'jsx'],
                        inlineText: true,
                        findNestedDependencies: true,
                        optimizeAllPluginResources: true,
                        preserveLicenseComments: false,
                        baseUrl: sr(item),
                        name: 'main',
                        out: item + '.js'
                    });


                    return rjs(config)
                        .pipe(uglify({
                            preserveComments: false
                            , compress: {
                                drop_console: true
                            }
                        }))
                        .pipe(gulpMd5(10))
                        .pipe(gulpLog('编译完毕 -->'))
                        .pipe(gulp.dest(pathConfig.compressedJs));
                });
            });
    }).fail(function(result){
        console.error(result);
    });
})
.task('map', function(){
    Q.all([qFind('find ./'+pathConfig.product+' -name "*.js"'), 
            qFind('find ./'+pathConfig.product+' -name "*.css"')])
        .then(function(data){
            data = _.flatten(data);

            data = data.map(function(item){
                return path.relative(pathConfig.static, item);
            });

            targetPath = path.join(sr('.'), '..', 'version.php');
            printVersionMap(targetPath, data);
        })
        .fail(function(reason){
            console.error(reason);
        });
});