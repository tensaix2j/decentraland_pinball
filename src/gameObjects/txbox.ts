

import {b2Vec2} from "src/Box2D/Common/b2Math"
import {b2World} from "src/Box2D/Dynamics/b2World"
import {b2BodyDef}  from "src/Box2D/Dynamics/b2Body"
import {b2FixtureDef}  from "src/Box2D/Dynamics/b2Fixture"
import {b2PolygonShape}  from "src/Box2D/Collision/Shapes/b2PolygonShape"
import {b2BodyType} from "src/Box2D/Dynamics/b2Body"

export class Txbox extends Entity {


	public parent;
	public transform ;
	public box_transform;

	constructor( parent , x,y, width , height) {

		super();
		this.parent = parent;

		this.setParent( parent );
		engine.addEntity( this );
		this.transform = new Transform({
			position: new Vector3( x,y, -0.035),
			scale   : new Vector3( 1, 1 , 1);
		});
		this.addComponent( this.transform );

		// --------------------------------------
    	// Unity Geometry
    	let box_entity = new Entity();
		box_entity.setParent(this);
		engine.addEntity( box_entity );

		let box_shape = new BoxShape();
		box_shape.withCollisions	 = false;

		this.box_transform = new Transform({
			position: new Vector3( (width/2) , height/2, 0  ),
			scale   : new Vector3( width , height , 0.05  )
		}); 

		box_entity.addComponent( box_shape );
		box_entity.addComponent( this.box_transform );	


	}


	

}
