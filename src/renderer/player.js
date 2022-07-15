export class Player{
	constructor(dungeon, x, y){
		this.dungeon = dungeon
		this.x = x
		this.y = y

		console.log(this.dungeon)

	}

	move(dx, dy){
		this.x += dx
		this.y += dy
	}

	


}