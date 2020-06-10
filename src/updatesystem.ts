



import resources from "src/resources";
import { Utils}     from "src/utils";


//----------------------------
// UpdateSystem callback 
export class UpdateSystem implements ISystem {

	public tables;
    public camera;
    public ui_2d_text;

    constructor( tables, camera ) {

    	this.camera = camera;
        this.tables = tables;

        let ui_2d_canvas     = new UICanvas();
        this.ui_2d_text      = new UIText( ui_2d_canvas );

        this.ui_2d_text.fontSize = 14;
        this.ui_2d_text.value    = "";
        this.ui_2d_text.vAlign = "top";
        
    }

    //Executed ths function on every frame
    update(dt: number) {
        
        let current_closest_table_dist = 999;

        
        for ( let t = 0 ; t < this.tables.length ; t++ ) {
        	
            let dist_to_player = Utils.distance( this.camera.position, this.tables[t].transform.position );
            if ( dist_to_player < 50 && dist_to_player < current_closest_table_dist ) {
                current_closest_table_dist = dist_to_player;
                this.ui_2d_text.value = this.tables[t].status_msg;
            }

            this.tables[t].update( dt  );

        }
    }
}
