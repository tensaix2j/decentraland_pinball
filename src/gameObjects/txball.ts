


import {b2Vec2} from "src/Box2D/Common/b2Math"
import {b2World} from "src/Box2D/Dynamics/b2World"
import {b2BodyDef}  from "src/Box2D/Dynamics/b2Body"
import {b2BodyType} from "src/Box2D/Dynamics/b2Body"


import resources from "src/resources";

export class Txball extends Entity {
	
	public parent;
	public transform ;
	public shape;
	public material;
	public world;
	public box2dbody;
	public sticker = "";
	public stickerCountdown = 0;

	public start_x;
	public start_y;

	public ball_id;
	public visible = 1;


	constructor( parent , x,y, shape, material , size , world , ball_id ) {

		super();
		this.parent = parent;

		this.setParent( parent );
		engine.addEntity( this );
		
		this.transform = new Transform( {
			position: new Vector3( x , y, -0.05),
			scale   : new Vector3(size, size,0.01)
		});


		this.shape = shape;
		this.material = material;
		this.world   = world;
		
		this.start_x = x;
		this.start_y = y;
		this.ball_id = ball_id

		this.box2dbody = this.parent.createDynamicCircle(  
    				this.transform.position.x ,  
    				this.transform.position.y ,  
    				0.08 , 
    				this.world, 
    				true 
    	);
    	this.box2dbody.SetUserData( "ball" + ball_id );


		this.addComponent( this.shape );
		this.addComponent( this.transform );
		this.addComponent( this.material );
		this.addComponent( new Billboard() );

		if ( ball_id == 1 ) {
			this.hide();
		}
		
	}

	//------
	updatePosition_toBox2d()  {

		if ( this.visible == 1 && this.box2dbody.GetPosition().y < -1 ) {
			this.hide() );
			this.parent.ball_ondies( this.ball_id );
		}
		this.transform.position.x = this.box2dbody.GetPosition().x;
    	this.transform.position.y = this.box2dbody.GetPosition().y;
    	
	}
	//-----------
	hide() {

		this.visible = 0;
		this.box2dbody.SetPosition( new b2Vec2( this.start_x, -9 ) );
		this.box2dbody.SetType( b2BodyType.b2_staticBody );
		this.updatePosition_toBox2d();

	}
	show() {

		this.visible = 1;
		this.box2dbody.SetPosition( new b2Vec2( this.start_x, this.start_y ) );
		this.box2dbody.SetType( b2BodyType.b2_dynamicBody );
		this.box2dbody.SetAwake(true);
		this.updatePosition_toBox2d();	
	}


	//----
	SetPosition( x, y ) {
		this.box2dbody.SetPosition( new b2Vec2( x, y ) );
		this.updatePosition_toBox2d();
	}

}



