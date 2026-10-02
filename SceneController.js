import * as THREE from './three/three.module.js';
import { OrbitControls } from './three/controls/OrbitControls.js';
import CameraController from './SyncModulesViews/Controllers/CameraController.js';
import TransformController from './SyncModulesViews/Controllers/TransformController.js';
import { TransformControls } from "controls/TransformControls.js";
import SceneGraphController from './SyncModulesViews/Controllers/SceneGraphController.js';

import { XRControllerModelFactory } from './three/webxr/XRControllerModelFactory.js';

export default class SceneController {
	#renderer;
	#scene;
	#camera;
	#cameraController;
	#transformController;
	#orbitControls;
	#sceneGraphController;
	#onRender;

	#controller0;
	#controller1;
	#grip0;
	#grip1;

	#controls;

	#callbacks;
	#primtives = new Set( );
	#selectedPrimitive;

	constructor ( ) {
		console.log( `SceneController - constructor` );
		
		this.#renderer = new THREE.WebGLRenderer({antialias: true});
		this.#renderer.autoClear = false;
		this.#renderer.setPixelRatio( window.devicePixelRatio );
		this.#renderer.setSize( window.innerWidth, window.innerHeight );
		this.#renderer.xr.enabled = true;
		document.body.appendChild( this.#renderer.domElement );

		this.#scene = new THREE.Scene( );
        this.#scene.background = new THREE.Color(0xcccccc);
		this.#camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 100 );
		this.#camera.position.set( -2, 3, -3 );
		this.#cameraController = new CameraController( this.#camera, this.#renderer.domElement );
		this.#transformController = new TransformController( this.#camera, this.#renderer.domElement );
		this.#scene.add( this.#transformController.getHelper( ) );
		this.#scene.add( this.#transformController.object3D );
		this.#transformController.addEventListener( 'dragging-changed', event => this.#cameraController.enabled = !event.value );
		
		this.#sceneGraphController = new SceneGraphController( this.#camera, this.#renderer.domElement );
		this.#scene.add( this.#sceneGraphController.getHelper( ) );
		this.#scene.add( this.#sceneGraphController.object3D );
		this.#sceneGraphController.addEventListener( 'dragging-changed', event => this.#cameraController.enabled = !event.value );

		// this.#orbitControls = new OrbitControls( this.#camera, this.#renderer.domElement);
		// console.log(this.#orbitControls)
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
		this.#scene.add(ambientLight);
		const pointLight = new THREE.PointLight( 0xffffff, 120);
		pointLight.position.set(-2, 3, -4);
		this.#scene.add(pointLight);
		this.#addDebug( );


		this.#renderer.xr.addEventListener('sessionstart', ( ) => {
			const cameraModule = this.#callbacks.getCameraModule( );
			const session = this.#renderer.xr.getSession();
			const inputSources = session.inputSources;
			
			console.log( inputSources )
			const xr = this.#renderer.xr;
			let aDown = false;
			let xDown = false;
			this.onRender = ( time, frame ) => {
				if( xr.isPresenting ) {
					const ref = xr.getReferenceSpace( );
					const pose = frame.getViewerPose( ref );
					if ( pose ) {
						const position = pose.transform.position;
						const orientation = pose.transform.orientation;
						const transform = {
							translation: [ position.x, position.y, position.z ],
							rotation: [ orientation.x, orientation.y, orientation.z, orientation.w ],
						}
						cameraModule.updateTransform( transform, true );
					}

					for ( const inputSource of inputSources ) {
						const handedness = inputSource.handedness;
						const gamepad = inputSource.gamepad;

						if( gamepad === undefined )
							continue;

						/// FIX button.pressed = hold, not event pressing
						if ( handedness == "left" && gamepad.buttons[ 4 ].pressed ) {

							console.log( this.#transformController )
							console.log ( this )
							console.log( this.#selectedPrimitive );
							this.#primtives.delete( this.#selectedPrimitive );
							this.#callbacks?.removeModule( this.#selectedPrimitive.UUID );
							// this.#selectedPrimitive = undefined;
							this.#transformController.setModule( undefined );
						}
						if ( handedness == "right" && gamepad.buttons[ 4 ].pressed ) {
							console.log( this.#selectedPrimitive?.primitiveTypes )
							console.log( gamepad.buttons[4].value )
						}
						// gamepad.buttons.forEach( (button, index) => {
						// 	console.log( index, button.pressed, button.touched, button.value)
						// });
						// console.log(gamepad.axes);
					}
					
				}
			}


			console.log('XR started');
			this.#controller0 = this.#renderer.xr.getController( 0 );
			this.#controller1 = this.#renderer.xr.getController( 1 );
			console.log( this.#controller1, this.#controller0 )
			this.#scene.add(this.#controller1, this.#controller0)

			const lineGeometry = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, - 1 ) ] );
			const line0 = new THREE.Line( lineGeometry );
			const line1 = new THREE.Line( lineGeometry );
			this.#controller0.add( line0 )
			this.#controller1.add( line1 )


			const raycaster = new THREE.Raycaster();
			const controllerModelFactory = new XRControllerModelFactory();
			this.#grip0 = this.#renderer.xr.getControllerGrip( 0 );
			this.#grip1 = this.#renderer.xr.getControllerGrip( 1 );
			this.#grip0.add( controllerModelFactory.createControllerModel( this.#grip0 ) );
			this.#grip1.add( controllerModelFactory.createControllerModel( this.#grip1 ) );
			this.#scene.add( this.#grip0, this.#grip1 );

			this.#controller1.addEventListener( "move", ( event ) => {
				this.#transformEvents( this.#controller1, event );
			} );
			this.#controller1.addEventListener( "selectstart", ( event ) => {
				this.#transformEvents( this.#controller1, event );
			} );
			this.#controller1.addEventListener( "selectend", ( event ) => {
				this.#transformEvents( this.#controller1, event );
			} );
			this.#controller1.addEventListener( "squeezestart", ( event ) => {
				// this.#transformEvents( this.#controller1, event );
				console.log("squeezeStart")
			} );
			this.#controller1.addEventListener( "squeezeend", ( event ) => {
				// this.#transformEvents( this.#controller1, event );
				let mode = this.#transformController.mode
				mode = (mode == "translate" ? "rotate" : ( mode == "rotate" ? "scale" : "translate" ))
				
				this.#transformController.setMode( mode );
				this.#transformController.setSpace( mode == "rotate" ? "local" : "world" );
				console.log("squeezeend")
			} );

			this.#controller0.addEventListener( "squeezestart", ( event ) => {

				const primitiveModule = this.#callbacks?.addModule( "PrimitiveModule" );
				primitiveModule.updateTransform( { translation: this.#controller0.position.toArray( ), scale: [ 0.1, 0.1, 0.1 ] }, true );
				this.#primtives.add( primitiveModule );
				
				this.#selectedPrimitive = primitiveModule;
				console.log( " selected ", primitiveModule )
				console.log( this.#selectedPrimitive )
				console.log( this )
				this.#transformController.setModule( primitiveModule );
			} );
			// this.#controller1.addEventListener( "selectend", ( event ) => {
			// 	this.#transformEvents( this.#controller1, event );
			// } );
			this.#controller0.addEventListener( "selectstart", ( event ) => {
				const primitiveViews = [ ...this.#primtives].map( primitiveModule => {
					return this.#callbacks?.getView( primitiveModule );
				} );
				// console.log(this.#primtives )
				// console.log(primitiveViews )
				raycaster.setFromXRController( this.#controller0 );
				const intersections = raycaster.intersectObjects( primitiveViews );
				// console.log(intersections)
				for ( const hit of intersections ) {
					// console.log( hit.object )
					const { object } = hit;
					if ( object.type == "Mesh" ) {
						const module = object.module ?? object.parent.module;
						console.log( module )
						if ( module && module.type == "PrimitiveModule" ) {
							this.#selectedPrimitive = module;
							this.#transformController.setModule( module );

						}
					}
				}
				// for ( const view of this.#primtives ) {
				// 	raycaster.setFromXRController( this.#controller0 );


				// }
				// this.#transformEvents( this.#controller1, event );
			} );



		});

		this.#renderer.xr.addEventListener('sessionend', () => {
			console.log('XR ended');
		});

		window.onresize = this.#onWindowResize.bind( this );
	}

	setCallbacks ( callbacks ) {
		this.#callbacks = callbacks;
	}

	#transformEvents ( controller, event ) {
		this.#transformController.getRaycaster().setFromXRController( controller );
		switch ( event.type ) {
			case "selectstart":
				console.log( controller );
				console.log( "selectstart")
				this.#transformController.pointerDown( null );
				break;
			case "selectend":
				console.log( "selectend")
				this.#transformController.pointerUp( null );
				break;
			case "move":
				this.#transformController.pointerHover( null );
				this.#transformController.pointerMove( null );
				break;
		}
	}

	#addDebug ( ) {
		const axesHelper = new THREE.AxesHelper( );
		this.#scene.add( axesHelper );
		const gridHelper = new THREE.GridHelper( );
		this.#scene.add( gridHelper );


		const divs = 10;
		const sphereGroup = new THREE.Group( );
		const sphereGeometry = new THREE.SphereGeometry( 0.1, 16, 16 );
		// for ( let i = 0; i < divs; ++i ) {
		// 	for ( let j = 0; j < divs; ++j ) {
		// 		for ( let k = 0; k < divs; ++k ) {
		// 			const material = new THREE.MeshPhongMaterial( { color: new THREE.Color( i / divs, j / divs, k / divs) } );
		// 			const sphere = new THREE.Mesh( sphereGeometry, material)
		// 			sphereGroup.add( sphere );
		// 			sphere.position.set( -5 + ( 10 / divs ) *i, -5 + ( 10 / divs ) *j, -5 + ( 10 / divs ) *k )
		// 		} 
		// 	} 
		// }
		this.#scene.add( sphereGroup );
	}

	#onWindowResize ( ) {
		this.#camera.aspect = window.innerWidth / window.innerHeight;
		this.#camera.updateProjectionMatrix();

		this.#renderer.setSize(window.innerWidth, window.innerHeight);
	}

	#animate ( time, frame ) {
		this.#renderer.render(this.#scene, this.#camera);
		this.#onRender?.( time, frame );
	}

	startRender ( ) {
		this.#renderer.setAnimationLoop( this.#animate.bind(this) );
	}

	stopRender ( ) {
		this.#renderer.setAnimationLoop(null);
	}

	get camera ( ) {
		return this.#camera;
	}

	get controls ( ) {
		return this.#cameraController;
	}

	get transformController ( ) {
		return this.#transformController;
	}

	get sceneGraphController ( ) {
		return this.#sceneGraphController;
	}

	get scene ( ) {
		return this.#scene;
	}

	get renderer ( ) {
		return this.#renderer;
	}

	set onRender ( callback ) {
		this.#onRender = callback;
	}
}