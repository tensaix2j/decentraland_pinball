
export class Utils {
  
  	public static distance(pos1: Vector3, pos2: Vector3): number {
 		const a = pos1.x - pos2.x;
 		const b = pos1.z - pos2.z;
 		const c = pos1.y - pos2.y;
 		return a * a + b * b + c * c;
	}
};

