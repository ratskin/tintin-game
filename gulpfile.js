var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var ghpages = require('gh-pages');

// Development Tasks 
// -----------------

// Start browserSync server
gulp.task('browserSync', function() {
	browserSync({
	server: {
		baseDir: 'src'
	}
	});
});

gulp.task('sass', function() {
	return gulp.src('src/scss/**/*.scss') // Gets all files ending with .scss in src/scss and children dirs
	.pipe(sass().on('error', sass.logError)) // Passes it through a gulp-sass, log errors to console
	.pipe(gulp.dest('src/css')) // Outputs it in the css folder
	.pipe(browserSync.reload({ // Reloading with Browser Sync
		stream: true
	}));
});

// Watchers
gulp.task('watch', function() {
	gulp.watch('src/scss/**/*.scss', ['sass']);
	gulp.watch('src/*.html', browserSync.reload);
	gulp.watch('src/js/**/*.js', browserSync.reload);
});

// Optimization Tasks 
// ------------------

// Optimizing CSS and JavaScript 
gulp.task('useref', function() {
	return gulp.src('src/*.html')
	.pipe(useref())
	.pipe(gulpIf('*.js', uglify()))
	.pipe(gulpIf('*.css', cssnano()))
	.pipe(gulp.dest('dist'));
});

// Optimizing Images 
gulp.task('images', function() {
	return gulp.src('src/images/**/*.+(png|jpg|jpeg|gif|svg)')
	// Caching images that ran through imagemin
	// .pipe(cache(imagemin({
	// 	optimizationLevel: 3,
	// 	progressive: true,
	// 	interlaced: true,
	// })))
	.pipe(gulp.dest('dist/images'));
});

// Copying fonts 
gulp.task('fonts', function() {
	return gulp.src('src/fonts/**/*')
	.pipe(gulp.dest('dist/fonts'))
});

// Cleaning 
gulp.task('clean', function() {
	return cache.clearAll(del.sync('dist'));
});

// Build Sequences
// ---------------

gulp.task('start', gulp.series(
	gulp.parallel('sass', 'browserSync'),
	'watch',
));

gulp.task('build', gulp.series(
	'clean',
	'sass',
	gulp.parallel('useref', 'images', 'fonts'),
));

gulp.task('deploy', gulp.series('build', function(cb) {
	return ghpages.publish('dist', cb);
}));