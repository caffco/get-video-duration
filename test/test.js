var assert = require( 'assert' ),
	path = require( 'path' );

var getDuration = require( '..' );

it( 'should get duration', function () {
	return getDuration( 'http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4' )
		.then( function ( duration ) {
			assert.equal( duration, 60.095 );
		} );
} )