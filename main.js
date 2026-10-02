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
// import DisplayController from "./DisplayController.js";

import { VRButton } from './three/webxr/VRButton.js'
import { XRControllerModelFactory } from './three/webxr/XRControllerModelFactory.js';
// import { setupWebGLXRFallback } from './three/webxr/WebGLXRFallback.js';

const params = new URLSearchParams(window.location.search);
console.log(params)
const windowId = params.get("id");












const SCOPES = {
	SYSTEM: "SYSTEM",
	INSTANCE: "INSTANCE",
	MODULE: "MODULE",
};


const clientManager = new ClientManager( );

const sceneController = clientManager.sceneController;
console.log(sceneController)
const cameraModule = clientManager.cameraModule;
console.log(cameraModule)

// const xr = sceneController.renderer.xr;
// sceneController.onRender = ( time, frame ) => {
// 	// console.log( time, frame );
// 	if( xr.isPresenting ) {
// 		const ref = xr.getReferenceSpace( );
// 		const pose = frame.getViewerPose( ref );
// 		// console.log( pose );
// 		if ( pose ) {
// 			const position = pose.transform.position;
// 			const orientation = pose.transform.orientation;
// 			// console.log( position, orientation );
// 			const transform = {
// 				translation: [ position.x, position.y, position.z ],
// 				rotation: [ orientation.x, orientation.y, orientation.z, orientation.w ],
// 			}
// 			cameraModule.updateTransform( transform, true );
// 		}

// 	}
// }

window.clientManager = clientManager;
window.addEventListener("beforeunload", ( event ) => { clientManager.beforeUnload( event ) } );

const controllerModelFactory = new XRControllerModelFactory();
document.body.appendChild( VRButton.createButton( sceneController.renderer ) );



clientManager.connect(`ws://130.79.90.188`, "3000");

