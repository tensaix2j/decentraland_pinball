


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
import {Txball} from "src/gameObjects/txball"
import {Txsound} from "src/gameObjects/txsound"
import {Txtext} from "src/gameObjects/txtext"
import {Utils} from "src/utils"


export class Txpinball extends Entity {

	public id:string;
	public transform:Transform;
	public userID:string;
	public world;

	public jointL;
	public jointR;

	public plunger;
	public plunger_top;
	public plunger_box;
	public plunger_on_pressed;

	public flipper_boxL;
	public flipper_boxR;


	public sensors = {};
	public lights  = {};
	public boardstates = {};

	// 1.66 , 1.23 is normal starting 


	public ball_start_x = [  1.66, 1.66 ];
	public ball_start_y = [  1.23, 1.23 ];
	public balls 		= [];

	public callback_queue = [];

	public sndFlipper;
	public sndLaunch;
	public sndBell;
	public sndBump;
	public sndPop;
	public sndClick;
	public sndHole;
	public sndDie;
	public sndPasslane;
	public sndTada;
	public sndJackpot;
	public sndSad;
	public sndGameover;
	public sndBgmusic;
	public sndDramatic;
	public sndCompletion;

	public stayatholeinterval = 50;

	public txtBall;
	public txtScore;
	public txtStatus;
	public txtReset;





	public eb_tog_has_categories 		= ["tbonus" , "extraball"  , "lock" , "cbonus" , "doublescore"  ];
	public eb_tog_has_ebcount    		= [        3,    		3  ,      3 ,       4   ,           3 ] ;
	public eb_completion_prefix 		= [ "has"   , "hastrig"    , "has"  ,   "has"   ,      "has"       ];
	public eb_completion_upgrade 		= ["magic"  , ""           , "drain"     , "cbonus"  ,  ""      ];
	public eb_completion_upgrademax 	= [      4  ,            0 ,       0,        4  ,           0 ];
	public eb_completion_upgrade2 		= ["jackpot", 			"", 	  "", 		 "", 			""];

	public score_for_lanemul 			= [10000, 20000, 30000, 40000, 50000, 100000, 200000, 1000000 ];
	public eb_categories_name 			= [ "Right Hole" , "Extraball" , "Lock", "Left Hole" , "Double Score"  ];


	public apiurl 			= "https://keyvalue.immanuel.co/api/KeyVal";
	public api_tokenkey 	= "2c0kbdqk";
	public api_getaction 	= "GetValue";
	public api_putaction 	= "UpdateValue";
	public api_kvsep 		= "/";
	



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
		this.place_lights()

			



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

		let ball_material = new Material();
		ball_material.albedoTexture = resources.textures.pinball;
		ball_material.transparencyMode = 1;
		ball_material.roughness = 1;
		ball_material.specularIntensity = 0;
		ball_material.emissiveIntensity = 0.6;
		ball_material.emissiveColor = Color3.Green();

		let i;
		for ( i = 0 ; i < this.ball_start_x.length ; i++ ) {
			let ball = new Txball( this, 
									this.ball_start_x[i],
									this.ball_start_y[i],
									ball_shape,
									ball_material,
									0.20,
									this.world,
									i );

			this.balls.push( ball  );
		}	



		

		this.plunger_box = new Txbox( this, 1.54, 0.9 , 0.25,0.25 );
    	
    	let leftdrain_plunger_box = new Txbox( this, -1.75, 0.9 , 0.1,0.15);
    	let rightdrain_plunger_box = new Txbox( this, 1.3222, 0.9, 0.1,0.15);

		
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

			if ( contact.GetFixtureA().GetBody().GetUserData() != null  && contact.GetFixtureB().GetBody().GetUserData() != null ) {

				let userdataA = contact.GetFixtureA().GetBody().GetUserData();
				let userdataB = contact.GetFixtureB().GetBody().GetUserData();

				if ( userdataA.substr(0,4) == "ball" ) {
				
					let ball_id = parseInt( userdataA.substr(4,2) );
					let ball    = _this.balls[ball_id] ;

					_this.toggleButton( userdataB , ball );

				} else if ( userdataB.substr(0,4) == "ball") {
					
					let ball_id = parseInt( userdataB.substr(4,2) );
					let ball    = _this.balls[ball_id] ;
					_this.toggleButton( userdataA , ball );
				
				}

			} else if ( contact.GetFixtureA().GetBody().GetUserData() != null  || contact.GetFixtureB().GetBody().GetUserData() != null ) {
				
				let userdataA = contact.GetFixtureA().GetBody().GetUserData();
				let userdataB = contact.GetFixtureB().GetBody().GetUserData();
				let fixtureA  = contact.GetFixtureA();
				let fixtureB  = contact.GetFixtureB();

				if ( userdataA != null && userdataA.substr(0,4) == "ball"  ) {

					if ( fixtureB.GetRestitution() == 1.01 ) {

						_this.sndBell.playOnce();
						_this.update_score( 1000 );


					} else if ( fixtureB.GetRestitution() > 0.5 )  {

						_this.sndBump.playOnce();
					}


				} else if ( userdataB != null && userdataB.substr(0,4) == "ball" ) {
					if ( fixtureA.GetRestitution() == 1.01 ) {

						_this.sndBell.playOnce();
						_this.update_score( 1000 );
	

					} else if ( fixtureA.GetRestitution() > 0.5 )  {

						_this.sndBump.playOnce();
					}
							
				}
			}
		  	
		  
		}

		contactListener.EndContact = function (contact) {
		  	
			
			
		}
		contactListener.PostSolve = function (contact, impulse) {

		}
		contactListener.PreSolve = function (contact, oldManifold) {

		}
		this.world.SetContactListener(contactListener);	


		
		this.sndFlipper = new Txsound( this, resources.sounds.flipper );
		this.sndLaunch  = new Txsound( this, resources.sounds.launch );
		this.sndBell    = new Txsound( this, resources.sounds.bell );
		this.sndBump 	= new Txsound( this, resources.sounds.bump );
		this.sndPop		= new Txsound( this, resources.sounds.pop );
		this.sndClick   = new Txsound( this, resources.sounds.click );
		this.sndHole    = new Txsound( this, resources.sounds.hole );
		this.sndDie 	= new Txsound( this, resources.sounds.die );
		this.sndPasslane = new Txsound( this, resources.sounds.passlane) ;
		this.sndTada 	 = new Txsound( this, resources.sounds.tada );
		this.sndJackpot 	= new Txsound(this, resources.sounds.jackpot );
		this.sndSad 		= new Txsound(this, resources.sounds.sad );
		this.sndGameover 	= new Txsound(this, resources.sounds.gameover );
		this.sndBgmusic 	= new Txsound(this, resources.sounds.bgmusic );
		this.sndDramatic 	= new Txsound(this,resources.sounds.dramatic);
		this.sndCompletion  = new Txsound(this, resources.sounds.completion);


       

        this.txtBall = new Txtext( this, {
        	position: new Vector3( 2.4 , 5 , 0 ),
        	scale   : new Vector3( 1 , 1 , 1 )
        }, "txtball");
        this.txtBall.setText("Ball 1");

        this.txtScore = new Txtext( this, {
        	position: new Vector3( 2.4 , 4.5 , 0 ),
        	scale   : new Vector3( 1 , 1 , 1 )
        },"txtscore" );
        this.txtScore.setText("Score : 0");
        	

        this.txtStatus = new Txtext( this, {
        	position: new Vector3( 2.4 , 4 , 0 ),
        	scale   : new Vector3( 1 , 1 , 1 )
        },"txtstatus");
       
        let txtboard = new Txbox( this, 2.1, 2.4, 3, 3.4 );
        txtboard.box_transform.position.z += 0.1;



        this.reset_all_board_state_for_newgame();	

    }    




    //-------------
    txt_onClick(  id ) {
    	log( id , "onclicked" );

    }



















    //----
    public global_input_down(e) {


    	if ( e.buttonId == 0 ) {
    		
    		if ( this.boardstates["gameover"] != 1 ) {
    			this.plunger_on_pressed = true;
    		}
    	
    	} else if ( e.buttonId == 1 ) {
			
			this.jointL.EnableMotor(true);

			//this.releaseOtherBall();
			this.sndFlipper.playOnce();


				
    	} else if ( e.buttonId == 2 ) {

    		this.jointR.EnableMotor(true);
    		this.sndFlipper.playOnce();
			
    			
			
    		
    	}
    }



















    //----
    public global_input_up(e) {

    	if ( e.buttonId == 0 ) {
    		
    		if ( this.boardstates["gameover"] != 1 ) {
    			this.plunger_on_pressed = false;
    			this.sndLaunch.playOnce();
    		} else {
    			this.reset_all_board_state_for_newgame();
    		}

    	} else if ( e.buttonId == 1 ) {

    		this.jointL.EnableMotor(false);

    	} else if ( e.buttonId == 2 ) {
    		this.jointR.EnableMotor(false);
    	}	
    }


    step(dt:number) {
    	
    	this.world.Step( dt * 0.55  , 10, 10 );
    	
    	
			
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

		let b;
		for ( b = 0 ; b < this.balls.length ; b++) {

			let ball = this.balls[b];

			ball.updatePosition_toBox2d();

			if ( ball.sticker != ""  ) {

				if ( ball.stickerCountdown > 0 ) {
					
					
					ball.box2dbody.SetType( b2BodyType.b2_staticBody );
					ball.box2dbody.SetAwake( true );

					if ( ball.sticker == "at_cbonus" || ball.sticker == "at_tbonus" || ball.sticker == "at_lock" ) {
						ball.box2dbody.SetPosition( this.sensors[ ball.sticker ].GetPosition() );
						ball.transform.position.z = 0.02;
						if ( ball.stickerCountdown == this.stayatholeinterval ) {
							this.sndHole.playOnce();
						}
					}

					ball.stickerCountdown -= 1;
					if ( ball.sticker == "at_cbonus" &&  this.boardstates["has_cbonus"] == 1 || ball.sticker == "at_tbonus" &&  this.boardstates["has_tbonus"] == 1 ) { 
						let random_score = Math.floor( Math.random() * 250000 );
						this.txtStatus.setText( "Random Bonus Score\n" + random_score );
					}
				} else {

					
					ball.box2dbody.SetType( b2BodyType.b2_dynamicBody );
					ball.box2dbody.SetAwake( true );
					ball.transform.position.z = -0.05;
					
					if ( ball.sticker == "at_cbonus" ) { 
						ball.box2dbody.ApplyLinearImpulse( new b2Vec2( 0.252, -0.3) , ball.box2dbody.GetWorldCenter(), true )
						this.sndPop.playOnce();

						if( this.boardstates["has_cbonus"] == 1 ) {
							
							let random_score = Math.floor( Math.random() * 250000 );
							this.update_score( random_score );
							this.txtStatus.setText( "Random Bonus Score\n" + random_score );
			  					
							this.boardstates["has_cbonus"] = 0;
			  				this.lights["has_cbonus"].turn_off();
			  			}

					}
					if ( ball.sticker == "at_tbonus" ) { 
						ball.box2dbody.ApplyLinearImpulse( new b2Vec2( -0.18, -0.3) , ball.box2dbody.GetWorldCenter() , true )
						this.sndPop.playOnce();

						if ( this.boardstates["has_tbonus"] == 1 ) {
			  				 
							let random_score = Math.floor( Math.random() * 250000 );
							this.update_score( random_score );
							this.txtStatus.setText( "Random Bonus Score\n" + random_score );
			  				
							this.boardstates["has_tbonus"] = 0;
			  				this.lights["has_tbonus"].turn_off();
			  			}	
					}
					if ( ball.sticker == "at_lock" ) { 
						ball.box2dbody.ApplyLinearImpulse( new b2Vec2( 0.1, -0.3) , ball.box2dbody.GetWorldCenter() , true )
						this.sndPop.playOnce();
						
						this.boardstates["has_lock"] = 0;
			  			this.lights["has_lock"].turn_off();

					}

					if ( ball.sticker == "at_leftdrain" ) {
						ball.box2dbody.ApplyLinearImpulse( new b2Vec2(  0.0,  0.15) , ball.box2dbody.GetWorldCenter() , true )
						this.boardstates["has_leftouterdrain"] = 0;
						this.lights["has_leftouterdrain"].turn_off();
						this.sndPop.playOnce();
						

					}
					if ( ball.sticker == "at_rightdrain" ) {
						ball.box2dbody.ApplyLinearImpulse( new b2Vec2(  0.0,  0.13) , ball.box2dbody.GetWorldCenter() , true );
						this.boardstates["has_rightouterdrain"] = 0;
						this.lights["has_rightouterdrain"].turn_off();
						this.sndPop.playOnce();
						
					}

					ball.sticker = "";
					ball.stickerCountdown = 50;
					
					
				}
			} else {
				if ( ball.stickerCountdown > 0 ) {
					ball.stickerCountdown -= 1;
				}
			}
		}

		// Process fake setTimeout 
		let i;
		for ( i = this.callback_queue.length - 1 ; i >= 0 ;  i-- ) {
			if ( this.callback_queue[i] == "releaseOtherBall" ) {
				this.releaseOtherBall();
				this.callback_queue.pop();
			}
		}

    }


    //--------------------
    update( dt:number ) {
    	
    	this.step(dt);

    }















    //-------------
    ball_ondies( ball_id ) {
    	
    	let b;
    	let other_liveball = 0;
    	
    	this.unlockBall();
    	
    	for ( b = 0 ; b < this.balls.length ; b++ ) {
    		if ( b != ball_id && this.balls[b].visible == 1 ) {
    			other_liveball += 1;
    		}
    	}

    	// No other liveball
    	if ( other_liveball == 0 ) {
    		// We reset this ball back to live.
			this.balls[ball_id].show(); 

			// deduct extraball.
			if ( this.boardstates["extraball"] != null && this.boardstates["extraball"] > 0 ) {
				 this.boardstates["extraball"] -= 1;
				if ( this.boardstates["extraball"] == 0 ) {
				 	this.lights["has_extraball"].turn_off();
				}

				this.sndDie.playOnce(); 
				this.txtStatus.setText("Got Extraball. SHOOT AGAIN.");

			} else {
				// No extraball advance ball index.
				if ( this.boardstates["ball_index"] >= 3 ) {
					this.gameover();	
					
				} else {
				
					this.reset_all_board_state_for_nextball();
					this.txtStatus.setText("Oops... Next Ball");
				
				}
				this.sndSad.playOnce();
				
			}
    	
			


    	} else {
    		this.sndDie.playOnce();	
    	}

    	this.boardstates["hastrig_jackpot"] = 0;
		this.lights["hastrig_jackpot"].turn_off();
			
		
    }


    //-------
    gameover() {

    	let b;
    	for ( b = 0 ; b < this.balls.length ; b++ ) {
    		this.balls[b].hide();
    	}


    	this.txtStatus.setText("Game OVER!!");
    	this.boardstates["gameover"] = 1;
    	this.sndGameover.playOnce();



    }


    


   	

    //-------------
    reset_all_board_state_for_newgame( ) {
    	
    	this.boardstates["ball_index"] 	= 0;
    	this.boardstates["score"] 		= 0;
    	this.boardstates["gameover"] = 0;
    	
    	this.reset_all_board_state_for_nextball();

		this.sndBgmusic.stop();
		this.sndBgmusic.playOnce();
    	this.balls[0].show();

    	this.txtScore.setText("Score : " + this.boardstates["score"] );
    	this.txtStatus.setText("New Game Initialized.\nE for Left Flipper\nF for Right Flipper\nHold and Release\nleft mouse to Launch Ball\n");
        



    }




    //------------
    // Reset due to next ball
    reset_all_board_state_for_nextball( ) {

    	this.boardstates["ball_index"] += 1;

    	this.txtBall.setText( "Ball : " + this.boardstates["ball_index"] );

    	this.boardstates["has_lock"] = 0;
		this.lights["has_lock"].turn_off();

		this.boardstates["has_tbonus"] = 1;
		this.lights["has_tbonus"].turn_on(); 

		this.boardstates["has_cbonus"] = 0;
		this.lights["has_cbonus"].turn_off(); 



		this.boardstates["has_rightouterdrain"] = 1;
		this.lights["has_rightouterdrain"].turn_on();

		this.boardstates["has_leftouterdrain"] = 1;
		this.lights["has_leftouterdrain"].turn_on();
			
		this.boardstates["has_rightinnerdrain"] = 1;
		this.lights["has_rightinnerdrain"].turn_off();

		this.boardstates["has_leftinnerdrain"] = 1;
		this.lights["has_leftinnerdrain"].turn_off();


		let i , h;
		
		for ( h = 0 ; h < this.eb_tog_has_categories.length ; h++ ) {

			let category = this.eb_tog_has_categories[h];
			let eb_count = this.eb_tog_has_ebcount[h];
			
			for ( i = 0 ; i < eb_count  ; i++ ) {
				this.boardstates["eb_" + category +"_" + i] = 0;
				this.lights["tog_" + category + "_" + i].turn_off();
			}
		}
		
		this.boardstates["magic"] = 0;
		for ( i = 0 ; i < 5 ; i++ ) {
			this.lights["mul_magic_" + i].turn_off();
		}
		
		this.boardstates["cbonus"] = 0;
		for ( i = 0 ; i < 4 ; i++ ) {
			this.lights["mul_cbonus_" + i].turn_off();
		}

		
		this.boardstates["hastrig_jackpot"] = 0;
		this.lights["hastrig_jackpot"].turn_off();

		this.boardstates["hastrig_extraball"] = 0;
		this.lights["hastrig_extraball"].turn_off();

		
		this.boardstates["has_doublescore"] = 0;
		this.lights["has_doublescore"].turn_off();

		
		// Give lane reward here...
		this.boardstates["lanemul"] = 0; 
		for ( i = 0 ; i < 7 ;i++ ) {
			this.lights["mul_lane_" + i].turn_off();
		}

    }	






    //-------------
    update_score( addscore ) {

    	if ( this.boardstates["score"] == null ) {
    		this.boardstates["score"] = 0;

    	}
    	let use_score = addscore;
    	if ( this.boardstates["has_doublescore"] == 1  ){
    		use_score = 2 * addscore;
    	}

    	this.boardstates["score"] += use_score;
    	this.txtScore.setText( "Score : " +  this.boardstates["score"] ); 

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






	//----------
	public toggleButton( buttonName , ball ) {

		let h , i  ;

		if ( buttonName == "at_tbonus" || buttonName == "at_cbonus" || buttonName == "at_lock" || 
			 buttonName == "at_leftdrain" || buttonName == "at_rightdrain" ) {
  			 
			if ( ball.stickerCountdown == 0 ) {
				
				let has_catch = 0;
				if ( buttonName == "at_tbonus" || buttonName == "at_cbonus" || buttonName == "at_lock" ) {
					has_catch = 1;
				}
				if ( buttonName == "at_leftdrain" && this.boardstates["has_leftouterdrain"] == 1 ) {
					has_catch = 1;
				}
				if ( buttonName == "at_rightdrain" && this.boardstates["has_rightouterdrain"] == 1 ) {
					has_catch = 1;
				}

				if ( has_catch == 1 ) {
					

					let xdiff = this.sensors[buttonName].GetPosition().x - ball.box2dbody.GetPosition().x ;
					let ydiff = this.sensors[buttonName].GetPosition().y - ball.box2dbody.GetPosition().y ;

					let distance_sqr = xdiff * xdiff + ydiff * ydiff;
					
					let hole_radius_sqr = 0.015;
					if ( buttonName == "at_tbonus" || buttonName == "at_lock") {
						hole_radius_sqr = 0.020;
					}
					if ( buttonName == "at_leftdrain" || buttonName == "at_rightdrain" ) {
						hole_radius_sqr = 0.08;
					}

					if ( distance_sqr < hole_radius_sqr ) {

						//this.txtStatus.setText("Ball entered HOLE");

						var hole_id = buttonName;
			  			
			  			ball.sticker = hole_id;
			  			ball.stickerCountdown = this.stayatholeinterval;
		  				
			  			if ( buttonName == "at_lock" && this.boardstates["has_lock"] == 1 && this.checkliveballcnt() < 2 ) {
			  				
			  				ball.stickerCountdown = 9999999;
			  				this.callback_queue.push( "releaseOtherBall" );
			  				this.txtStatus.setText("Ball locked.\nSecond ball granted.\nSHOOT AGAIN");

			  			}
			  			if ( buttonName == "at_tbonus" &&  this.boardstates["has_tbonus"] == 1  ) {
			  				this.sndJackpot.playOnce();
			  				ball.stickerCountdown = 120;
			  				this.txtStatus.setText("RIGHT HOLE\nentered");
			  				
			  			}
			  			if ( buttonName == "at_cbonus" && this.boardstates["has_cbonus"] == 1  ) {
			  				
			  				ball.stickerCountdown = 120;
			  				this.txtStatus.setText("LEFT HOLE\nentered");
			  				this.sndJackpot.playOnce();
			  				
			  			}

	  				} 
  				}
  			}
			
		} else {

			for ( h = 0 ; h < this.eb_tog_has_categories.length ; h++ ) {

				let category = this.eb_tog_has_categories[h];
				let completion_prefix  = this.eb_completion_prefix[h];
				let completion_upgrade = this.eb_completion_upgrade[h];
				let categoryname = this.eb_categories_name[h];

				if ( buttonName.substring(0,  ("eb_" + category ).length ) == "eb_" + category  ) {
				
					if ( this.boardstates[buttonName] != 1 ) {
						
						this.boardstates[buttonName] = 1;
						let lightname = buttonName.replace("eb","tog");
						this.lights[lightname].turn_on();

						this.sndClick.playOnce();
						// One button clicked 
						this.update_score(1000);


						let litcount = 0;
						for ( i = 0 ; i < 3 ; i++ ) {
							if ( this.boardstates["eb_" + category + "_" + i ] == 1 ) {
								litcount += 1
							} else {
								break;
							}	
						}


						// Completed.
						if ( litcount == 3 ) {
							// all 3 eb_tbonus buttons are lit.
							this.boardstates[ completion_prefix + "_" + category ] = 1;

							this.lights[ completion_prefix + "_" + category ].turn_on();

							this.update_score(10000);
							this.txtStatus.setText( categoryname + " ACTIVATED!")

							// completion upgrade
							if ( completion_upgrade != "" ) {

								if ( completion_upgrade == "drain" ) {
									// Enable lock also enable inner drain
									this.boardstates["has_leftinnerdrain"] = 1;
									this.lights["has_leftinnerdrain"].turn_on();
									this.boardstates["has_rightinnerdrain"] = 1;
									this.lights["has_rightinnerdrain"].turn_on();

								} else {
									if ( this.boardstates[completion_upgrade] == null ) {
										this.boardstates[completion_upgrade] = 0; 
									}
									let completion_upgrade_max = this.eb_completion_upgrademax[h];

									if ( this.boardstates[completion_upgrade] < completion_upgrade_max ) {
										
										this.boardstates[completion_upgrade] += 1;
										for ( i = 0 ; i < completion_upgrade_max ; i++ ) {
											if ( i < this.boardstates[completion_upgrade] ) {
												this.lights["mul_" + completion_upgrade +"_" + i].turn_on();
											} else {
												break;
											}
										}

									} else {
										// MAgic completes.
										let completion_upgrade2 = this.eb_completion_upgrade2[h] ;
										if ( completion_upgrade2 != "" ) {

											this.txtStatus.setText("CENTRAL PLAZA REWARD COMPLETION");

											this.sndCompletion.playOnce();
											this.update_score( 1000000 );


											for ( i = 0 ; i < completion_upgrade_max ; i++ ) {
												this.boardstates[completion_upgrade] = 0;
												this.lights["mul_" + completion_upgrade +"_" + i].turn_off();
											
												this.boardstates["hastrig_jackpot"] = 1;
												this.lights["hastrig_jackpot"].turn_on();
											}
										}
									}
								}
							}

							// Turn off the eb
							for ( i = 0 ; i < 3 ; i++ ) {
								this.boardstates["eb_" + category +"_" + i ] = 0;
								this.lights["tog_" + category + "_" + i ].turn_off();
							}
						}
					}
				}
			}
			

			if ( buttonName == "at_extraball" && this.boardstates["hastrig_extraball"] == 1 ) {

				if ( this.boardstates["extraball"] == null ) {
					this.boardstates["extraball"] = 0;
				}
				this.boardstates["extraball"] += 1;
				this.lights["has_extraball"].turn_on();

				this.boardstates["hastrig_extraball"] = 0;
				this.lights["hastrig_extraball"].turn_off();

				this.sndTada.playOnce();
				this.update_score(5000);
				this.txtStatus.setText( "EXTRABALL gotten!")


			}

			if ( buttonName == "at_jackpot" && this.boardstates["hastrig_jackpot"] == 1 ) {
				
				this.txtStatus.setText("JACKPOT!!");
				this.sndDramatic.playOnce();
				this.update_score( 1000000 );
												
											
				// Give 1 mill here..
				this.boardstates["hastrig_jackpot"] = 0;
				this.lights["hastrig_jackpot"].turn_off();
			}

			if ( buttonName == "at_lanebonus" ) {
				
				// Give lane reward here...
				if ( this.boardstates["lanemul"] == null ) {
					this.boardstates["lanemul"] = 0; 
				}

				this.txtStatus.setText("HYPERDRIVE"  );
				this.update_score( this.score_for_lanemul[ this.boardstates["lanemul"]  ] );
												
				
				this.boardstates["lanemul"] += 1;
				for ( i = 0 ; i < 7 ;i++ ) {
					if ( i < this.boardstates["lanemul"] ) {
						this.lights["mul_lane_" + i].turn_on();
					} else {
						break;
					}
				}
				this.unlockBall();
				this.sndPasslane.playOnce();

			}

			
			if ( buttonName == "eb_leftdrain"  && this.boardstates["has_leftinnerdrain"] == 1) {
				
				this.boardstates["has_leftouterdrain"] = 1;
				this.lights["has_leftouterdrain"].turn_on();
				
				this.boardstates["has_leftinnerdrain"] = 0;
				this.lights["has_leftinnerdrain"].turn_off();

			}

			if ( buttonName == "eb_rightdrain" && this.boardstates["has_rightinnerdrain"] == 1 ) {

				this.boardstates["has_rightouterdrain"] = 1;
				this.lights["has_rightouterdrain"].turn_on();

				this.boardstates["has_rightinnerdrain"] = 0;
				this.lights["has_rightinnerdrain"].turn_off();
				
			}
			

		}




	}





	//----
	public checkliveballcnt( ) {
		let b;
		let liveball_cnt = 0;
		for ( b = 0 ; b < this.balls.length ; b++ ) {
			if ( this.balls[b].visible == 1 ) {
				liveball_cnt += 1;
			}
		}	
		return liveball_cnt;
	}


	//------
	public releaseOtherBall() {
		let b;
		for ( b = 0 ; b < this.balls.length ; b++ ) {
			if ( this.balls[b].visible == 0 ) {
				this.balls[b].show();
			}
		}

	}
	//---
	public unlockBall() {
		let b;
		let liveball_cnt = 0;
		for ( b = 0 ; b < this.balls.length ; b++ ) {
			if ( this.balls[b].visible == 1 ) {
				liveball_cnt += 1;
				if ( this.balls[b].stickerCountdown > 10000 ) {
					this.balls[b].stickerCountdown = 20;
				}
			}
		}	

		if ( liveball_cnt == 2 ) {
			this.boardstates["hastrig_jackpot"] = 1;
			this.lights["hastrig_jackpot"].turn_on();
		}

		this.boardstates["has_lock"] = 0;
		this.lights["has_lock"].turn_off();

	}



	///-------------
	public place_lights() {

		this.lights["has_lock"] = new Txlight( this , -0.935009 , 5.620511,  0.10 )
		this.lights["has_lock"].material.emissiveColor = Color3.Green();

		

		this.lights["tog_doublescore_0"] = new Txlight( this , 0.120712 , 5.4428659999999995,  0.10 )
		this.lights["tog_doublescore_1"] = new Txlight( this , 0.460777 , 5.361656,  0.10 )
		this.lights["tog_doublescore_2"] = new Txlight( this , 0.79069 , 5.270296,  0.10 )

		this.lights["tog_doublescore_0"].material.emissiveColor = Color3.Red();
		this.lights["tog_doublescore_1"].material.emissiveColor = Color3.Red();
		this.lights["tog_doublescore_2"].material.emissiveColor = Color3.Red();


		this.lights["hastrig_extraball"] = new Txlight( this , 1.22287 , 4.803342,  0.25 )
		this.lights["hastrig_extraball"].material.emissiveColor = Color3.Red();


		this.lights["hastrig_jackpot"] = new Txlight( this , -1.12287 , 3.913342,  0.25 )
		this.lights["hastrig_jackpot"].material.emissiveColor = Color3.Purple();
				

		this.lights["mul_cbonus_0"] = new Txlight( this , 1.126693 , 3.627837,  0.10 )
		this.lights["mul_cbonus_1"] = new Txlight( this , 1.126693 , 3.4457269999999998,  0.10 )
		this.lights["mul_cbonus_2"] = new Txlight( this , 1.126693 , 3.263616,  0.10 )
		this.lights["mul_cbonus_3"] = new Txlight( this , 1.126693 , 3.0873809999999997,  0.10 )


		this.lights["has_cbonus"] = new Txlight( this , -1.419221 , 3.0812899999999996,  0.10 )
		this.lights["has_cbonus"].material.emissiveColor = Color3.Green();
			

		this.lights["has_tbonus"] = new Txlight( this , 1.0730950000000001 , 3.8706449999999997,  0.10 )
		this.lights["has_tbonus"].material.emissiveColor = Color3.Green();
		

		this.lights["has_extraball"] = new Txlight( this , 0.286176 , 1.605723,  0.10 )
		this.lights["has_doublescore"] = new Txlight( this , 0.49326 , 2.0625259999999996,  0.10 )
		
		this.lights["has_extraball"].material.emissiveColor = Color3.Red();
		this.lights["has_doublescore"].material.emissiveColor = Color3.Red();
		
		


		this.lights["has_leftouterdrain"] = new Txlight( this , -1.735937 , 1.83717,  0.10 )
		this.lights["has_leftinnerdrain"] = new Txlight( this , -1.425311 , 2.0635189999999996,  0.10 )
		
		this.lights["has_rightinnerdrain"] = new Txlight( this , 1.017061 , 2.0696099999999997,  0.10 )
		this.lights["has_rightouterdrain"] = new Txlight( this , 1.309415 , 1.8432600000000001,  0.10 )

		
		this.lights["tog_extraball_0"] = new Txlight( this , -1.030662 , 5.334519,  0.10 )
		this.lights["tog_extraball_1"] = new Txlight( this , -0.9460689999999999 , 5.161808,  0.10 )
		this.lights["tog_extraball_2"] = new Txlight( this , -0.8614759999999999 , 4.974998,  0.10 )
		
		this.lights["tog_lock_0"] = new Txlight( this , -0.8086049999999999 , 4.6472,  0.10 )
		this.lights["tog_lock_1"] = new Txlight( this , -0.8050799999999999 , 4.463915,  0.10 )
		this.lights["tog_lock_2"] = new Txlight( this , -0.8086049999999999 , 4.27358,  0.10 )
		
		this.lights["tog_tbonus_0"] = new Txlight( this , -1.23157 , 3.385353,  0.10 )
		this.lights["tog_tbonus_1"] = new Txlight( this , -1.070843 , 3.457257,  0.10 )
		this.lights["tog_tbonus_2"] = new Txlight( this , -0.880509 , 3.5249319999999997,  0.10 )

		this.lights["tog_cbonus_0"] = new Txlight( this , 1.33583 , 3.613755,  0.10 )
		this.lights["tog_cbonus_1"] = new Txlight( this , 1.34006 , 3.448798,  0.10 )
		this.lights["tog_cbonus_2"] = new Txlight( this , 1.34006 , 3.271152,  0.10 )
		this.lights["tog_cbonus_3"] = new Txlight( this , 1.344289 , 3.097737,  0.10 )

		this.lights["mul_magic_0"] = new Txlight( this , -0.683464 , 3.18344,  0.20 )
		this.lights["mul_magic_1"] = new Txlight( this , -0.399581 , 3.4500139999999997,  0.20 )
		this.lights["mul_magic_2"] = new Txlight( this , -0.03529999999999998 , 3.553102,  0.20 )
		this.lights["mul_magic_3"] = new Txlight( this , 0.29974500000000002 , 3.458088,  0.20 )
		this.lights["mul_magic_4"] = new Txlight( this , 0.561701 , 3.1861309999999996,  0.20 )
		

		this.lights["mul_lane_0"] = new Txlight( this , -0.6712819999999999 , 1.485127,  0.10 )
		this.lights["mul_lane_1"] = new Txlight( this , -0.744371 , 1.68612,  0.10 )
		this.lights["mul_lane_2"] = new Txlight( this , -0.8296399999999999 , 1.874932,  0.10 )
		this.lights["mul_lane_3"] = new Txlight( this , -0.890547 , 2.063744,  0.10 )
		this.lights["mul_lane_4"] = new Txlight( this , -0.9758169999999999 , 2.2464649999999997,  0.10 )
		this.lights["mul_lane_5"] = new Txlight( this , -1.073269 , 2.4596389999999997,  0.10 )
		this.lights["mul_lane_6"] = new Txlight( this , -1.151994 , 2.6484509999999997,  0.10 )

		this.lights["mul_lane_6"].material.emissiveColor = Color3.Red();
		



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
		vertices.push(  new b2Vec2(   0.02,  0.0   ) );   
		vertices.push(  new b2Vec2(   0.02,  0.02   ) );   
		vertices.push(  new b2Vec2(   0.0,  0.02   ) );   
		this.sensors["at_leftdrain"]   = this.createStaticSensor( -1.7057 + xoffset , 1.2185 + yoffset , vertices , this.world , "at_leftdrain" );
		

		vertices.length = 0 ;
		vertices.push(  new b2Vec2(   0.0,  0.0   ) );   
		vertices.push(  new b2Vec2(   0.02,  0.0   ) );   
		vertices.push(  new b2Vec2(   0.02,  0.02   ) );   
		vertices.push(  new b2Vec2(   0.0,  0.02   ) );   
		this.sensors["at_rightdrain"]   = this.createStaticSensor( 1.3239  + xoffset , 1.2185 + yoffset , vertices , this.world , "at_rightdrain" );
		


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


		let bL = this.createStaticShape(  -1.28 + xoffset , 1.55 + yoffset , vertices, this.world  );	
		bL.GetFixtureList().SetRestitution(1.0);


		// Bumper Right
		vertices.length = 0;
		vertices.push(  new b2Vec2(    0,  0) );
        vertices.push(  new b2Vec2(  0.42, 0.22) );
        vertices.push(  new b2Vec2(  0.42, 0.92) );
        vertices.push(  new b2Vec2(  0.28, 0.82) );
        vertices.push(  new b2Vec2(    0,  0.22) );


		let bR = this.createStaticShape(  0.5 + xoffset , 1.35 + yoffset , vertices, this.world  );	
		bR.GetFixtureList().SetRestitution(1.0);
					




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
        	
        let t1 = this.createStaticShape( -2 + xoffset ,  3.28 + yoffset , vertices, this.world  );	
		t1.GetFixtureList().SetRestitution(1.2);
						

        // trapezium on left
        vertices.length = 0;
		vertices.push(  new b2Vec2(    0,  0   ) );
		vertices.push(  new b2Vec2(  0.2,  0.3   ) );
        vertices.push(  new b2Vec2(  0.12 , 0.5   ) );
        vertices.push(  new b2Vec2(  -0.04 ,  0.6  ) );
        	
        let t2 = this.createStaticShape( -1.84 + xoffset ,  2.38 + yoffset , vertices, this.world  );	
		t2.GetFixtureList().SetRestitution(1.2);
		



		 // trapezium on inner right
        vertices.length = 0;
		vertices.push(  new b2Vec2(    0,  0   ) );
		vertices.push(  new b2Vec2(  0.18,  -0.2   ) );
        vertices.push(  new b2Vec2(  0.18 , 0.34   ) );
        vertices.push(  new b2Vec2(   0 ,  0.1  ) );
        	
        let t3 = this.createStaticShape( 1.24 + xoffset ,  2.70 + yoffset , vertices, this.world  );	
		t3.GetFixtureList().SetRestitution(1.2);

		 // trapezium on inner right
        vertices.length = 0;
		vertices.push(  new b2Vec2(    0,  0   ) );
		vertices.push(  new b2Vec2(  0.18,  -0.2   ) );
        vertices.push(  new b2Vec2(  0.18 , 0.34   ) );
        vertices.push(  new b2Vec2(   0 ,  0.1  ) );
        	
        let t4= this.createStaticShape( 1.32 + xoffset ,  4.24 + yoffset , vertices, this.world  );	
		t4.GetFixtureList().SetRestitution(1.2);



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
        
        let c1 = this.createStaticCircle( 0.04 + xoffset,  4.2  + yoffset , 0.18 , this.world );
		let c2 = this.createStaticCircle( -0.36 + xoffset,  4.74  + yoffset , 0.18 , this.world );
		let c3 = this.createStaticCircle( 0.71 + xoffset,  4.06  + yoffset , 0.18 , this.world );

		c1.GetFixtureList().SetRestitution(1.01);
		c2.GetFixtureList().SetRestitution(1.01);
		c3.GetFixtureList().SetRestitution(1.01);





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
		flipperLeft.GetFixtureList().SetRestitution(1.0);
			

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
		flipperRight.GetFixtureList().SetRestitution(1.0);
		
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