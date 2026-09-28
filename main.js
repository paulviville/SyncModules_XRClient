import ClientManager from "./ClientManager.js";
import ClientNetwork from "./ClientNetwork.js";
import GUIController from "./GUIController.js";
import ViewsRegistry from "./SyncModulesViews/ViewsRegistry.js";
import SceneController from "./SceneController.js";
import CameraController from "./SyncModulesViews/Controllers/CameraController.js";

import GLTFImportController from "./SyncModulesViews/Controllers/GLTFImportController.js";
import ImageImportController from "./SyncModulesViews/Controllers/ImageImportController.js";
import ImageModule from "./SyncModules/ImageModule.js";
// import { error } from "three/src/utils.js";
import * as THREE from "./three/three.module.js";
import DisplayController from "./DisplayController.js";


const params = new URLSearchParams(window.location.search);
console.log(params)
const windowId = params.get("id");

console.log(windowId);




// new CameraController
const SCOPES = {
	SYSTEM: "SYSTEM",
	INSTANCE: "INSTANCE",
	MODULE: "MODULE",
};

const INSTANCE_COMMANDS = {
	INSTANCE_LIST: "INSTANCE_LIST",
	INSTANCE_ADD: "INSTANCE_ADD",
	INSTANCE_REMOVE: "INSTANCE_REMOVE",
	INSTANCE_JOIN: "INSTANCE_JOIN",
	INSTANCE_LEAVE: "INSTANCE_LEAVE",
	INSTANCE_CLEAR: "INSTANCE_CLEAR",
}

const instanceList = new Set( );


// const sceneController = new SceneController( );
// sceneController.startRender( );


const clientManager = new ClientManager( );
// const clientNetwork = new ClientNetwork( );
const guiController = new GUIController( );

// const viewsRegistry = new ViewsRegistry(clientManager.modulesRegistry );
// sceneController.scene.add(clientManager.viewsRegistry);


clientManager.connect("ws://130.79.90.188");
// clientManager.connect();

// clientManager.connect("wss://gscop-continuum.g-scop.grenoble-inp.fr", "443");
// clientManager.connect("wss://icos.univ-reims.fr", "443");

const sceneController = clientManager.sceneController;
console.log(sceneController)



window.clientManager = clientManager;
// window.onbeforeunload( ( event ) =>  );
window.addEventListener("beforeunload", (event) => { clientManager.beforeUnload( event ) } );

// const testUUID = "00000000-0000-0000-0000-000000000000";
let testModule;

window.addModule = ( type, sync = false ) => {
	// clientManager.modulesRegistry.input({
	// 	moduleUUID: "00000000-0000-0000-0000-000000000000",
	// 	command: "ADD_MODULE",
	// 	data: { type: "ModuleCore", UUID: crypto.randomUUID()},
	// });
	console.log(clientManager.modulesRegistry)
	const UUID = crypto.randomUUID();
	clientManager.modulesRegistry.addModule(
		type,
		UUID,
		sync
	);

	testModule = clientManager.modulesRegistry.modules.get( UUID );
	window.module = testModule;
}




window.removeModule = ( UUID, sync = false ) => {
	clientManager.modulesRegistry.removeModule( testModule.UUID, sync );
}


window.addInstance = ( ) => {
	const instanceUUID = crypto.randomUUID( );
	instanceList.add( instanceUUID );

	const messageData = {
		senderUUID: clientManager.UUID,
		scope: SCOPES.SYSTEM,
		payload: {
			command: INSTANCE_COMMANDS.INSTANCE_ADD,
			data: {
				instanceUUID: instanceUUID,
			},
		}
	}
	const message = JSON.stringify( messageData );

	clientManager.clientNetwork.send( message );
}

window.removeInstance = ( instanceUUID ) => {
	instanceList.delete( instanceUUID );

	const messageData = {
		senderUUID: clientManager.UUID,
		scope: SCOPES.SYSTEM,
		payload: {
			command: INSTANCE_COMMANDS.INSTANCE_REMOVE,
			data: {
				instanceUUID: instanceUUID,
			},
		}
	}
	const message = JSON.stringify( messageData );

	clientManager.clientNetwork.send( message );
}

window.joinInstance = ( instanceUUID ) => {

	const messageData = {
		senderUUID: clientManager.UUID,
		scope: SCOPES.SYSTEM,
		payload: {
			command: INSTANCE_COMMANDS.INSTANCE_JOIN,
			data: {
				instanceUUID: instanceUUID,
				userUUID: clientNetwork.UUID,
			},
		}
	}
	const message = JSON.stringify( messageData );

	clientManager.clientNetwork.send( message );
}

window.leaveInstance = ( instanceUUID ) => {

	const messageData = {
		senderUUID: clientManager.UUID,
		scope: SCOPES.SYSTEM,
		payload: {
			command: INSTANCE_COMMANDS.INSTANCE_LEAVE,
			data: {
				instanceUUID: instanceUUID,
				userUUID: clientNetwork.UUID,
			},
		}
	}
	const message = JSON.stringify( messageData );

	clientManager.clientNetwork.send( message );
}


window.clearInstance = ( ) => {
	clientManager.clearInstance( );
}

let pointsModule = null;
window.testPoints = ( ) => {
	const UUID = crypto.randomUUID();
	const module = clientManager.modulesRegistry.addModule(
		"PointsModule",
		UUID,
		true
	);
	module.addPoints([{UUID: 1234, position: [1,2,3]}, {UUID: 2345, position: [2,3,4]}], true)
	module.addPoints([{UUID: 3456, position: [-1,2,-3]}, {UUID: 4567, position: [2,-3,4]}], true )

	// module.removePoints( [{UUID: 1234 }]);
	const state = module.getState();
	console.log(state)

	pointsModule = module;
	// module.clear( )
}

window.testPoints2 = ( ) => {
	const module = pointsModule;

	// module.removePoints( [{UUID: 1234}, {UUID: 3456}, {UUID: 4567}]);

	
	module.clear( true )
}

let textLogModule = null;
window.testTextLog = ( ) => {
	const UUID = crypto.randomUUID();
	const textLogModule = clientManager.addModule(
		"TextLogModule",
		true,
		true,
		true
	);
	
	window.textLogModule = textLogModule;

	textLogModule.addText( "test 0 ", true );
	textLogModule.addText( "test 1 ", true );
	textLogModule.addText( "test 2 ", true );
}

window.testTrigger = ( ) => {
	const triggerModule = clientManager.addModule(
		"TriggerModule",
		true,
		true,
		true
	);
	
	window.triggerModule = triggerModule;
}


function glbInjection ( arrayBuffer ) {
	const view = new DataView(arrayBuffer);
	const jsonChunkLength = view.getUint32(12, true);
	const jsonBytes = new Uint8Array(arrayBuffer, 20, jsonChunkLength);
	const jsonString = new TextDecoder().decode(jsonBytes);
	const json = JSON.parse(jsonString);
	console.log(json)

	if ( json.nodes ) {

	}
}

let fileModule = null;



window.testFileModule2 = ( ) => {
	const graphModule = clientManager.addModule(
		"GLTFModule",
		true,
		true,
		true
	);
	
	window.graphModule = graphModule;

	const gltfImportController = new GLTFImportController( );
	gltfImportController.setModule( graphModule );
	gltfImportController.inputFile( );

}

window.testFileModule3 = ( node = 0 ) => {
	clientManager.sceneController.sceneGraphController.setModule( window.graphModule );
	clientManager.sceneController.sceneGraphController.setTargetNode( window.graphModule.nodeUUIDs[node] );
}


window.testImageModule = ( x = 0, y = 0, z = 0 ) => {
	const imageModule = clientManager.addModule(
		"ImageModule",
		true,
		true,
		true,
	);

	const imageImportController = new ImageImportController( );
	imageImportController.setModule( imageModule );
	imageImportController.inputFile( );

	imageModule.updateTransform( { translation: [ x, y, z] }, true );
}

window.testImage360Module = ( x = 0, y = 0, z = 0 ) => {
	const imageModule = clientManager.addModule(
		"Image360Module",
		true,
		true,
		true,
	);

	const imageImportController = new ImageImportController( );
	imageImportController.setModule( imageModule );
	imageImportController.inputFile( );

	imageModule.updateTransform( { translation: [ x, y, z] }, true );
}

const bones = [ ];
let skelHelper;
let skelModule;
let boneTransforms;
window.skeletonTest = ( ) =>  {
	const boneUUIDs = [
		{
			UUID: crypto.randomUUID( ),
			parent: undefined,
		},
		{
			UUID: crypto.randomUUID( ),
			parent: undefined,
		},
		{
			UUID: crypto.randomUUID( ),
			parent: undefined,
		},
		{
			UUID: crypto.randomUUID( ),
			parent: undefined,
		},
	]
	boneUUIDs[ 1 ].parent = boneUUIDs[ 0 ].UUID;
	boneUUIDs[ 2 ].parent = boneUUIDs[ 1 ].UUID;
	boneUUIDs[ 3 ].parent = boneUUIDs[ 1 ].UUID;

	boneTransforms = [
		{
			UUID: boneUUIDs[ 0 ].UUID,
			transform: {
				translation: [ 0, 1, 0.5 ],
			},
		},
		{
			UUID: boneUUIDs[ 1 ].UUID,
			transform: {
				translation: [ 1, 0, 0 ],
			},
		},
		{
			UUID: boneUUIDs[ 2 ].UUID,
			transform: {
				translation: [ 0, 1, 0 ],
			},
		},
		{
			UUID: boneUUIDs[ 3 ].UUID,
			transform: {
				translation: [ 0, 0, 1 ],
			},
		},
	]

	skelModule = clientManager.addModule( "SkeletonModule", 
		true,
		true,
		true
	);

	skelModule.setBones( boneUUIDs, true );

	skelModule.setTransforms( boneTransforms, true );
}

window.skeletonTest2 = ( ) =>  {
	boneTransforms[0].transform.translation = [ 1, 0, 1 ];
	boneTransforms[1].transform.translation = [ 0, 1, 1 ];
	boneTransforms[2].transform.translation = [ 1, 0, 1 ];
	boneTransforms[3].transform.translation = [ 1, 1, 1 ];
	skelModule.setTransforms( boneTransforms, true );

}

window.skeletonTest3 = ( ) =>  {
	const r0 = new THREE.Quaternion( ).setFromAxisAngle( new THREE.Vector3( 0, 1, 0), Math.PI / 3  );
	boneTransforms[0].transform.rotation = r0.toArray( );
	skelModule.setTransforms( boneTransforms, true );

}

let displayModule;


window.testDisplays2 = ( ) => {
	displayModule.addDisplay( {
		label: "display0",
		UUID: crypto.randomUUID( ),
		corners: [
			[ 0.5, -0.5, 1.5 ],
			[ -0.5, -0.5, 1.5 ],
			[ 0.5, 0.5, 1.5 ],
			[ -0.5, 0.5, 1.5 ],
		]
	}, true );
}

window.testDisplays3 = ( ) => {
	displayModule.addDisplay( {
		label: "display1",
		UUID: crypto.randomUUID( ),
		corners: [
			[ 0.5, 0.75, 1.5 ],
			[ -0.5, 0.75, 1.5 ],
			[ 0.5, 1.75, 1.0 ],
			[ -0.5, 1.75, 1.0 ],
		]
	}, true );
}

window.testDisplays4 = ( ) => {
	displayModule.addDisplay( {
		label: "display1",
		UUID: crypto.randomUUID( ),
		corners: [
			[ -0.75, -0.5, 1.5 ],
			[ -1.75, -0.5, 1.0 ],
			[ -0.75, 0.5, 1.5 ],
			[ -1.75, 0.5, 1.0 ],
		]
	}, true );
}

window.initClientDisplay = ( ) => {
	clientManager.modulesRegistry.setOnChange( "ADD_MODULE", ( moduleData ) => {
		console.log( moduleData )
		
		if( moduleData.type == "DisplaysModule" ) {
			const camera = sceneController.camera;
			displayModule = clientManager.modulesRegistry.getModule( moduleData.UUID );
			console.log(displayModule )
			displayModule.setOnChange( displayModule.commands.setMatrices, ( matrices ) => {
				camera.matrixAutoUpdate = false;
				camera.matrixWorldInverse.fromArray( matrices.view );
				camera.matrixWorld.fromArray( matrices.view ).invert( );
				camera.projectionMatrix.fromArray( matrices.projection );
				camera.projectionMatrixInverse.fromArray( matrices.projection ).invert( );
			} );
		}
	} );
}


const headMatrix = new THREE.Matrix4( ).makeTranslation( 0, 1, 0 );
const eye = new THREE.Vector3( 0.1, 1, 0.05 );
const nearCP = 0.1;
const farCP = 10.1;


( () => {
	let z = 1 / Math.tan( 35/180 * Math.PI );
	eye.set( 0, 1, -z );
})()

function computeMatrix ( screenCorners, eye ) {
	const corners = screenCorners.map( c => {
		return new THREE.Vector3( ).fromArray( c );
	} );
	const ss = { 
		X: new THREE.Vector3( ), 
		Y: new THREE.Vector3( ), 
		Z: new THREE.Vector3( ), 
		R: new THREE.Matrix4( ) 
	};

	ss.X.copy( corners[ 1 ] ).sub( corners[ 0 ] ).normalize( );
	ss.Y.copy( corners[ 2 ] ).sub( corners[ 0 ] ).normalize( );
	ss.Z.crossVectors( ss.X, ss.Y ).normalize( );

	ss.R.makeBasis( ss.X, ss.Y, ss.Z ).transpose( );

	corners.forEach( c => { c.sub( eye ); } );
	const dist = - corners[ 0 ].dot( ss.Z );
	const ND = nearCP / dist;

	const l = ss.X.dot( corners[ 0 ] ) * ND;
	const r = ss.X.dot( corners[ 1 ] ) * ND;
	const b = ss.Y.dot( corners[ 0 ] ) * ND;
	const t = ss.Y.dot( corners[ 2 ] ) * ND;

	const projection = new THREE.Matrix4( );
	projection.set(
		(2.0 * nearCP) / (r - l), 0.0, (r + l) / (r - l), 0.0,
		0.0, (2.0 * nearCP) / (t - b), (t + b) / (t - b), 0.0, 
		0.0, 0.0, -(farCP + nearCP) / (farCP - nearCP), -(2.0 * farCP * nearCP) / (farCP - nearCP),
		0.0, 0.0, -1.0, 0.0
	);
	const view = new THREE.Matrix4( );
	view.makeTranslation( -eye.x, -eye.y, -eye.z );
	view.premultiply( ss.R );

	return { projection, view };
}

window.moveHead = ( x, y, z ) => {
	eye.set( x, y, z ); 
	const tEye = eye.clone().applyMatrix4( transformMat )
	const displays = displayModule.displays;
	for ( const display of displays ) {
		const cornerCopies = display.corners.map( c => {
			const c3 = new THREE.Vector3( ).fromArray( c );
			c3.applyMatrix4( transformMat );
			// console.log( c3 )
			return c3.toArray( ); 
		} );
		const matrices = computeMatrix( cornerCopies, tEye );
		
		const { UUID } = display;
		displayModule.setMatrices( {
			UUID,
			view: matrices.view.toArray( ),
			projection: matrices.projection.toArray( ),
		}, true );
	}
}


const transforms = {
	translation: new THREE.Vector3( 0, 0, 0 ),
	scale: new THREE.Vector3( 1, 1, 1 ),
	rotation: new THREE.Quaternion( 0, 0, 0, 1 ),
}
const transformsArr = {
	translation: [ 0, 0, 0 ],
	scale: [ 1, 1, 1 ],
	rotation: [ 0, 0, 0, 1 ],
}
const transformMat = new THREE.Matrix4( ).compose( transforms.translation, transforms.rotation, transforms.scale );

window.testDisplays = ( ) => {
	displayModule = clientManager.addModule( "DisplaysModule", 
		true,
		true,
		true
	);

	displayModule.setOnChange( "ADD_DISPLAY", ( display ) => {
		const matrices = computeMatrix( display.corners, eye );
		
		const { UUID } = display;
		displayModule.setMatrices( {
			UUID,
			view: matrices.view.toArray( ),
			projection: matrices.projection.toArray( ),
		}, true );
	} );

	// sceneController.controls.addEventListener( `change`, ( event ) => {
	// 	const { x, y, z } = sceneController.camera.position;
	// 	window.moveHead( x, y, z );
	// } );
	
	window.addEventListener( 'keydown', function ( event ) {
		const { x, y, z } = eye;
		switch ( event.key ) {
			case "0":
				window.moveHead( x, y - 0.05, z );
				break;
			case "5":
				window.moveHead( x, y + 0.05, z );
				break;
			case "2":
				window.moveHead( x, y, z - 0.05 );
				break;
			case "8":
				window.moveHead( x, y, z + 0.05 );

				break;
			case "4":
				window.moveHead( x + 0.05, y, z );

				break;
			case "6":
				window.moveHead( x - 0.05, y, z );

				break;
			default:
				break;
		}

	})
}

window.transformDisplay = ( { position, scale, rotation } ) => {
	// const transform = { };
	if ( position ) {
		transformsArr.translation = [ ...position ]
	}
	if ( scale ) {
		transformsArr.scale = [ ...scale ]
	}
	if ( rotation ) {
		transformsArr.rotation = [ ...rotation ]
	}

	transforms.translation.fromArray( transformsArr.translation );
	transforms.rotation.fromArray( transformsArr.rotation );
	transforms.scale.fromArray( transformsArr.scale );
	displayModule.updateTransform( transformsArr, true );

	const tempEye = eye.clone( );
	transformMat.compose( transforms.translation, transforms.rotation, transforms.scale );
	tempEye.applyMatrix4( transformMat.clone( ) );

	console.log( transforms )
	console.log( transformMat )


	const displays = displayModule.displays;
	console.log(displays)
	for ( const display of displays ) {
		// console.log(display)
		const cornerCopies = display.corners.map( c => {
			const c3 = new THREE.Vector3( ).fromArray( c );
			c3.applyMatrix4( transformMat );
			// console.log( c3 )
			return c3.toArray( ); 
		} );
		const matrices = computeMatrix( cornerCopies, tempEye );
		// console.log(matrices )
		const { UUID } = display;
		displayModule.setMatrices( {
			UUID,
			view: matrices.view.toArray( ),
			projection: matrices.projection.toArray( ),
		}, true );
	}

	// eye.copy( tempEye );
}


window.initializeDisplays = ( ) => {
	displayModule = clientManager.addModule( "DisplaysModule", 
		true,
		true,
		true
	);

	const displayController = new DisplayController( );
	displayController.setModule( displayModule );

	displayModule.setOnChange( "ADD_DISPLAY", ( display ) => {
		const matrices = computeMatrix( display.corners, eye );
		
		const { UUID } = display;
		displayModule.setMatrices( {
			UUID,
			view: matrices.view.toArray( ),
			projection: matrices.projection.toArray( ),
		}, true );
	} );

	// sceneController.controls.addEventListener( `change`, ( event ) => {
	// 	const { x, y, z } = sceneController.camera.position;
	// 	window.moveHead( x, y, z );
	// } );
	
}

let bezierCurveModule;
window.testBezier = ( ) => {
	bezierCurveModule = clientManager.addModule( "BezierCurveModule", 
		true,
		true,
		true
	);

	bezierCurveModule.addPoints([{UUID: 1234, position: [1,1,1]}, {UUID: 2345, position: [-1,-1,1]}, {UUID: 3456, position: [-1,1,-1]}, {UUID: 4567, position: [1,-1,-1]}], true)
}

window.testBezier2 = ( ) => {

	bezierCurveModule.updatePoints([{UUID: 2345, position: [-1,-2,1]}, {UUID: 3456, position: [-1,2,-1]}], true)
}

let bezierPatchModule;
window.testBezierPatch = ( ) => {
	bezierPatchModule = clientManager.addModule( "BezierPatchModule", 
		true,
		true,
		true
	);


}

window.testBezierPatch2 = ( ) => {
	bezierPatchModule.updatePoints( [
		{ UUID: 0, position: [ -1.5, -1.5, 0 ] },
		{ UUID: 1, position: [ -0.5, -1.5, -0.75 ] },
		{ UUID: 2, position: [ 0.5, -1.5, -0.75 ] },
		{ UUID: 3, position: [ 1.5, -1.5, -1.5 ] },

		{ UUID: 4, position: [ -1.5, -0.5, 0 ] },
		{ UUID: 5, position: [ -0.5, -0.5, -0.5 ] },
		{ UUID: 6, position: [ 0.5, -0.5, 3.5 ] },
		{ UUID: 7, position: [ 1.5, -0.5, 0 ] },

		{ UUID: 8, position: [ -1.5, 0.5, 0 ] },
		{ UUID: 9, position: [ -0.5, 0.5, -0.5 ] },
		{ UUID: 10, position: [ 0.5, 0.5, 3.5 ] },
		{ UUID: 11, position: [ 1.5, 0.5, 0 ] },

		{ UUID: 12, position: [ -1.5, 1.5, -0.5 ] },
		{ UUID: 13, position: [ -0.5, 1.5, 0 ] },
		{ UUID: 14, position: [ 0.5, 1.5, -1 ] },
		{ UUID: 15, position: [ 1.5, 1.5, 0 ] },
	], true)

}