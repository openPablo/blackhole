import * as THREE from 'three';
import type { BlackHole } from '$lib/celestials/BlackHole';

export class Ray {
	pos: THREE.Vector2
	direction: THREE.Vector2;
	points: THREE.Points = new THREE.Points();
	private trail: THREE.Vector2[] = [];

	//polar coords
	r: number;
	dr: number = 1;
	phi: number = 1;
	dphi: number =1;
	blackholeEventHorizon: number;

	speed = 0.02;
	maxTrail: number = 50;
	constructor(pos: THREE.Vector2, direction: THREE.Vector2, blackholeEventHorizon: number) {
		this.pos = pos;
		this.direction = direction;
		this.blackholeEventHorizon= blackholeEventHorizon;
		this.r = this.pos.length()
		this.phi = Math.atan2(this.pos.y, this.pos.x);

	}

	step() {
		this.trail.push(new THREE.Vector2(this.pos.x, this.pos.y));
		this.r = this.pos.length()
		this.phi = Math.atan2(this.pos.y, this.pos.x);


		if(this.r > this.blackholeEventHorizon) {
			this.pos.add(this.direction.clone().multiplyScalar(this.speed));
		}

		if (this.trail.length > this.maxTrail  || this.pos.x == this.direction.x) {
			this.trail.shift();
		}
		this.points.geometry = new THREE.BufferGeometry().setFromPoints( this.trail );
	}
	draw(): THREE.Points {
		this.points.geometry = new THREE.BufferGeometry().setFromPoints( this.trail );
		this.points.material = new THREE.PointsMaterial({color: 0xffffff, size: 0.02, transparent: true, opacity: 0.5});
		return this.points;
	}

	//https://en.wikipedia.org/wiki/Geodesics_in_general_relativity
	//Calculate shortest path from A to B in a spacetime grid
	//Derived geodisc quotation
	geodisc(): void {

		//rate of how much closer ray gets to blackhole
		this.dr += this.r * this.dphi * this.dphi - (this.speed*this.speed * this.blackholeEventHorizon) / (2.0 * this.r * this.r);
		//How fast does the angle change relative to the blackhole
		this.dphi = -2.0 * this.dr * this.dphi / this.r;
	}

}
