
import resources from "src/resources";
import {Txbox} from "src/gameObjects/txbox" 


export class Txtext extends Entity {
	
	public id;
	public parent;
	public transform; 
	public text_shape;
	public text_entity;
	public text_transform;
	public text_material;

	constructor( parent, transform_args , id ) {

		super();
		this.id = id;
		this.parent = parent;
		this.setParent( parent );
		engine.addEntity( this );
		
		this.transform = new Transform( transform_args );
		this.addComponent( this.transform );

		let text_entity 	 = new Entity();
		this.text_shape 		 = new TextShape("");
		
		this.text_shape.hTextAlign = "left";
		this.text_shape.vTextAlign = "top";


		this.text_shape.color    = Color3.Black();
		
		let text_material = new Material();
		text_material.emissiveIntensity = 4.0;
		text_material.emissiveColor    = Color3.Yellow();


		let text_transform  = new Transform({
			position : new Vector3 ( 0,  0 , 0 ), 
    		scale    : new Vector3 ( 0.22,  0.22,  0.22 )
		});

		text_entity.setParent(this);
		text_entity.addComponent( this.text_shape );
		text_entity.addComponent( text_transform );
		text_entity.addComponent( text_material );
		engine.addEntity( text_entity );

		this.text_entity = text_entity;
		this.text_transform = text_transform;

	}

	//--
	setText( msg ) {
		this.text_shape.value = msg ;
	}

	
}