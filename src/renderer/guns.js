import path from 'path'

const isDevelopment = process.env.NODE_ENV !== 'production'

const url = (src)=>{
	const reto = isDevelopment ? path.resolve(__static,`${src}`) : path.join(__static, `${src}`)
	return reto
}

class Bullet{
	constructor(type, size, speed, uniqueArgs){
		this.type = type
		this.size = size
		this.speed = speed
		this.uniqueArgs = uniqueArgs
	}

}


const metaDataMap = {
	colt:{
		fireRate: 500,
		type: 'semi-auto',
		accuracy: Math.PI/4,
		bulletsPerShot: 1,
		bulletInfo: ['round', 10, 1, {}],
		imgSrc: url('/Colt.png')
	}
}


class Gun{
	constructor(name){
		this.setWeapon(name)

		this.mx = 0
		this.my = 0

	}

	setWeapon(name){
		this.name = name
		this.metaData = metaDataMap[this.name]

		this.img = new Image()
		this.img.src = this.metaData.imgSrc
	}

	draw(ctx, x, y){
		
		const dx = this.mx - x
		const dy = this.my - y

		let a = Math.atan(dy/dx)*180/Math.PI
		
		
		
		const hs = 30
		const _W = window.innerWidth
		const _H = window.innerHeight


		if(dx<0){
			ctx.translate(_W, 0)
			ctx.scale(-1, 1)
			ctx.translate(_W-x, y)
			ctx.rotate(-1 * a * Math.PI / 180);
		}else{
			ctx.translate(x, y)
			ctx.rotate(a * Math.PI / 180);
		}
		
		

		ctx.drawImage(this.img, -hs, -hs, hs*2, hs*2)

		ctx.resetTransform()


	}
	shoot(){

	}
}


export {Gun, Bullet}