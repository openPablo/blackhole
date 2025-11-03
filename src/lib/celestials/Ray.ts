import * as THREE from 'three';
import type { BlackHole } from '$lib/celestials/BlackHole';

export class Ray {
	pos: THREE.Vector2
	dir: THREE.Vector2;
	points: THREE.Points = new THREE.Points();
	private trail: THREE.Vector2[] = [];

	//polar positions
	r: number;
	dr: number;
	//Velocity polar pos
	phi: number;
	dphi: number;

	speed = 0.01;
	maxTrail: number = 400;
	constructor(pos: THREE.Vector2, dir: THREE.Vector2, blackholeEventHorizon: number) {
		this.pos = pos;
		this.dir = dir;

		//Distance quotation
		this.r = this.pos.length()
		this.phi = Math.atan2(this.pos.y, this.pos.x);

		//Velocity polar positions m/s
		this.dr = this.dir.x * Math.cos(this.phi) + this.dir.y * Math.sin(this.phi);
		this.dphi  = ( -this.dir.x * Math.sin(this.phi) + dir.y * Math.cos(this.phi) ) / this.r;

		this.trail.push(this.pos);
	}

	step(eventHorizon: number, dlambda: number) {
		if (this.r  > eventHorizon){

			this.dr 	+= this.calcD2r(eventHorizon) * dlambda;
			this.dphi += this.calcD2phi() * dlambda;

			this.r 		+= this.dr * dlambda;
			this.phi 	+= this.dphi * dlambda;

			this.pos.x = Math.cos(this.phi) * this.r;
			this.pos.y = Math.sin(this.phi) * this.r;
			this.trail.push(this.pos.clone());
		}

		//if (this.trail.length > this.maxTrail  || this.pos.x == this.dir.x) {
		//	this.trail.shift();
		//}
		this.points.geometry = new THREE.BufferGeometry().setFromPoints( this.trail );
	}
	draw(): THREE.Points {
		this.points.geometry = new THREE.BufferGeometry().setFromPoints( this.trail );
		this.points.material = new THREE.PointsMaterial({color: 0xffffff, size: 0.02, transparent: true, opacity: 0.5});
		return this.points;
	}

	// Calculate second derivative of r (radial acceleration)
	private calcD2r(eventHorizon: number): number {
		// Geodesic equation for radial coordinate in Schwarzschild metric (2D approximation)
		// d²r/dλ² = r(dφ/dλ)² - rs/(2r²) * (1 - rs/r) * c²
		// Simplified version:
		return this.r * this.dphi * this.dphi - (eventHorizon) / (2.0 * this.r * this.r);
	}

	// Calculate second derivative of phi (angular acceleration)
	private calcD2phi(): number {
		// Geodesic equation for angular coordinate
		// d²φ/dλ² = -2(dr/dλ)(dφ/dλ)/r
		return -2.0 * this.dr * this.dphi / this.r;
	}

}
