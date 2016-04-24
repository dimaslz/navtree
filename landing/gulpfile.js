var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var del = require('del');
var clean = require('gulp-clean');
var ghPages = require('gulp-gh-pages');
var uncss = require('gulp-uncss');
var cssmin = require('gulp-cssmin');

function startBrowserSync() {
    browserSync({
        server: {
            baseDir: './public'
        },
        notify: false,
        ghostMode: {
            clicks: true,
            forms: true,
            scroll: true
        }
    });
}

// Error reporting function
// function mapError(err) {
//     if (err.fileName) {
//         // Regular error
//         gUtil.log(chalk.red(err.name) + ': ' + chalk.yellow(err.fileName.replace(__dirname + '/src/js/', '')) + ': ' + 'Line ' + chalk.magenta(err.lineNumber) + ' & ' + 'Column ' + chalk.magenta(err.columnNumber || err.column) + ': ' + chalk.blue(err.description));
//     } else {
//         // Browserify error..
//         gUtil.log(chalk.red('Browserify ' + err.name) + ': ' + chalk.yellow(err.message));
//     }
// }

gulp.task('sass', function() {
	return gulp.src('./sass/main.scss')
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(sourcemaps.write())
        .pipe(uncss({
            html: ['index.html']
        }))
        .pipe(cssmin())
		.pipe(gulp.dest('./public/css'))
		.pipe(
            browserSync.reload({
                stream: true
            }));
});

gulp.task('index', function() {
    return gulp.src('./index.html')
        .pipe(gulp.dest('./public'))
        .pipe(
            browserSync.reload({
                stream: true
            }));
});

gulp.task('assets', function () {
    return gulp.src('./assets/**/*')
        .pipe(gulp.dest('./public/assets'))
})

gulp.task('github-page', function() {
  return gulp.src('./public/**/*')
    .pipe(ghPages());
});

gulp.task('uncss', function () {
    return gulp.src('./public/css/main.css')
        .pipe(uncss({
            html: ['index.html']
        }))
        // .pipe(cssmin())
        .pipe(gulp.dest('./public/css/out.css'));
});

gulp.task('watch', ['sass', 'assets', 'index'], function() {
    startBrowserSync();
    gulp.watch('./index.html', ['index']);
    gulp.watch('./sass/main.scss', ['sass']);
});

gulp.task('dev', ['uncss']);