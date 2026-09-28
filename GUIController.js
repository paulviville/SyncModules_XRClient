import { GUI } from './three/libs/lil-gui.module.min.js';

export default class GUIController {
	#gui = new GUI ( );

	#folders = {
		connection: {
			folder: this.#gui.addFolder( "Connection" ),
			gui: { },
			data: {
				url: "ws://localhost",
				port: 8080,
				connect: ( ) => this.#handleConnect( ),
				disconnect: ( ) => this.#handleDisconnect( ),
			},
		},
		instances: {
			folder: this.#gui.addFolder( "Instances" ),
			subfolders: { },
			gui: { },
			data: {
				newInstance: "",
				selectedName: "",
				select: null,
				instances: {},
				create: ( ) => this.#handleInstanceCreate( ),
				join: ( ) => this.#handleInstanceJoin( ),
				leave: ( ) => this.#handleInstanceLeave( ),
			},
		},
	}

	constructor ( ) {
        console.log( `GUIController - constructor` );

		this.#createConnectionFolder( );
		this.#createInstancesFolder( );
		this.#folders.instances.folder.hide( );
	}



	#createConnectionFolder ( ) {
		const folder = this.#folders.connection.folder;
		const gui = this.#folders.connection.gui;
		const data = this.#folders.connection.data;

		gui.url = folder.add( data, "url" );
		gui.port = folder.add( data, "port" );
		gui.connect = folder.add( data, "connect" );
		gui.disconnect = folder.add( data, "disconnect" );

		gui.disconnect.hide( );
	}

	#createInstancesFolder ( ) {
		const folder = this.#folders.instances.folder;
		const gui = this.#folders.instances.gui;
		const data = this.#folders.instances.data;

		const subfolder = folder.addFolder( "create instance" );
		subfolder.close( );
		this.#folders.instances.subfolders.create = subfolder;
		gui.newInstance = subfolder.add( data, "newInstance" );
		gui.create = subfolder.add( data, "create" );
		gui.selectedName = folder.add( data, "selectedName" ).listen().disable();
		gui.join = folder.add( data, "join" );
		gui.leave = folder.add( data, "leave" );

		gui.leave.hide( );
		gui.selectedName.hide( );
	}

	#updateInstanceList ( instanceList ) {
        console.log( `GUIController - #updateInstanceList` );

		const folder = this.#folders.instances.folder;
		const data = this.#folders.instances.data;
		const gui = this.#folders.instances.gui;

		if ( gui.instanceList ) {
			gui.instanceList.destroy( );
		}

		data.instances = { };
		for( const instance of instanceList ) {
			data.instances[ instance.name ] = instance.name;
		}

		gui.instanceList = folder.add( data, "select", data.instances );
		gui.instanceList.onChange ( ( value ) => {
			data.select = value;
		});

		if ( data.selectedName != "" ) {
			gui.instanceList.hide( );
		}
	}

	#handleConnect ( ) {
        console.log( `GUIController - #handleConnect` );
		const data = this.#folders.connection.data;
		
		const gui = this.#folders.connection.gui;
		gui.url.hide( );
		gui.port.hide( );
		gui.connect.hide( );
		gui.disconnect.show( );
	}

	#handleDisconnect ( ) {
        console.log( `GUIController - #handleDisconnect` );

		const gui = this.#folders.connection.gui;
		gui.url.show( );
		gui.port.show( );
		gui.connect.show( );
		gui.disconnect.hide( );

		this.#folders.instances.folder.hide( );
	}

	#handleInstanceJoin ( ) {
        console.log( `GUIController - #handleInstanceJoin` );

		const selected = this.#folders.instances.data.select;

		if ( selected ?? false ) {
			events.emit( Events.instanceJoin, { instanceName: selected } );
		}
	}

	#handleInstanceCreate ( ) {
        console.log( `GUIController - #handleInstanceCreate` );

		const newInstance = this.#folders.instances.data.newInstance;

		if ( newInstance != "" ) {
			events.emit( Events.instanceNew, { instanceName: newInstance } );

			this.#folders.instances.data.newInstance = "";
		}
		
	}

	#handleInstanceLeave ( ) {
        console.log( `GUIController - #handleInstanceLeave` );

		const selected = this.#folders.instances.data.select;
		if ( selected ?? false ) {
			events.emit( Events.instanceLeave, { instanceName: selected } );
		}


	}
}