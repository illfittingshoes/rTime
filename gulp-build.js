/*
 * Gulp-specific
 */
/* eslint-disable import/no-extraneous-dependencies */
import gulp              from 'gulp';
import flatten           from 'gulp-flatten';
import jsdoc             from 'gulp-jsdoc3';
import newer             from 'gulp-newer';
import plumber           from 'gulp-plumber';
import replace           from 'gulp-replace';
import rename            from 'gulp-rename';
import gutil             from 'gulp-util';
import uglify            from 'gulp-uglify';
import del               from 'del';
import runSeq            from 'run-sequence';
import lazypipe          from 'lazypipe';

/*
 * Build Features
 */
// transpiling
import babel             from 'gulp-babel';
import sourcemaps        from 'gulp-sourcemaps';

// testing
import eslint            from 'gulp-eslint';
import friendlyFormatter from 'eslint-friendly-formatter';
import mocha             from 'gulp-mocha';

const docstrapConfig = require('./docstrap.json');

/* ****************************
 * Setup and low-level tasks
 * ****************************/

function handleError(error) {
	gutil.log(error.message);
	this.emit('end'); // eslint-disable-line no-invalid-this
}

export const plumberOpts = { errorHandler: handleError };

export const source = {
	main: './source/**/*.js',
	tests: './tests/**/*.js*',
};

const dest = {
	root:      '.',
	lib:       './lib',
	umd:       './dist',
	jsdoc:     './docs',
	testDir:   './built-tests',
	testFiles: './built-tests/**/*.js',
};

const babelUmdOpts = {
	plugins: ['transform-es2015-modules-umd'],
};

gulp.task('clean-all', ['clean-tests', 'clean-lib', 'clean-umd', 'clean-jsdoc']);

/* eslint-disable no-multi-spaces */
gulp.task('clean-tests', () => del([`${dest.testDir}/**/*`]));
gulp.task('clean-lib',   () => del([`${dest.lib}/**/*`]));
gulp.task('clean-umd',   () => del([`${dest.umd}/**/*`]));
gulp.task('clean-jsdoc', () => del([`${dest.jsdoc}/jsdocs/**/*`]));
/* eslint-enable no-multi-spaces */

/* ****************************
 * TESTING TASKS
 * ****************************/

gulp.task('eslint', () => gulp.src(source.main)
	.pipe(plumber(plumberOpts))
	.pipe(eslint())
	.pipe(eslint.format(friendlyFormatter))
);

gulp.task('build-tests', () => gulp.src(source.tests)
	.pipe(plumber(plumberOpts))
	.pipe(newer({
		dest: dest.testDir,
		ext: '.js',
	}))
	.pipe(babel())
	.pipe(flatten())
	.pipe(gulp.dest(dest.testDir))
);

gulp.task('test', ['build-lib', 'build-tests'], () => gulp.src(dest.testFiles)
		.pipe(plumber(plumberOpts))
		.pipe(mocha({ reporter: 'nyan' }))
);

gulp.task('build-and-test', ['lint-and-build'], (done) => {
	runSeq('test', done);
});

/* ****************************
 * BUILD TASKS
 * ****************************/

/* Lint then build lib */
gulp.task('lint-and-build', ['eslint'], (done) => {
	runSeq(['build-lib', 'build-umd', 'build-uglified-umd'], done);
});

/* Build for lib and UMD, regular and uglified */
const jsUmdStart = lazypipe()
	.pipe(plumber, plumberOpts)
	.pipe(newer, dest.umd)
	.pipe(sourcemaps.init)
	.pipe(babel, babelUmdOpts)
	.pipe(replace, /global\.(.*?) mod.exports/, "global.$1 mod.exports['default']");

gulp.task('build-lib', () => gulp.src(source.main)
	.pipe(plumber(plumberOpts))
	.pipe(newer(dest.lib))
	.pipe(sourcemaps.init())
	.pipe(babel())
	.pipe(sourcemaps.write('.'))
	.pipe(gulp.dest(dest.lib)));

gulp.task('build-umd', () => gulp.src(source.main)
	.pipe(jsUmdStart())
	.pipe(sourcemaps.write('.'))
	.pipe(gulp.dest(dest.umd))
);

gulp.task('build-uglified-umd', () => gulp.src(source.main)
	.pipe(jsUmdStart())
	.pipe(uglify())
	.pipe(rename({ extname: '.min.js' }))
	.pipe(sourcemaps.write('.'))
	.pipe(gulp.dest(dest.umd))
);

gulp.task('build-jsdoc', (cb) => {
	gulp.src(['README.md', './source/**/*.js'], { read: false })
		.pipe(newer(`${dest.jsdoc}/index.html`))
		.pipe(jsdoc(docstrapConfig, cb));
});

/* ****************************
 * DEV WATCH TASKS
 * ****************************/

gulp.task('watch-lib', ['build-lint-and-test']);

gulp.task('watch-test', (done) => {
	// watch lib files
	gulp.watch(source.main, ['build-and-test']);

	// watch test files
	gulp.watch(source.tests, ['test']);

	return done();
});

gulp.task('watch-readme', ['build-jsdoc']);

gulp.task('watch', () => {
	// watch lib files
	gulp.watch(source.main, ['watch-lib']);

	// watch readme
	gulp.watch('./README.md', ['watch-readme']);

	// watch test files
	gulp.watch(source.tests, ['test']);
});

/* ****************************
 * Composite
 * ****************************/

gulp.task('build-lint-and-test', ['lint-and-build'], (done) => {
	runSeq('test', 'build-jsdoc', done);
});

gulp.task('clean-build-jsdoc-and-test-all', ['clean-all'], (done) => {
	runSeq('build-lint-and-test', done);
});

/* ****************************
 * Top Level
 * ****************************/

gulp.task('test-cycle', (done) => {
	runSeq(
		['clean-lib', 'clean-tests'],
		'build-lib',
		['test'],
		'watch-test',
		done
		);
});

gulp.task('build', ['clean-build-jsdoc-and-test-all', 'watch']);
