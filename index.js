var exec = require( 'mz/child_process' ).execFile;
var assert = require( 'assert' );

module.exports = function ( filename ) {
	return exec('ffprobe', [
		'-v', 'error',
		'-show_format',
		'-show_streams',
		filename,
	]).then( function ( out ) {
		var stdout = out[0].toString( 'utf8' );
		var matched = stdout.match(/duration=\"?(\d*\.\d*)\"?/);
		assert(matched && matched[1], 'No duration found!');
		return parseFloat(matched[1]);
	});
};