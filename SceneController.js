import * as THREE from './three/three.module.js';
import { OrbitControls } from './three/controls/OrbitControls.js';
import CameraController from './SyncModulesViews/Controllers/CameraController.js';
import TransformController from './SyncModulesViews/Controllers/TransformController.js';
import { TransformControls } from "controls/TransformControls.js";
import SceneGraphController from './SyncModulesViews/Controllers/SceneGraphController.js';

import { XRControllerModelFactory } from './three/webxr/XRControllerModelFactory.js';
import XRInputListener from './XRInputListener.js';
import GLTFImportController from './SyncModulesViews/Controllers/GLTFImportController.js';

// import leftModel from './left.glb'

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
	#lineModule;


	constructor ( ) {
		console.log( `SceneController - constructor` );
		// console.log( leftModel )

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

		const xrInputListener = new XRInputListener( this.#renderer.xr );

		this.#renderer.xr.addEventListener('sessionstart', ( ) => {
			xrInputListener.sessionStart( );



			const gltfImportController0 = new GLTFImportController( );
			const gltfImportController1 = new GLTFImportController( );
			const gltfImportController2 = new GLTFImportController( );
			const gltfImportController3 = new GLTFImportController( );
			const leftModule = this.#callbacks?.addModule( "GLTFModule", false );
			const rightModule = this.#callbacks?.addModule( "GLTFModule", false );
			const headModule = this.#callbacks?.addModule( "GLTFModule", false );
			const chestModule = this.#callbacks?.addModule( "GLTFModule", false );
			const lineModule = this.#callbacks?.addModule( "LineModule", true );

			gltfImportController0.setModule( leftModule );
			gltfImportController0.loadFile( "./left.glb" );
			gltfImportController1.setModule( rightModule );
			gltfImportController1.loadFile( "./right.glb" );
			gltfImportController2.setModule( headModule );
			gltfImportController2.loadFile( "./head.glb" );
			gltfImportController3.setModule( chestModule );
			gltfImportController3.loadFile( "./chest.glb" );


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


			// xrInputListener.addCallback( "left", 0, "buttonDown", ( ) => { console.log( "left 0 down" ) } );
			// xrInputListener.addCallback( "left", 1, "buttonDown", ( ) => { console.log( "left 1 down" ) } );
			// xrInputListener.addCallback( "left", 3, "buttonDown", ( ) => { console.log( "left 3 down" ) } );
			// xrInputListener.addCallback( "left", 4, "buttonDown", ( ) => { console.log( "left 4 down" ) } );
			// xrInputListener.addCallback( "left", 5, "buttonDown", ( ) => { console.log( "left 5 down" ) } );
			
			// xrInputListener.addCallback( "right", 0, "buttonDown", ( ) => { console.log( "right 0 down" ) } );
			// xrInputListener.addCallback( "right", 1, "buttonDown", ( ) => { console.log( "right 1 down" ) } );
			// xrInputListener.addCallback( "right", 3, "buttonDown", ( ) => { console.log( "right 3 down" ) } );
			// xrInputListener.addCallback( "right", 4, "buttonDown", ( ) => { console.log( "right 4 down" ) } );
			// xrInputListener.addCallback( "right", 5, "buttonDown", ( ) => { console.log( "right 5 down" ) } );


			xrInputListener.addButtonCallback( "right", 0, "buttonDown", ( ) => {
				this.#transformEvents( this.#controller1, { type: "selectstart"} );
			} );
			xrInputListener.addButtonCallback( "right", 0, "buttonUp", ( ) => {
				this.#transformEvents( this.#controller1, { type: "selectend"} );
			} );
			xrInputListener.addButtonCallback( "right", 1, "buttonUp", ( ) => {
				let mode = this.#transformController.mode
				mode = (mode == "translate" ? "rotate" : ( mode == "rotate" ? "scale" : "translate" ))
				
				this.#transformController.setMode( mode );
				this.#transformController.setSpace( mode == "rotate" ? "local" : "world" );
			} );
			xrInputListener.addButtonCallback( "right", 4, "buttonDown", ( ) => {
				if ( this.#selectedPrimitive === undefined ) {
					return;
				}
				
				const primitiveTypes = this.#selectedPrimitive.primitiveTypes;
				console.log( primitiveTypes)
				let nextType;
				switch ( this.#selectedPrimitive.primitive ) {
					case primitiveTypes.Sphere:
						nextType = primitiveTypes.Cube;
						break;
					case primitiveTypes.Cube:
						nextType = primitiveTypes.Cone;
						break;
					case primitiveTypes.Cone:
						nextType = primitiveTypes.Cylinder;
						break;
					case primitiveTypes.Cylinder:
						nextType = primitiveTypes.Capsule;
						break;
					case primitiveTypes.Capsule:
					default:
						nextType = primitiveTypes.Sphere;
				}

				this.#selectedPrimitive.updatePrimitive( nextType, true );
			} );

			xrInputListener.addButtonCallback( "left", 1, "buttonDown", ( ) => {
				const primitiveModule = this.#callbacks?.addModule( "PrimitiveModule" );
				primitiveModule.updateTransform( { translation: this.#controller0.position.toArray( ), scale: [ 0.1, 0.1, 0.1 ] }, true );
				// this.#primtives.add( primitiveModule );
				this.addPrimitive( primitiveModule );
				
				this.#selectedPrimitive = primitiveModule;
				this.#transformController.setModule( primitiveModule );
			} );
			xrInputListener.addButtonCallback( "left", 0, "buttonHeld", ( ) => {
				const primitiveViews = [ ...this.#primtives].map( primitiveModule => {
					return this.#callbacks?.getView( primitiveModule );
				} );
				raycaster.setFromXRController( this.#controller0 );
				const intersections = raycaster.intersectObjects( primitiveViews );

				const origin = raycaster.ray.origin.clone( );
				const end = origin.clone( ).add( raycaster.ray.direction );
				if ( intersections.length ) {
					for ( const hit of intersections ) {
						const { object } = hit;
						if ( object.type == "Mesh" ) {
							const module = object.module ?? object.parent.module;
							if ( module && module.type == "PrimitiveModule" ) {
								const { point } = hit;
								end.copy( point );
							}
						}
					}
				}
				lineModule.updateLine( {
					origin: origin.toArray( ),
					end: end.toArray( ),
				}, true );
			} );
			xrInputListener.addButtonCallback( "left", 0, "buttonUp", ( ) => {
				lineModule.updateLine( {
					origin: [ 0, 0, 0 ],
					end: [ 0, 0, 0 ],
				}, true );

				const primitiveViews = [ ...this.#primtives].map( primitiveModule => {
					return this.#callbacks?.getView( primitiveModule );
				} );

				raycaster.setFromXRController( this.#controller0 );
				const intersections = raycaster.intersectObjects( primitiveViews );

				if ( intersections.length == 0 ) {
					this.#selectedPrimitive = undefined;
					this.#transformController.setModule( undefined );
				}

				for ( const hit of intersections ) {
					const { object } = hit;
					if ( object.type == "Mesh" ) {
						const module = object.module ?? object.parent.module;
						if ( module && module.type == "PrimitiveModule" ) {
							this.#selectedPrimitive = module;
							this.#transformController.setModule( module );
						}
					}
				}
				

			} );
			xrInputListener.addButtonCallback( "left", 4, "buttonDown", ( ) => {
				if ( this.#selectedPrimitive !== undefined ) {
					// this.#primtives.delete( this.#selectedPrimitive );
					this.removePrimitive( this.#selectedPrimitive );
					this.#callbacks?.removeModule( this.#selectedPrimitive.UUID );
					this.#selectedPrimitive = undefined;
					this.#transformController.setModule( this.#selectedPrimitive );
				}
			} );

			xrInputListener.addButtonCallback( "left", 5, "buttonDown", ( ) => {
				if ( this.#selectedPrimitive !== undefined ) {
					const primitiveModule = this.#callbacks?.addModule( "PrimitiveModule" );
					this.addPrimitive( primitiveModule );
					primitiveModule.updateTransform( this.#selectedPrimitive.transform, true );
					primitiveModule.updatePrimitive( this.#selectedPrimitive.primitive, true );
					this.#selectedPrimitive = primitiveModule;
					this.#transformController.setModule( primitiveModule );
				}
			} );

			xrInputListener.addMoveCallback( "right", ( transform ) => {
				this.#transformEvents( this.#controller1, { type: "move"} );
			} );

			let initRot;
			xrInputListener.addMoveCallback( "left", ( transform ) => {
				const nodes = leftModule.nodes;
				if ( !nodes.length )
					return;

				const rootUUID = leftModule.nodes.at( -1 ).UUID;

				if ( initRot === undefined ) {
					initRot = new THREE.Quaternion( ).fromArray( leftModule.nodeTransform( rootUUID ).rotation );
				}
				const rot = new THREE.Quaternion( ).fromArray( transform.rotation );
				rot.multiply( initRot );
				leftModule.updateNodes( [ {
					UUID: rootUUID,
					transform: {
						translation: transform.translation,
						rotation: rot.toArray( ),
					},
				} ], true );
			} );

			xrInputListener.addMoveCallback( "right", ( transform ) => {
				const nodes = rightModule.nodes;
				if ( !nodes.length )
					return;

				const rootUUID = rightModule.nodes.at( -1 ).UUID;

				if ( initRot === undefined ) {
					initRot = new THREE.Quaternion( ).fromArray( rightModule.nodeTransform( rootUUID ).rotation );
				}
				const rot = new THREE.Quaternion( ).fromArray( transform.rotation );
				rot.multiply( initRot );

				rightModule.updateNodes( [ {
					UUID: rootUUID,
					transform: {
						translation: transform.translation,
						rotation: rot.toArray( ),
					},
				} ], true );
			} );

			let headInitRot;
			xrInputListener.addMoveCallback( "head", ( transform ) => {
				const nodes = headModule.nodes;
				if ( !nodes.length )
					return;

				const rootUUID = headModule.nodes.at( 0 ).UUID;

				if ( headInitRot === undefined ) 
					headInitRot = new THREE.Quaternion( ).fromArray( headModule.nodeTransform( rootUUID ).rotation );
				const rot = new THREE.Quaternion( ).fromArray( transform.rotation );
				rot.multiply( headInitRot );

				headModule.updateNodes( [ {
					UUID: rootUUID,
					transform: {
						translation: transform.translation,
						rotation: rot.toArray( ),
					},
				} ], true );

				if ( !chestModule.nodes.length )
					return;

				const chestRootUUID = chestModule.nodes.at( 0 ).UUID;

				// if ( headInitRot === undefined ) 
					// headInitRot = new THREE.Quaternion( ).fromArray( chestModule.nodeTransform( rootUUID ).rotation );
				const chestRot = new THREE.Quaternion( ).fromArray( transform.rotation );
				// rot.multiply( headInitRot );

				const chestTranslation = [ ...transform.translation ];
				chestTranslation[ 2 ] += 0.1
				chestTranslation[ 1 ] -= 0.35
				// chestTranslation[ 2 ] -= 0.35

				const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(chestRot);
				forward.y = 0;
				forward.normalize();
				const yawOnly = new THREE.Quaternion().setFromAxisAngle(
					new THREE.Vector3(0, 1, 0),
					Math.atan2(forward.x, forward.z) + Math.PI
				);

				const euler = new THREE.Euler( ).setFromQuaternion( new THREE.Quaternion( ...transform.rotation ), "XYZ" );
				const chestRotation = ( new THREE.Quaternion( ).setFromAxisAngle( new THREE.Vector3(0,1, 0), euler.z ) );
				chestModule.updateNodes( [ {
					UUID: chestRootUUID,
					transform: {
						translation: chestTranslation,
						rotation: yawOnly.toArray( ),
					},
				} ], true );

			} );

			// this.#renderer.xr.getSession( ).addEventListener( 'inputsourceschange', ( event ) => { console.log( event ) } );


			const cameraModule = this.#callbacks.getCameraModule( );
			this.#callbacks.removeModule( cameraModule.UUID );
			const session = this.#renderer.xr.getSession();
			const inputSources = session.inputSources;
			
			const xr = this.#renderer.xr;
			this.onRender = ( time, frame ) => {
				if( xr.isPresenting ) {
					xrInputListener.process( frame );
				}
			}
		});

		this.#renderer.xr.addEventListener('sessionend', ( ) => {
			xrInputListener.sessionEnd( );
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


	addPrimitive ( primitiveModule ) {
		this.#primtives.add( primitiveModule );
	}

	removePrimitive ( primitiveModule ) {
		this.#primtives.delete( primitiveModule );
	}
}


