

import resources from "src/resources";

export class Txlight extends Entity {



	public parent;
	public transform ;
	public shape;
	public material;

	constructor( parent , x,y, size ) {

		super();
		this.parent = parent;

		this.setParent( parent );
		engine.addEntity( this );
		
		this.transform = new Transform({
			position: new Vector3( x,y, -0.02),
			scale   : new Vector3( size, size , size);
		});


		this.shape = new PlaneShape();
		this.withCollisions = false;
		
		this.material = new Material();
		this.material.albedoTexture = resources.textures.circle;
		this.material.roughness = 1.0;
		this.material.specularIntensity = 0.0;
		this.material.transparencyMode = 1;
		this.material.emissiveColor = Color3.Yellow();
		this.material.emissiveIntensity = 4.0;

		this.addComponent( this.shape );
		this.addComponent( this.transform );
		this.addComponent( this.material );

	}

}



