import * as gulp from 'gulp';
import * as gulpTs from 'gulp-typescript';
import * as gulpUglify from 'gulp-uglify';

// source and public folder
const
    source = 'src/',
    dest = 'public/';

function finished(cb: any){
    console.log('\t\t  KEEP \n\r \t\t  CALM \n\r \t\t   and \n\r \t\t  HAPPY \n\r \t\t CODING \n\r \t\t   :)');

    cb();
}

// Compile TS to JS file
gulp.task('compileJStoTS', () => {
    const tsProject = gulpTs.createProject('tsconfig.json');

    return gulp.src(source + '**/*.ts')
        .pipe(tsProject())
        // .pipe(gulpUglify())
        .pipe(gulp.dest(dest));
});

// Copy TS files to public
gulp.task('copyTS', () => {
    return gulp.src(source + '**/*.ts')
        .pipe(gulp.dest(dest));
});

gulp.task('default', gulp.series( 'compileJStoTS', 'copyTS', finished));