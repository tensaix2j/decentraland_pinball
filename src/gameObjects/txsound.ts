
import resources from "src/resources";

export class Txsound extends Entity {
	
	public parent;
	public sndClip;

	constructor( parent, audioclip ) {

		super();
		this.parent = parent;
		this.setParent( parent );
		engine.addEntity( this );
		
		this.sndClip = new AudioSource( audioclip );
		this.addComponent( this.sndClip );		
	
	}

	
	playOnce() {
		this.sndClip.playOnce();
	}

	playLoop() {
		this.sndClip.playing = true;
		this.sndClip.loop = true;
	}

	stopLoop() {
		this.sndClip.playing = false;
		this.sndClip.loop = false;
	}
}