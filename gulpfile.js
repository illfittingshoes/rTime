var gulp = require( "gulp" );

require( "babel-core/register" )();

require( "./gulp-build.js" );


/* ****************************
 * DEFAULT RUN TASK
 * ****************************/

gulp.task( "default", [ "build" ] );
