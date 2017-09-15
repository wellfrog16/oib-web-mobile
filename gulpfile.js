//导入工具包 require('node_modules里对应模块')
var del = require('del'),
    gulp = require('gulp'), //本地安装gulp所用到的地方
    cache = require("gulp-cache"),
    cleanCSS = require('gulp-clean-css'),
    concat = require('gulp-concat'),
    connect = require('gulp-connect'),
    htmlreplace = require('gulp-html-replace'),
    htmlmin = require('gulp-htmlmin'),
    imagemin = require('gulp-imagemin'),
    less = require('gulp-less'),
    notify = require("gulp-notify"),
    rename = require('gulp-rename'),
    requirejsOptimize = require('gulp-requirejs-optimize'),
    uglify = require('gulp-uglify'),
    pump = require('pump');

// 清除发布目录
gulp.task('clean', function(cb){
    del(['dist']).then(paths => {
        cb()
    });
});

// 解析less文件
gulp.task('less', function(cb){
    gulp.src('src/style/main.less')
        .pipe(less())
        .pipe(gulp.dest('./src/style'));
    cb();
});

// 合并压缩css文件
gulp.task('cleancss', function(cb){
    gulp.src([
            'src/style/*.css'
            , 'src/js/lib/swiper/*.css'
        ])
        .pipe(concat('main.css'))
        .pipe(cleanCSS())
        .pipe(rename(function(path){
            path.basename += '.min';
        }))
        .pipe(gulp.dest('dist/style'))
        //.pipe(notify('CSS合并压缩完成'));
    cb();
});

// gulp.task('js', function(cb) {
//     pump([
//         gulp.src('js/*.js')
//             .pipe(concat('all.js')),
//         uglify(),
//         gulp.dest('dist')
//     ], cb);
// });

// 无损压缩图片
gulp.task('image', () =>
    gulp.src('src/asset/img/**/*')
        .pipe(cache(imagemin()))
        .pipe(gulp.dest('dist/asset/img'))
);

// copy 视音频
gulp.task('video', () =>
gulp.src(['src/asset/**/*.mp4', 'src/asset/**/*.mp3'])
    .pipe(gulp.dest('dist/asset'))
);

// 打开开发服务器
gulp.task('cdev', function() {
    gulp.start('watch');
    connect.server({
        root: 'src',
        //livereload: true
    });
});

// 打开分发服务器
gulp.task('cdist', function() {
    connect.server({
        root: 'dist',
        //livereload: true
    });
});

// AMD解析打包
gulp.task('js:main', function () {
    gulp.src('src/js/app.js')
        .pipe(requirejsOptimize({
            mainConfigFile: 'src/js/requirejs/require.config.js'
        }))
        .pipe(rename('main.min.js'))
        // .pipe(rename(function(path){
        //     path.basename += '.min';
        // }))
        .pipe(gulp.dest('dist/js'));
});


// requirejs合并
gulp.task('requirejs', function(cb) {

    pump([
        gulp.src(['src/js/requirejs/require.js', 'src/js/requirejs/require.config.js'])
            .pipe(concat('require.combine.js')),
            uglify(),
            gulp.dest('dist/js')
    ], cb);

});

// i18n
gulp.task('i18n', function(cb) {
    gulp.src('src/js/nls/**/*.*')
        .pipe(gulp.dest('dist/js/nls'));
    cb();
});

// html替换压缩
gulp.task('htmlreplace', function(cb) {
    gulp.src('src/*.html')
        .pipe(htmlreplace({
            'js': ['js/require.combine.js', 'js/main.min.js'],
            'css': 'style/main.min.css'
        }))
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('dist/'));
    cb();
});

// 监听less
gulp.task('watch',function(){
    gulp.watch('./src/style/**/*.less',['less']);
})

// 组合操作
gulp.task('default', ['clean'], function(cb) {
    gulp.start('js:main', 'requirejs', 'i18n', 'cleancss', 'image', 'video', 'htmlreplace');
});