var gulp          = require('gulp'),
    plumber       = require('gulp-plumber'),
    rename        = require('gulp-rename');
var autoprefixer  = require('gulp-autoprefixer');
var concat        = require('gulp-concat');
var uglify        = require('gulp-uglify');
var imagemin      = require('gulp-imagemin'),
    cache         = require('gulp-cache');
var minifycss     = require('gulp-minify-css');
var sass          = require('gulp-sass');
var browserSync   = require('browser-sync');
var bourbon       = require('node-bourbon').includePaths;

gulp.task('browser-sync', function() {
  browserSync({
    server: {
       baseDir: "./",
       index: "index.html"
    }
  });
});

gulp.task('bs-reload', function () {
  browserSync.reload();
});

gulp.task('bs-stream', function () {
  browserSync.stream();
});

gulp.task('images', function(){
  gulp.src('img/**/*')
    .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(gulp.dest('dist/img/'));
});

gulp.task('sass', function() {
  gulp.src(['sass/**/*.scss'])
    .pipe(plumber({
      errorHandler: function(error) {
        console.log(error.message);
        this.emit('end');
      }
    }))
    .pipe(sass({
      includePaths: bourbon
    }))
    .pipe(autoprefixer('last 2 versions'))
    .pipe(gulp.dest('dist/styles/'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest('dist/styles/'))
});

gulp.task('styles', function(){
  gulp.src(['css/**/*.css'])
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(autoprefixer('last 2 versions'))
    .pipe(gulp.dest('dist/styles/'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest('dist/styles/'))
    //.pipe(browserSync.stream({match:'**.*.css'}))
    //.pipe(browserSync.reload({stream:true}))
});

gulp.task('scripts', function(){
  return gulp.src(['js/**/*.js', 'app/**/*.js'])
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(concat('main.js'))
    .pipe(gulp.dest('dist/scripts/'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('dist/scripts/'))
    //.pipe(browserSync.stream({match:'**.*.css'}))
    //.pipe(browserSync.reload({stream:true}))
});

gulp.task('default', ['browser-sync'], function(){
  gulp.watch("css/**/*.css", ['styles', 'bs-reload']);
  gulp.watch("sass/**/*.scss", ['sass', 'bs-reload']);
  gulp.watch(['js/**/*.js', 'app/**/*.js'], ['scripts', 'bs-reload']);
  gulp.watch("*.html", ['bs-reload']);
});