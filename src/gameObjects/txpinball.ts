


import resources from "src/resources";

import {b2Vec2} from "src/Box2D/Common/b2Math"
import {b2World} from "src/Box2D/Dynamics/b2World"
import {b2BodyDef}  from "src/Box2D/Dynamics/b2Body"
import {b2FixtureDef}  from "src/Box2D/Dynamics/b2Fixture"
import {b2PolygonShape}  from "src/Box2D/Collision/Shapes/b2PolygonShape"
import {b2CircleShape}  from "src/Box2D/Collision/Shapes/b2CircleShape"
import {b2BodyType} from "src/Box2D/Dynamics/b2Body"
import {b2RevoluteJointDef} from "src/Box2D/Dynamics/Joints/b2RevoluteJoint"
import {b2DistanceJointDef} from "src/Box2D/Dynamics/Joints/b2DistanceJoint"
import {b2ContactListener} from "src/Box2D/Dynamics/b2WorldCallbacks"

import {Txbox} from "src/gameObjects/txbox" 
import {Txlight} from "src/gameObjects/txlight"

export class Txpinball extends Entity {

	public id:string;
	public transform:Transform;
	public userID:string;
	public world;

	public ball_box2dbody;
	public ball_transform;

	public jointL;
	public jointR;

	public plunger;
	public plunger_top;
	public plunger_box;
	public plunger_on_pressed;

	public flipper_boxL;
	public flipper_boxR;

	public sticker = "";
	public stickerCountdown = 0;

	
	public sensors = {};


	constructor(
		id: string,
		userID:string,
		transform_args: TranformConstructorArgs
	) {

		super();
		engine.addEntity(this);

		this.id = id;
		this.userID = userID;
		this.transform = new Transform( transform_args );
		this.addComponent(  this.transform );
		
		let gravity   = new b2Vec2(0, -8.5);
        this.world     = new b2World( gravity );

        let boxwidth = 4;
        let boxheight = 6;
        let boxborder = 0.1;

       	//this.createStaticBox(  0.0,  0.0 , boxwidth , boxborder , this.world );
    	//this.createStaticBox( -boxwidth/2,  boxheight/2 , boxborder ,  boxheight, this.world );
		//this.createStaticBox(  boxwidth/2,  boxheight/2 , boxborder ,  boxheight, this.world );
    	//this.createStaticBox( -1.78 , 0.3  , 0.4, 0.4 , this.world );
		//this.createStaticBox(  1.34 , 0.3  , 0.4, 0.4 , this.world );
		//this.createStaticBox( -1.78 , 5.8  , 0.4, 0.4 , this.world );
		//this.createStaticBox(  1.78 , 5.8  , 0.4, 0.4 , this.world );
				    		

		let machine_entity = new Entity();
		machine_entity.setParent( this );
		
		let machine_shape = resources.models.machine ;
		machine_shape.withCollisions = false;
		let machine_transform = new Transform({
			position: new Vector3(   0, 3.00  ,  0),
			scale   : new Vector3(0.58, 0.58  ,0.5)
		});

		machine_entity.addComponent( machine_shape );
		machine_entity.addComponent( machine_transform );
		engine.addEntity( machine_entity );

		machine_transform.rotation.eulerAngles = new Vector3( 0, 180, 0);
		
		this.transform.rotation.eulerAngles = new Vector3( 45 , 0 , 0 );

		
	

		this.construct_box2d_shapes();
		this.place_box2d_sensors();

		this.ball_box2dbody = this.createDynamicCircle(  
    				1.66 ,  
    				1.23 ,  
    				0.08 , this.world, true );


		let ball_entity = new Entity();
		ball_entity.setParent( this );
		engine.addEntity( ball_entity );


		let ball_shape 		= new PlaneShape();
		ball_shape.withCollisions	 = false;
		ball_shape.uvs = [ 
			0,0,
			1,0,
			1,1,
			0,1,
			0,0,
			1,0,
			1,1,
			0,1
		];


		let ball_transform = new Transform( {
			position: new Vector3( 1.66,1.23, -0.05),
			scale   : new Vector3(0.20, 0.20,0.01)
		});
		let ball_material = new Material();
		ball_material.albedoTexture = resources.textures.pinball;
		ball_material.transparencyMode = 1;
		ball_material.roughness = 1;
		ball_material.specularIntensity = 0;
		ball_material.emissiveIntensity = 0.6;
		ball_material.emissiveColor = Color3.Green();

		
		ball_entity.addComponent( ball_shape );
		ball_entity.addComponent( ball_transform );
		ball_entity.addComponent( ball_material );
		ball_entity.addComponent( new Billboard() );



		this.ball_transform = ball_transform;

		this.plunger_box = new Txbox( this, 1.54, 0.9 , 0.25,0.25 );
    	

		
		this.flipper_boxL = new Txbox( this, -0.76, 0.85, 0.54, 0.07 );
		this.flipper_boxL.box_transform.position.y -= 0.07;
		this.flipper_boxL.transform.position.y += 0.07;
		
		this.flipper_boxL.transform.rotation.eulerAngles = new Vector3(0,0,-25);
		
		this.flipper_boxR = new Txbox( this, -0.06, 0.84, 0.54, 0.07 );
		this.flipper_boxR.box_transform.position.x -= 0.54;
		this.flipper_boxR.box_transform.position.y -= 0.07;
		this.flipper_boxR.transform.position.x += 0.54;
		this.flipper_boxR.transform.position.y += 0.07;
		this.flipper_boxR.transform.rotation.eulerAngles = new Vector3(0,0, 25);
			
		
		var _this = this;
		var contactListener = new b2ContactListener();

		contactListener.BeginContact = function (contact) {

			
		  
		}

		contactListener.EndContact = function (contact) {
		  	
			if ( contact.GetFixtureA().GetBody().GetUserData() != null ) {
				if ( contact.GetFixtureA().GetBody().GetUserData()  == "at_tbonus" || 
		  			 contact.GetFixtureA().GetBody().GetUserData()  == "at_cbonus" ||
		  			 contact.GetFixtureA().GetBody().GetUserData()  == "at_lock"  ) {

					if ( _this.stickerCountdown == 0 ) {
						
						let m_linearVelocity = _this.ball_box2dbody.GetLinearVelocity();
						let x_vel = m_linearVelocity.x;
						let y_vel = m_linearVelocity.y;
						let vel_sqr   = x_vel * x_vel + y_vel * y_vel;
						if ( vel_sqr < 10.0 ) {

							log("Masuk hole");
							// Masuk hole
							//_this.ball_box2dbody.SetType( b2BodyType.b2_staticBody );
							//_this.ball_box2dbody.SetAwake( true );
							var hole_id = contact.GetFixtureA().GetBody().GetUserData();
				  			_this.sticker = hole_id;
				  			_this.stickerCountdown = 50;
			  				
		  				} else {
		  					log("speed too fast ", vel_sqr ); 
		  				}
		  			}
					
				}
	  	
		  	}
		  	if ( contact.GetFixtureB().GetBody().GetUserData() != null ) {

		  	}
			
		}
		contactListener.PostSolve = function (contact, impulse) {

		}
		contactListener.PreSolve = function (contact, oldManifold) {

		}
		this.world.SetContactListener(contactListener);	


		let kkk = new Txlight( this , 0 , 4,  0.15 );

		

    }    















    //----
    public global_input_down(e) {


    	if ( e.buttonId == 0 ) {
    		
    		log("Plunger on press");
    		this.plunger_on_pressed = true;
    	
    	} else if ( e.buttonId == 1 ) {
			
			this.jointL.EnableMotor(true);

			//this.ball_box2dbody.SetType( b2BodyType.b2_staticBody );
			//this.ball_box2dbody.SetAwake( true );
					


				
    	} else if ( e.buttonId == 2 ) {

    		this.jointR.EnableMotor(true);
    	
    		//this.ball_box2dbody.SetType( b2BodyType.b2_dynamicBody );
			//this.ball_box2dbody.SetAwake( true );

    		
    	}
    }
    //----
    public global_input_up(e) {
    	if ( e.buttonId == 0 ) {
    		
    		log("Plunger on release");
    		this.plunger_on_pressed = false;

    	} else if ( e.buttonId == 1 ) {


    		this.jointL.EnableMotor(false);
    
    	} else if ( e.buttonId == 2 ) {
    		this.jointR.EnableMotor(false);
    	}	
    }


    step(dt:number) {
    	
    	this.world.Step( dt * 0.55  , 10, 10 );
    	
    	this.ball_transform.position.x = this.ball_box2dbody.GetPosition().x;
    	this.ball_transform.position.y = this.ball_box2dbody.GetPosition().y;
    	
    	if ( this.ball_box2dbody.GetPosition().y < -1 ) {
			this.ball_box2dbody.SetPosition( new b2Vec2( 1.66, 1.23 ) );
		}
			
		this.flipper_boxL.transform.rotation.eulerAngles = new Vector3(0,0, this.jointL.GetJointAngle() * 180.0 /Math.PI );
		this.flipper_boxR.transform.rotation.eulerAngles = new Vector3(0,0, this.jointR.GetJointAngle() * 180.0 /Math.PI );
		

		if ( this.plunger_on_pressed == true ) {
			if ( this.plunger.m_length > 0.2 ) {
				//log("cranking...", this.plunger.m_length - 0.02, this.plunger_top.GetPosition().y );
				this.plunger_top.SetAwake(true);
				this.plunger.SetLength( this.plunger.m_length - 0.02) ;
			}
		} else {
			this.plunger.m_length = 0.8 ;
		}

		this.plunger_box.transform.position.x = this.plunger_top.GetPosition().x ;
		this.plunger_box.transform.position.y = this.plunger_top.GetPosition().y ;

		if ( this.sticker != ""  ) {

			if ( this.stickerCountdown > 0 ) {
				
				this.stickerCountdown -= 1;
				this.ball_box2dbody.SetType( b2BodyType.b2_staticBody );
				this.ball_box2dbody.SetAwake( true );
				this.ball_box2dbody.SetPosition( this.sensors[ this.sticker ].GetPosition() );
				this.ball_transform.position.z = 0.02;

			
			} else {

				
				this.ball_box2dbody.SetType( b2BodyType.b2_dynamicBody );
				this.ball_box2dbody.SetAwake( true );
				this.ball_transform.position.z = -0.05;
				
				if ( this.sticker == "at_cbonus" ) { 
					log("BBB");
					this.ball_box2dbody.ApplyLinearImpulse( new b2Vec2( 0.225, -0.3) , this.ball_box2dbody.GetWorldCenter(), true )
				}
				if ( this.sticker == "at_tbonus" ) { 
					log("AAA");
					this.ball_box2dbody.ApplyLinearImpulse( new b2Vec2( -0.18, -0.3) , this.ball_box2dbody.GetWorldCenter() , true )
				}
				this.sticker = "";
				this.stickerCountdown = 50;
				
				
			}
		} else {
			if ( this.stickerCountdown > 0 ) {
				this.stickerCountdown -= 1;
			}
		}
		

    }


    //--------------------
    update( dt:number ) {
    	
    	this.step(dt);

    }


    

    //-------------
    public createDynamicBox( x, y , width , height , world  ) {
    	return this.createBox( x,y,width,height, world,  b2BodyType.b2_dynamicBody );
    }	
    //------------------
    public createStaticBox( x, y , width , height , world  ) {
    	return this.createBox( x,y,width,height, world,  b2BodyType.b2_staticBody );
    }
    //-------------------
    public createBox( x, y , width , height , world , body_type ) {
    	
    	let bodyDef   = new b2BodyDef();
        bodyDef.position.Set( x , y );
        bodyDef.type 	= body_type;
		
        let fixDef          = new b2FixtureDef();
        fixDef.density      = 1.0;
        fixDef.friction     = 0.00;
        fixDef.restitution  = 0.1;
        fixDef.shape        = new b2PolygonShape();
        fixDef.shape.SetAsBox( width/2 , height/2 );

        let b2body = world.CreateBody(bodyDef);
        b2body.CreateFixture(fixDef);

        return b2body;
    }

    //----------
    public createStaticShape( x, y , vertices, world ) {
    	return this.createShape( x, y, world,  b2BodyType.b2_staticBody, vertices );
    }

     //----------
    public createDynamicShape( x, y , vertices, world ) {
    	return this.createShape( x, y, world,  b2BodyType.b2_dynamicBody, vertices );
    }

     //------------
    public createShape( x, y, world, body_type , vertices  ) {

    	let bodyDef   = new b2BodyDef();
        bodyDef.position.Set( x , y );
        bodyDef.type 	= body_type;
		
        let fixDef          = new b2FixtureDef();
        fixDef.density      = 1.0;
        fixDef.friction     = 0.0;
        fixDef.restitution  = 0.1;
        fixDef.shape        = new b2PolygonShape();

        fixDef.shape.Set( vertices , vertices.length );

        let b2body = world.CreateBody(bodyDef);
        b2body.CreateFixture(fixDef);
        return b2body;
    }


     //-------------
    public createDynamicCircle( x, y , radius , world , ccd  ) {
    	return this.createCircle( x,y, radius , world,  b2BodyType.b2_dynamicBody , ccd );
    }		
	
	 //-------------
    public createStaticCircle( x, y , radius , world  ) {
    	return this.createCircle( x,y, radius , world,  b2BodyType.b2_staticBody , false );
    }		
	

	//--------
    public createStaticSensor( x,y, vertices , world , sensorid ) {

    	let bodyDef   = new b2BodyDef();
        bodyDef.position.Set( x , y );
        bodyDef.type 	= b2BodyType.b2_staticBody;
        bodyDef.userData = sensorid;
     	
        let fixDef          = new b2FixtureDef();
        fixDef.density      = 1.0;
        fixDef.friction     = 0.1;
        fixDef.restitution  = 0.1;
        fixDef.shape        = new b2PolygonShape();
        fixDef.isSensor 	= true;
       	
        fixDef.shape.Set( vertices , vertices.length );

        let b2body = world.CreateBody(bodyDef);
        b2body.CreateFixture(fixDef);

        return b2body;
    }

    //----------------
    public createCircle( x,y, radius , world, body_type , ccd ) {

    	// Box2D
    	let bodyDef   = new b2BodyDef();
        bodyDef.position.Set( x , y );
        bodyDef.type 	= body_type;
        bodyDef.bullet  = ccd;
		
        let fixDef          = new b2FixtureDef();
        fixDef.density      = 1.0;
        fixDef.friction     = 0.2;
        fixDef.restitution  = 0.3;
        fixDef.shape        = new b2CircleShape(radius);
        
        let b2body = world.CreateBody(bodyDef);
        b2body.CreateFixture(fixDef);

        return b2body;

    }
	



	//------------
	public createRevoluteJoint( bodyA, bodyB, anchorA, anchorB  , world , motorspeed ) {

		var joint_def = new b2RevoluteJointDef();
		joint_def.bodyA = bodyA;
		joint_def.bodyB = bodyB;
		joint_def.localAnchorA.Set( anchorA.x , anchorA.y );
		joint_def.localAnchorB.Set( anchorB.x , anchorB.y ) ;

		joint_def.lowerAngle =  -25 * Math.PI / 180.0;
		joint_def.upperAngle =   25 * Math.PI / 180.0 ;
		joint_def.enableLimit = true;
		joint_def.maxMotorTorque = 1000.0;
		joint_def.motorSpeed =  motorspeed ;
		joint_def.enableMotor = false;

		return world.CreateJoint(joint_def);

	}

	//----------
	public createDistanceJoint( bodyA , bodyB , anchorA , anchorB, world ) {

		var joint_def = new b2DistanceJointDef();
		joint_def.bodyA = bodyA;
		joint_def.bodyB = bodyB;
		joint_def.localAnchorA.Set( anchorA.x , anchorA.y );
		joint_def.localAnchorB.Set( anchorB.x , anchorB.y ) ;
		joint_def.length = 0.8;
		joint_def.frequencyHz = 10;
		joint_def.dampingRatio = 0.1;
		return world.CreateJoint(joint_def);
		

	}







	//===========
	public place_box2d_sensors( ) {

		let vertices = [];
		let xoffset = 0;
    	let yoffset = 0;

		vertices.length = 0 ;
		vertices.push(  new b2Vec2(   0.0,  0.0   ) );   
		vertices.push(  new b2Vec2(   0.033859000000000083,  0.017878999999999756   ) );   
		vertices.push(  new b2Vec2(   -0.02398699999999998,  0.15060200000000012   ) );   
		vertices.push(  new b2Vec2(   -0.06100099999999986,  0.1358769999999998   ) );   
		this.createStaticSensor( -1.012275 + xoffset , 5.243767 + yoffset , vertices , this.world , "eb_extraball_0" );



		vertices.length = 0 ;
		vertices.push(  new b2Vec2(   0.0,  0.0   ) );   
		vertices.push(  new b2Vec2(   0.030329999999999968,  0.015842999999999385   ) );   
		vertices.push(  new b2Vec2(   -0.03105900000000006,  0.14908699999999975   ) );   
		vertices.push(  new b2Vec2(   -0.06503700000000001,  0.13384099999999943   ) );   
		this.createStaticSensor( -0.940928 + xoffset , 5.089094 + yoffset , vertices , this.world , "eb_extraball_1" );



		vertices.length = 0 ;
		vertices.push(  new b2Vec2(   0.0,  0.0   ) );   
		vertices.push(  new b2Vec2(   0.030329999999999968,  0.015843000000000274   ) );   
		vertices.push(  new b2Vec2(   -0.03105900000000006,  0.14908699999999975   ) );   
		vertices.push(  new b2Vec2(   -0.06503700000000001,  0.13384100000000032   ) );   
		this.createStaticSensor( -0.870049 + xoffset , 4.932797 + yoffset , vertices , this.world , "eb_extraball_2" );



		vertices.length = 0 ;
		vertices.push(  new b2Vec2(   0.0,  0.0   ) );   
		vertices.push(  new b2Vec2(   0.038224000000000036,  0.0022380000000001843   ) );   
		vertices.push(  new b2Vec2(   0.04059199999999996,  0.14699799999999996   ) );   
		vertices.push(  new b2Vec2(   0.0008040000000000269,  0.14893999999999963   ) );   
		this.createStaticSensor( -0.812983 + xoffset , 4.569789 + yoffset , vertices , this.world , "eb_lock_0" );



		vertices.length = 0 ;
		vertices.push(  new b2Vec2(   0.0,  0.0   ) );   
		vertices.push(  new b2Vec2(   0.034169000000000005,  0.001848000000000738   ) );   
		vertices.push(  new b2Vec2(   0.033528,  0.14855200000000046   ) );   
		vertices.push(  new b2Vec2(   -0.0037129999999999663,  0.14876000000000023   ) );   
		this.createStaticSensor( -0.812161 + xoffset , 4.399455 + yoffset , vertices , this.world , "eb_lock_1" );



		vertices.length = 0 ;
		vertices.push(  new b2Vec2(   0.0,  0.0   ) );   
		vertices.push(  new b2Vec2(   0.034167999999999976,  0.0018479999999998498   ) );   
		vertices.push(  new b2Vec2(   0.033526999999999973,  0.14855199999999957   ) );   
		vertices.push(  new b2Vec2(   -0.003713999999999995,  0.14876000000000023   ) );   
		this.createStaticSensor( -0.812438 + xoffset , 4.227838 + yoffset , vertices , this.world , "eb_lock_2" );



		vertices.length = 0 ;
		vertices.push(  new b2Vec2(   0.0,  0.0   ) );   
		vertices.push(  new b2Vec2(   0.016190000000000038,  -0.03469899999999981   ) );   
		vertices.push(  new b2Vec2(   0.15160099999999999,  0.016538000000000164   ) );   
		vertices.push(  new b2Vec2(   0.1387170000000001,  0.054232999999999976   ) );   
		this.createStaticSensor( -0.941671 + xoffset , 3.535684 + yoffset , vertices , this.world , "eb_tbonus_2" );



		vertices.length = 0 ;
		vertices.push(  new b2Vec2(   0.0,  0.0   ) );   
		vertices.push(  new b2Vec2(   0.014330000000000176,  -0.03107300000000013   ) );   
		vertices.push(  new b2Vec2(   0.15043600000000001,  0.023676999999999726   ) );   
		vertices.push(  new b2Vec2(   0.1368830000000001,  0.05836499999999978   ) );   
		this.createStaticSensor( -1.099671 + xoffset , 3.472042 + yoffset , vertices , this.world , "eb_tbonus_1" );



		vertices.length = 0 ;
		vertices.push(  new b2Vec2(   0.0,  0.0   ) );   
		vertices.push(  new b2Vec2(   0.014330999999999872,  -0.031073999999999824   ) );   
		vertices.push(  new b2Vec2(   0.15043699999999993,  0.02367700000000017   ) );   
		vertices.push(  new b2Vec2(   0.13688299999999987,  0.05836500000000022   ) );   
		this.createStaticSensor( -1.25927 + xoffset , 3.408949 + yoffset , vertices , this.world , "eb_tbonus_0" );



		vertices.length = 0 ;
		vertices.push(  new b2Vec2(   0.0,  0.0   ) );   
		vertices.push(  new b2Vec2(   0.03819299999999992,  0.0027089999999998504   ) );   
		vertices.push(  new b2Vec2(   0.038775000000000004,  0.14748800000000006   ) );   
		vertices.push(  new b2Vec2(   -0.0010339999999999794,  0.14893899999999993   ) );   
		this.createStaticSensor( 1.344071 + xoffset , 3.550911 + yoffset , vertices , this.world , "eb_cbonus_0" );



		vertices.length = 0 ;
		vertices.push(  new b2Vec2(   0.0,  0.0   ) );   
		vertices.push(  new b2Vec2(   0.034143000000000034,  0.0022690000000000765   ) );   
		vertices.push(  new b2Vec2(   0.03169200000000005,  0.14895400000000025   ) );   
		vertices.push(  new b2Vec2(   -0.005549000000000026,  0.1487040000000004   ) );   
		this.createStaticSensor( 1.346994 + xoffset , 3.3806 + yoffset , vertices , this.world , "eb_cbonus_1" );



		vertices.length = 0 ;
		vertices.push(  new b2Vec2(   0.0,  0.0   ) );   
		vertices.push(  new b2Vec2(   0.034143000000000034,  0.0022690000000000765   ) );   
		vertices.push(  new b2Vec2(   0.03169299999999997,  0.1489539999999998   ) );   
		vertices.push(  new b2Vec2(   -0.005547999999999886,  0.1487029999999998   ) );   
		this.createStaticSensor( 1.348833 + xoffset , 3.208993 + yoffset , vertices , this.world , "eb_cbonus_2" );



		vertices.length = 0 ;
		vertices.push(  new b2Vec2(   0.0,  0.0   ) );   
		vertices.push(  new b2Vec2(   0.03414299999999981,  0.0022690000000000765   ) );   
		vertices.push(  new b2Vec2(   0.03169199999999983,  0.1489539999999998   ) );   
		vertices.push(  new b2Vec2(   -0.005548000000000108,  0.1487029999999998   ) );   
		this.createStaticSensor( 1.352602 + xoffset , 3.028102 + yoffset , vertices , this.world , "eb_cbonus_3" );



		vertices.length = 0 ;
		vertices.push(  new b2Vec2(   0.0,  0.0   ) );   
		vertices.push(  new b2Vec2(   0.147454,  -0.0008439999999998449   ) );   
		vertices.push(  new b2Vec2(   0.14661,  0.13748499999999986   ) );   
		vertices.push(  new b2Vec2(   0.0005939999999999973,  0.13790600000000008   ) );   
		this.createStaticSensor( 0.065417 + xoffset , 5.204669 + yoffset , vertices , this.world , "eb_doublescore_0" );



		vertices.length = 0 ;
		vertices.push(  new b2Vec2(   0.0,  0.0   ) );   
		vertices.push(  new b2Vec2(   0.14745399999999997,  -0.0008439999999998449   ) );   
		vertices.push(  new b2Vec2(   0.146609,  0.137486   ) );   
		vertices.push(  new b2Vec2(   0.0005939999999999834,  0.13790700000000022   ) );   
		this.createStaticSensor( 0.405636 + xoffset , 5.106516 + yoffset , vertices , this.world , "eb_doublescore_1" );



		vertices.length = 0 ;
		vertices.push(  new b2Vec2(   0.0,  0.0   ) );   
		vertices.push(  new b2Vec2(   0.14745300000000006,  -0.0008439999999998449   ) );   
		vertices.push(  new b2Vec2(   0.146609,  0.13748499999999986   ) );   
		vertices.push(  new b2Vec2(   0.0005939999999999834,  0.13790700000000022   ) );   
		this.createStaticSensor( 0.739312 + xoffset , 5.025836 + yoffset , vertices , this.world , "eb_doublescore_2" );



		vertices.length = 0 ;
		vertices.push(  new b2Vec2(   0.0,  0.0   ) );   
		vertices.push(  new b2Vec2(   0.179203,  -0.0010260000000004155   ) );   
		vertices.push(  new b2Vec2(   0.1781769999999998,  0.16708899999999982   ) );   
		vertices.push(  new b2Vec2(   0.0007219999999998894,  0.1676000000000002   ) );   
		this.createStaticSensor( 1.202476 + xoffset , 4.74012 + yoffset , vertices , this.world , "at_extraball" );



		vertices.length = 0 ;
		vertices.push(  new b2Vec2(   0.0,  0.0   ) );   
		vertices.push(  new b2Vec2(   0.17920200000000008,  -0.0010259999999999714   ) );   
		vertices.push(  new b2Vec2(   0.1781760000000001,  0.16708900000000027   ) );   
		vertices.push(  new b2Vec2(   0.0007209999999999717,  0.16759999999999975   ) );   
		this.createStaticSensor( -1.212426 + xoffset , 3.844707 + yoffset , vertices , this.world , "at_jackpot" );



		vertices.length = 0 ;
		vertices.push(  new b2Vec2(   0.0,  0.0   ) );   
		vertices.push(  new b2Vec2(   0.179203,  -0.0010260000000004155   ) );   
		vertices.push(  new b2Vec2(   0.17817700000000003,  0.16708799999999968   ) );   
		vertices.push(  new b2Vec2(   0.0007220000000001114,  0.16759900000000005   ) );   
		this.createStaticSensor( -1.751333 + xoffset , 5.043114 + yoffset , vertices , this.world , "at_lanebonus" );






		vertices.length = 0 ;
		vertices.push(  new b2Vec2(   0.0,  0.0   ) );   
		vertices.push(  new b2Vec2(   0.02,  0.0   ) );   
		vertices.push(  new b2Vec2(   0.02,  0.02   ) );   
		vertices.push(  new b2Vec2(   0.0,  0.02   ) );   
		this.sensors["at_cbonus"] = this.createStaticSensor( -1.725518 + xoffset , 3.069196 + yoffset , vertices , this.world , "at_cbonus" );



		vertices.length = 0 ;
		vertices.push(  new b2Vec2(   0.0,  0.0   ) );   
		vertices.push(  new b2Vec2(   0.02,  0.0   ) );   
		vertices.push(  new b2Vec2(   0.02,  0.02   ) );   
		vertices.push(  new b2Vec2(   0.0,  0.02   ) );   
		this.sensors["at_tbonus"]  = this.createStaticSensor( 1.333441 + xoffset , 4 + yoffset , vertices , this.world , "at_tbonus" );


		vertices.length = 0 ;
		vertices.push(  new b2Vec2(   0.0,  0.0   ) );   
		vertices.push(  new b2Vec2(   0.02,  0.0   ) );   
		vertices.push(  new b2Vec2(   0.02,  0.02   ) );   
		vertices.push(  new b2Vec2(   0.0,  0.02   ) );   
		this.sensors["at_lock"]   = this.createStaticSensor( -0.586463 + xoffset , 5.61839 + yoffset , vertices , this.world , "at_lock" );
		


		vertices.length = 0 ;
		vertices.push(  new b2Vec2(   0.0,  0.0   ) );   
		vertices.push(  new b2Vec2(   0.179203,  -0.0010259999999999714   ) );   
		vertices.push(  new b2Vec2(   0.17817700000000003,  0.1670879999999999   ) );   
		vertices.push(  new b2Vec2(   0.0007219999999998894,  0.16759899999999983   ) );   
		this.createStaticSensor( -1.481895 + xoffset , 1.891281 + yoffset , vertices , this.world , "eb_leftdrain" );



		vertices.length = 0 ;
		vertices.push(  new b2Vec2(   0.0,  0.0   ) );   
		vertices.push(  new b2Vec2(   0.179203,  -0.0010259999999999714   ) );   
		vertices.push(  new b2Vec2(   0.17817700000000003,  0.1670879999999999   ) );   
		vertices.push(  new b2Vec2(   0.0007220000000001114,  0.16759999999999997   ) );   
		this.createStaticSensor( -1.802224 + xoffset , 1.702852 + yoffset , vertices , this.world , "db_leftdrain" );



		vertices.length = 0 ;
		vertices.push(  new b2Vec2(   0.0,  0.0   ) );   
		vertices.push(  new b2Vec2(   0.179203,  -0.0010259999999999714   ) );   
		vertices.push(  new b2Vec2(   0.1781760000000001,  0.1670879999999999   ) );   
		vertices.push(  new b2Vec2(   0.0007209999999999717,  0.16759999999999997   ) );   
		this.createStaticSensor( 0.943862 + xoffset , 1.907561 + yoffset , vertices , this.world , "eb_rightdrain" );



		vertices.length = 0 ;
		vertices.push(  new b2Vec2(   0.0,  0.0   ) );   
		vertices.push(  new b2Vec2(   0.179203,  -0.0010259999999999714   ) );   
		vertices.push(  new b2Vec2(   0.17817700000000003,  0.16708900000000004   ) );   
		vertices.push(  new b2Vec2(   0.0007209999999999717,  0.16759999999999997   ) );   
		this.createStaticSensor( 1.26404 + xoffset , 1.728478 + yoffset , vertices , this.world , "db_rightdrain" );



	}






    //------
    public construct_box2d_shapes( ) {

    	let xoffset = 0;
    	let yoffset = 0;

		let vertices = [];

		// The bottomleft trapezium
        vertices.push(  new b2Vec2(    0,  0) );
        vertices.push(  new b2Vec2( 1.32,  0) );
        vertices.push(  new b2Vec2( 1.32,  0.24) );
        vertices.push(  new b2Vec2(  0.2,  0.9) );
        vertices.push(  new b2Vec2(    0,  0.9) );

		this.createStaticShape( -1.98 + xoffset , 0.1 + yoffset , vertices, this.world  );	


		// The bottomright trapezium
		vertices.length = 0;
		vertices.push(  new b2Vec2(    0,  0) );
        vertices.push(  new b2Vec2( 1.28,  0) );
        vertices.push(  new b2Vec2( 1.28,  1) );
		vertices.push(  new b2Vec2(    0,  0.2) );

		this.createStaticShape(  0.28 + xoffset , 0.1 + yoffset , vertices, this.world  );	
		

		// Bumper Left
		vertices.length = 0;
		vertices.push(  new b2Vec2(    0,  0) );
        vertices.push(  new b2Vec2(  0.38, -0.22) );
        vertices.push(  new b2Vec2(  0.42, 0.02) );
        vertices.push(  new b2Vec2(  0.16,  0.65) );
        vertices.push(  new b2Vec2(    0,  0.7) );


		this.createStaticShape(  -1.28 + xoffset , 1.55 + yoffset , vertices, this.world  );	
		

		// Bumper Right
		vertices.length = 0;
		vertices.push(  new b2Vec2(    0,  0) );
        vertices.push(  new b2Vec2(  0.42, 0.22) );
        vertices.push(  new b2Vec2(  0.42, 0.92) );
        vertices.push(  new b2Vec2(  0.28, 0.82) );
        vertices.push(  new b2Vec2(    0,  0.22) );


		this.createStaticShape(  0.5 + xoffset , 1.35 + yoffset , vertices, this.world  );	
		




		vertices.length = 0;
		vertices.push(  new b2Vec2(    0,  0) );
        vertices.push(  new b2Vec2(  0.16, -0.26) );
        vertices.push(  new b2Vec2(  0.78, -0.04) );
        vertices.push(  new b2Vec2(  0.79, 0.58  ) );
        vertices.push(  new b2Vec2(  0.5,  1.24) );
        vertices.push(  new b2Vec2(  0.42,  1.28) );
        vertices.push(  new b2Vec2(  0.24,  1.16) );

        vertices.push(  new b2Vec2(  0.00,  0.66) );


		this.createStaticShape(  -1.62 + xoffset , 4.2 + yoffset , vertices, this.world  );	



		vertices.length = 0;
		vertices.push(  new b2Vec2(    0,  0) );
        vertices.push(  new b2Vec2(  0.12, -0.22) );
        vertices.push(  new b2Vec2(  0.68,  0 ) );
        vertices.push(  new b2Vec2(  0.66, 0.30) );


		this.createStaticShape(  -1.45 + xoffset ,  3.65 + yoffset , vertices, this.world  );	



		vertices.length = 0;
		vertices.push(  new b2Vec2(    0,  0) );
        vertices.push(  new b2Vec2(    0, -0.48) );
        vertices.push(  new b2Vec2(   0.1, -0.48 ) );
        vertices.push(  new b2Vec2(   0.1, 0) );
		vertices.push(  new b2Vec2(   0.05, 0.03) );


        // The four sticks

		this.createStaticShape(  -0.08 + xoffset ,  5.45 + yoffset , vertices, this.world  );	
		this.createStaticShape(  0.26 + xoffset ,  5.35 + yoffset , vertices, this.world  );	
		this.createStaticShape(  0.58 + xoffset ,  5.29 + yoffset , vertices, this.world  );	
		this.createStaticShape(  0.92 + xoffset ,  5.19 + yoffset , vertices, this.world  );	


        vertices.length = 0;
		vertices.push(  new b2Vec2(    0,  0) );
        vertices.push(  new b2Vec2(    0, -1) );
        vertices.push(  new b2Vec2(   0.1, -1 ) );
        vertices.push(  new b2Vec2(   0.1, -0.02) );


        this.createStaticShape(  -1.6 + xoffset ,  2.26 + yoffset , vertices, this.world  );	



        vertices.length = 0;
		vertices.push(  new b2Vec2(    0,  0) );
        vertices.push(  new b2Vec2(    0, -1) );
        vertices.push(  new b2Vec2(   0.1, -1 ) );
        vertices.push(  new b2Vec2(   0.1, 0.02) );


        this.createStaticShape(  1.14 + xoffset ,  2.24 + yoffset , vertices, this.world  );	
	


      
		


        // super long at right
        vertices.length = 0;
		vertices.push(  new b2Vec2(    0,  0) );
        vertices.push(  new b2Vec2(   0.2,  0) );
        vertices.push(  new b2Vec2(   0.2,  5.22 ) );
        vertices.push(  new b2Vec2(   0,    5.22) );


        this.createStaticShape(  1.8 + xoffset ,  0.08 + yoffset , vertices, this.world  );	
	



		// Top right corner trapezium
        vertices.length = 0;
		vertices.push(  new b2Vec2(    0,  0   ) );
        vertices.push(  new b2Vec2(   0.2,  0   ) );
        vertices.push(  new b2Vec2(   0.2,  0.7   ) );
        vertices.push(  new b2Vec2(   0.1,    0.7   ) );
        vertices.push(  new b2Vec2(  -0.26,   0.28   ) );
		

        this.createStaticShape(  1.80 + xoffset ,  5.3 + yoffset , vertices, this.world  );	
		



        // top piece
		vertices.length = 0;
		vertices.push(  new b2Vec2(    0,  0   ) );
        vertices.push(  new b2Vec2(   2.04,  0   ) );
        vertices.push(  new b2Vec2(   2.04,   0.2   ) );
        vertices.push(  new b2Vec2(   0 ,  0.2   ) );
        	
        this.createStaticShape( -1.1 + xoffset ,  5.82 + yoffset , vertices, this.world  );	
		

		vertices.length = 0;
		vertices.push(  new b2Vec2(    0,  0   ) );
		vertices.push(  new b2Vec2(  0.5,  0.04   ) );
		
        vertices.push(  new b2Vec2(  0.9,  0.2   ) );
        vertices.push(  new b2Vec2(  0.9,   0.4   ) );
        vertices.push(  new b2Vec2(   0 ,  0.4   ) );
        	
        this.createStaticShape( -2 + xoffset ,  5.6 + yoffset , vertices, this.world  );	
		


        vertices.length = 0;
		vertices.push(  new b2Vec2(    0,  0   ) );
		vertices.push(  new b2Vec2(  0.14,  0   ) );
        vertices.push(  new b2Vec2(  0.46,   0.52   ) );
        vertices.push(  new b2Vec2(   0 ,  0.52   ) );
        	
        this.createStaticShape( -2 + xoffset ,  5.1 + yoffset , vertices, this.world  );	
		


        vertices.length = 0;
		vertices.push(  new b2Vec2(    0,  0   ) );
		vertices.push(  new b2Vec2(  0.08,  0   ) );
        vertices.push(  new b2Vec2(  0.16,   0.69   ) );
        vertices.push(  new b2Vec2(   0 ,  0.69   ) );
        	
        this.createStaticShape( -2 + xoffset ,  4.42 + yoffset , vertices, this.world  );	
		

        vertices.length = 0;
		vertices.push(  new b2Vec2(    0,  0   ) );
		vertices.push(  new b2Vec2(  0.12,  0   ) );
        vertices.push(  new b2Vec2(  0.08,   0.64   ) );
        vertices.push(  new b2Vec2(   0 ,  0.64   ) );
        	
        this.createStaticShape( -2 + xoffset ,  3.78 + yoffset , vertices, this.world  );	
		



        // trapezium on left
        vertices.length = 0;
		vertices.push(  new b2Vec2(    0,  0   ) );
		vertices.push(  new b2Vec2(  0.4,  0   ) );
        vertices.push(  new b2Vec2(  0.12 , 0.5   ) );
        vertices.push(  new b2Vec2(   0 ,  0.5  ) );
        	
        this.createStaticShape( -2 + xoffset ,  3.28 + yoffset , vertices, this.world  );	
		

        // trapezium on left
        vertices.length = 0;
		vertices.push(  new b2Vec2(    0,  0   ) );
		vertices.push(  new b2Vec2(  0.2,  0.3   ) );
        vertices.push(  new b2Vec2(  0.12 , 0.5   ) );
        vertices.push(  new b2Vec2(  -0.04 ,  0.6  ) );
        	
        this.createStaticShape( -1.84 + xoffset ,  2.38 + yoffset , vertices, this.world  );	
		



		 // trapezium on inner right
        vertices.length = 0;
		vertices.push(  new b2Vec2(    0,  0   ) );
		vertices.push(  new b2Vec2(  0.18,  -0.2   ) );
        vertices.push(  new b2Vec2(  0.18 , 0.34   ) );
        vertices.push(  new b2Vec2(   0 ,  0.1  ) );
        	
        this.createStaticShape( 1.24 + xoffset ,  2.70 + yoffset , vertices, this.world  );	
		

		 // trapezium on inner right
        vertices.length = 0;
		vertices.push(  new b2Vec2(    0,  0   ) );
		vertices.push(  new b2Vec2(  0.18,  -0.2   ) );
        vertices.push(  new b2Vec2(  0.18 , 0.34   ) );
        vertices.push(  new b2Vec2(   0 ,  0.1  ) );
        	
        this.createStaticShape( 1.32 + xoffset ,  4.24 + yoffset , vertices, this.world  );	
		



        // long one on the left
        vertices.length = 0;
		vertices.push(  new b2Vec2(    0,  0   ) );
		vertices.push(  new b2Vec2(  0.2,  0   ) );
        vertices.push(  new b2Vec2(  0.10, 2.78   ) );
        vertices.push(  new b2Vec2(   0 , 2.78  ) );
        	
        this.createStaticShape( -2 + xoffset ,  1.0 + yoffset , vertices, this.world  );	
		

        // inner Right long vertcal
        vertices.length = 0;
		vertices.push(  new b2Vec2(    0,  0   ) );
		vertices.push(  new b2Vec2(  0.12,  0.08   ) );
        vertices.push(  new b2Vec2(  0.12, 4.0   ) );
        vertices.push(  new b2Vec2(   0 , 4.0  ) );
        	
        this.createStaticShape( 1.44 + xoffset ,  1.0 + yoffset , vertices, this.world  );	
		

        
        // Three circles in center
        this.createStaticCircle( 0.04 + xoffset,  4.2  + yoffset , 0.18 , this.world );
		this.createStaticCircle( -0.36 + xoffset,  4.74  + yoffset , 0.18 , this.world );
		this.createStaticCircle( 0.71 + xoffset,  4.06  + yoffset , 0.18 , this.world );




		// The curving one on inner top right
		
        vertices.length = 0;
		vertices.push(  new b2Vec2(    0,  0   ) );
		vertices.push(  new b2Vec2(  0.12,  0   ) );
		vertices.push(  new b2Vec2(  0.06, 0.2   ) );
		vertices.push(  new b2Vec2( -0.04, 0.34   ) );

        vertices.push(  new b2Vec2(  -0.16, 0.4   ) );
        vertices.push(  new b2Vec2(  -0.26 , 0.4  ) );
        	
        this.createStaticShape( 1.42 + xoffset ,  5 + yoffset , vertices, this.world  );	
		

        // Oneway hinge parent
		vertices.length = 0;
		vertices.push(  new b2Vec2(    0,  0   ) );
        vertices.push(  new b2Vec2(   0.58,  -0.24   ) );
        vertices.push(  new b2Vec2(   0.94,   0.2   ) );
        vertices.push(  new b2Vec2(   0 ,  0.2   ) );
        var oneway_hinge_parent = this.createStaticShape(  0.96 + xoffset ,  5.82 + yoffset , vertices, this.world  );	
		



		// The oneway hinge
		vertices.length = 0;
		vertices.push(  new b2Vec2(    0,   0   ) );
        vertices.push(  new b2Vec2(   0.02,   0   ) );
        vertices.push(  new b2Vec2(   0.04, 0.4    ) );
        vertices.push(  new b2Vec2(    0.02,   0.4   ) );
        var oneway_hinge = this.createDynamicShape(  1.12 + xoffset ,  5.34 + yoffset , vertices, this.world  );	
		
		
		
        var jointOneWay = this.createRevoluteJoint( oneway_hinge_parent , oneway_hinge , 
										 new b2Vec2(  0.20, -0.10  )  , 
										new b2Vec2(  0.02,  0.32  )  , 
										this.world , 20 )	;


		jointOneWay.m_enableLimit = false;
		jointOneWay.m_lowerAngle  = 0 * Math.PI / 180.0;
		jointOneWay.m_upperAngle  = 25 * Math.PI/ 180.0;
		


		//Flipper left 
		// flipper left parent
		vertices.length = 0;
		vertices.push(  new b2Vec2(    0,  0) );
        vertices.push(  new b2Vec2(   0.7, -0.5) );
        vertices.push(  new b2Vec2(   0.8, -0.32 ) );
        vertices.push(  new b2Vec2(   0.1, 0.1) );
        var flipperLParent = this.createStaticShape(  -1.6 + xoffset ,  1.28 + yoffset , vertices, this.world  );	
		

        // Flipper  left child
		vertices.length = 0;
		vertices.push(  new b2Vec2(       0,      0   ) );
		vertices.push(  new b2Vec2(    0.54,      0   ) );
        vertices.push(  new b2Vec2(    0.54,   0.04   ) );
        vertices.push(  new b2Vec2(       0 ,  0.10  ) );
		var flipperLeft = this.createDynamicShape( -0.76 + xoffset ,  0.85 + yoffset , vertices, this.world  );	

		// Joint Left				
		var jointL = this.createRevoluteJoint( flipperLParent , flipperLeft , 
										new b2Vec2( 0.8 , -0.32), 
										new b2Vec2(   0  , 0.10)  , this.world , 20 )	;







		// Flipper Right
		// flipper right parent
		vertices.length = 0;
		vertices.push(  new b2Vec2(    0,  0) );
        vertices.push(  new b2Vec2(   0.10, -0.14) );
        vertices.push(  new b2Vec2(   0.74, 0.28 ) );
        vertices.push(  new b2Vec2(   0.68, 0.42) );

        var flipperRParent = this.createStaticShape(  0.48 + xoffset ,  0.98 + yoffset , vertices, this.world  );	
	


		// flipper right child
		vertices.length = 0;
		vertices.push(  new b2Vec2(   0,         0   ) );
		vertices.push(  new b2Vec2(   0.54,   0.04   ) );
        vertices.push(  new b2Vec2(   0.54,   0.16   ) );
        vertices.push(  new b2Vec2(   0 ,     0.04  ) );
		var flipperRight = this.createDynamicShape( -0.06 + xoffset ,  0.84 + yoffset , vertices, this.world  );	

		// Joint right
		var jointR = this.createRevoluteJoint( flipperRParent , flipperRight , 
										new b2Vec2( 0.00 ,  0), 
										new b2Vec2( 0.54  , 0.16)  , this.world , -20 )	;


		//console.log( joint_def );
		this.jointL = jointL;
		this.jointR = jointR;




		
		vertices.length = 0;
		vertices.push(  new b2Vec2(   0,         0   ) );
		vertices.push(  new b2Vec2(   0.23,       0   ) );
        vertices.push(  new b2Vec2(   0.23,     0.24   ) );
        vertices.push(  new b2Vec2(   0 ,      0.24  ) );
		var plunger_p2 = this.createDynamicShape( 1.54 + xoffset ,  0.9 + yoffset , vertices, this.world  );	


		vertices.length = 0;
		vertices.push(  new b2Vec2(   0,         0   ) );
		vertices.push(  new b2Vec2(   0.25,       0   ) );
        vertices.push(  new b2Vec2(   0.25,     0.25   ) );
        vertices.push(  new b2Vec2(   0 ,      0.25  ) );
		var plunger_p1 = this.createStaticShape( 1.54 + xoffset ,  0.1 + yoffset , vertices, this.world  );	


		this.plunger = this.createDistanceJoint( plunger_p1 , plunger_p2 , 
					new b2Vec2(0.125,0.125), new b2Vec2(0.125,0.125), this.world );

		this.plunger_top = plunger_p2;


    }

}