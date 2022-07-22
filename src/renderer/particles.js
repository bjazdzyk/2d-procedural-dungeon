import path from 'path'

const isDevelopment = process.env.NODE_ENV !== 'production'

const url = (src)=>{
	const reto = isDevelopment ? path.resolve(__static,`${src}`) : path.join(__static, `${src}`)
	return reto
}


const particleMeta = {
	fire:{
		type:'fire',
		src: url('/ExploParticle.png'),
		cellSize: 20,
		animationCount: 1,
		animations:{
			0:[[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]]
		},
		msPerFrame: 50

	}
}



class Particle{
	constructor(type){
		this.meta = particleMeta[type]
	}
}

class Emiter{
	constructor(){

	}

}

class ParticleSystem{
	constructor(){
		const p = new Particle('fire')
		console.log(p)
	}
}

export {ParticleSystem}