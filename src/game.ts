


import { Txpinball }    from "src/gameObjects/txpinball";
import { getUserData } from "@decentraland/Identity"
import { UpdateSystem } from "src/updatesystem";
import resources from "src/resources";
import {Txsound} from "src/gameObjects/txsound"
import {Utils} from "src/utils"


//----------------------------
export class MainClass {

    
  constructor() {

    var _this = this;
    let userData = executeTask(async () => {
        let data = await getUserData()
        log(data.displayName)
        let userID = data.displayName
        _this.start( userID );
    });
  }


  //---------------------
  public start( userID ) {

        log( Date(), "start", userID );

        const camera = Camera.instance;
        let tables = [];

        

        var table = new Txpinball(
            "pb0",
            userID,
            {
                    position: new Vector3( 7 , 0.5 , 7 ),
                    scale: new Vector3( 0.5, 0.5, 0.5)
            }
        );    
        tables.push( table );

         // System input object not specific to table
        const input = Input.instance;
        input.subscribe("BUTTON_DOWN", ActionButton.POINTER, false, (e) => {
            for ( let t = 0 ; t < tables.length ; t++ ) {
                tables[t].global_input_down(e);
            }
        });
        input.subscribe("BUTTON_UP", ActionButton.POINTER, false, (e) => {
            for ( let t = 0 ; t < tables.length ; t++ ) {
                tables[t].global_input_up(e);
            }
        });
        input.subscribe("BUTTON_DOWN", ActionButton.PRIMARY, false, (e) => {
            for ( let t = 0 ; t < tables.length ; t++ ) {
                tables[t].global_input_down(e);
            }
        });
        input.subscribe("BUTTON_UP", ActionButton.PRIMARY, false, (e) => {
            for ( let t = 0 ; t < tables.length ; t++ ) {
                tables[t].global_input_up(e);
            }
        });
        input.subscribe("BUTTON_DOWN", ActionButton.SECONDARY, false, (e) => {
            for ( let t = 0 ; t < tables.length ; t++ ) {
                tables[t].global_input_down(e);
            }
        });
        input.subscribe("BUTTON_UP", ActionButton.SECONDARY, false, (e) => {
            for ( let t = 0 ; t < tables.length ; t++ ) {
                tables[t].global_input_up(e);
            }
        });

        

        // Add system to engine
        engine.addSystem(new UpdateSystem( tables , camera ))
  } 
}


        

new MainClass();
