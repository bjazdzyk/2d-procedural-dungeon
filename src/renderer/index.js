import Dungeon from './dungeon.js'
import {rendered} from './screen.js'


(async ()=>{
	const D = await Dungeon()

	console.log(rendered(0, 0, 10, 10, 20, D))

})()