export default class XRInputListener {
	#xr;
	#session;
	#inputSources;

	// events: buttonDown, buttonUp, buttonHeld, change
	#callbacks = {
		left: {
			0: new Map( ),
			1: new Map( ),
			3: new Map( ),
			4: new Map( ),
			5: new Map( ),
			axes: new Map( ),
		},
		right: {
			0: new Map( ),
			1: new Map( ),
			3: new Map( ),
			4: new Map( ),
			5: new Map( ),
			axes: new Map( ),
		},
	}

	#moveCallbacks = {
		head: [ ],
		left: [ ],
		right: [ ],
	}

	// 0: select, 1: grip, 2: ?, 3: js, 4: a/x, 5: b/y
	#buttons = {
		left: [ false, false, false, false, false, false ],
		right: [ false, false, false, false, false, false ],
	}

	#axes = {
		left: [ 0, 0, 0, -0 ],
		right: [ 0, 0, 0, -0 ],
	}

	#transforms = {
		left: undefined,
		right: undefined,
		head: undefined,
	}

	#eventQueue = [ ];
	#moveQueue = [ ];

	constructor ( xr ) {
		this.#xr = xr;
	}

	sessionStart ( ) {
		console.log('XR started');

		this.#session = this.#xr.getSession( );
		this.#inputSources = this.#session.inputSources;
		console.log( this.#inputSources );
	}

	sessionEnd ( ) {
		console.log('XR ended');
	}

	processInputs ( ) {
		for( const inputSource of this.#inputSources ) {
			const hand = inputSource.handedness;
			const gamepad = inputSource.gamepad;

			gamepad.buttons.forEach( ( button, index ) => {
				const pressed = button.pressed;

				if ( this.#buttons[ hand ][ index ] == true && pressed == false ) {
					this.#eventQueue.push( { hand, index, event: "buttonUp" } );
				} else if ( this.#buttons[ hand ][ index ] == false && pressed == true ) {
					this.#eventQueue.push( { hand, index, event: "buttonDown" } );
				} else if ( this.#buttons[ hand ][ index ] == true && pressed == true ) {
					this.#eventQueue.push( { hand, index, event: "buttonHeld" } );
				}

				this.#buttons[ hand ][ index ] = pressed;
			} );
		}


							// for ( const inputSource of inputSources ) {
					// 	const handedness = inputSource.handedness;
					// 	const gamepad = inputSource.gamepad;
					// 	// console.log(inputSource)
					// 	if( gamepad === undefined )
					// 		continue;

					// 	// console.log(gamepad.axes);
					// }
	}

	track ( frame ) {
		const ref = this.#xr.getReferenceSpace( );
		const headPose = frame.getViewerPose( ref );
		if ( headPose ) {
			const { position, orientation } = headPose.transform;
			if ( this.#transforms.head ) {
				
			}

			this.#transforms.head = {
				translation: [ position.x, position.y, position.z ],
				rotation: [ orientation.x, orientation.y, orientation.z, orientation.w ],
			}

			this.#moveQueue.push( { target: "head" } );
		}

		for( const inputSource of this.#inputSources ) {
			const hand = inputSource.handedness;
			// console.log( inputSource.targetRaySpace );

			const pose = frame.getPose( inputSource.targetRaySpace, ref	);
			if ( !pose ) continue;

			const { position, orientation } = pose.transform;
			if ( this.#transforms[ hand ] === undefined ) {
				
			}
			this.#transforms[ hand ] = {
				translation: [ position.x, position.y, position.z ],
				rotation: [ orientation.x, orientation.y, orientation.z, orientation.w ],
			}
			
			this.#moveQueue.push( { target: hand } );
		}
	}

	process ( frame ) {
		this.processInputs( );
		this.track( frame );

		this.#eventQueue.forEach( ( { hand, index, event } ) => {
			console.log( hand, index, event )
			if ( this.#callbacks[ hand ][ index ].has( event ) ) {
				const callbacks = this.#callbacks[ hand ][ index ].get( event );
				callbacks.forEach( callback => callback( ) );
			}
		} );
		this.#eventQueue.length = 0;

		this.#moveQueue.forEach( ( { target } ) => {
			const callbacks = this.#moveCallbacks[ target ];
			callbacks.forEach( callback => callback( this.#transforms[ target ] ) );
		} );
		this.#moveQueue.length = 0;
	}

	addButtonCallback ( hand, index, event, callback ) {
		if ( !this.#callbacks[ hand ][ index ].has( event ) ) {
			this.#callbacks[ hand ][ index ].set( event, [ ] );
		}

		this.#callbacks[ hand ][ index ].get( event ).push( callback );
	}

	/// left, right, head
	addMoveCallback ( target, callback ) {
		this.#moveCallbacks[ target ].push( callback );
	}
}