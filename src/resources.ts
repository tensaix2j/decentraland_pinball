
export default {
	
	sounds: {
		bell	 : new AudioClip("sounds/bell.mp3"),
		launch   : new AudioClip("sounds/launch.mp3"),
		flipper  : new AudioClip("sounds/flipper.mp3"),
		bump     :  new AudioClip("sounds/bump.mp3"),
		pop      : new AudioClip("sounds/pop.mp3"),
		click    : new AudioClip("sounds/click.mp3"),
		hole     : new AudioClip("sounds/hole.mp3"),
		die 	 : new AudioClip("sounds/die.mp3"),
		passlane : new AudioClip("sounds/passlane.mp3"),
		tada     : new AudioClip("sounds/tada.mp3"),
		jackpot  : new AudioClip("sounds/jackpot.mp3"),
		sad      : new AudioClip("sounds/sadtrombone.mp3"),
		gameover : new AudioClip("sounds/gameover.mp3"),
		bgmusic  : new AudioClip("sounds/bgmusic.mp3")
	},
	
	models: {
		machine: new GLTFShape("models/txpinball/txpinball.gltf")

	},
	textures: {
		pinball: new Texture("models/txpinball/pinball.png"),
		circle : new Texture("models/txpinball/circle.png")
	}
};






