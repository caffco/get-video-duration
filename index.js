var exec = require( 'mz/child_process' ).execFile;
var assert = require( 'assert' );

module.exports = function ( filename ) {
	return exec( 'ffprobe', [
		'-v', 'error',
		'-of', 'flat=s=_',
		'-select_streams', 'v:0',
		'-show_streams',
		filename
	] ).then( function ( out ) {
		var stdout = out[ 0 ].toString( 'utf8' );
		var duration = /duration=\"(\d*\.\d*)\"/.exec( stdout );
		assert( duration, 'No duration found!' );
		return parseFloat( duration[ 1 ] );
	} );
};