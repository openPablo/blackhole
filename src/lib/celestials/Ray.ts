import * as THREE from 'three';
import type { BlackHole } from '$lib/celestials/BlackHole';

export class Ray {
	pos: THREE.Vector3
	dir: THREE.Vector3;
	points: THREE.Points = new THREE.Points();
	private trail: THREE.Vector3[] = [];

	//polar positions
	r: number;
	dr: number;
	//Velocity polar pos
	phi: number;
	dphi: number;


	delta: number = 0.02; //Step size
	eventHorizon: number;
	maxTrail: number = 200;
	constructor(pos: THREE.Vector3, dir: THREE.Vector3, blackholeEventHorizon: number) {
		this.pos = pos;
		this.dir = dir;
		this.eventHorizon = blackholeEventHorizon;

		//Distance quotation
		this.r = this.pos.length()
		this.phi = Math.atan2(this.pos.y, this.pos.x);

		//Velocity polar positions m/s
		this.dr = this.dir.x * Math.cos(this.phi) + this.dir.y * Math.sin(this.phi);
		this.dphi  = ( -this.dir.x * Math.sin(this.phi) + this.dir.y * Math.cos(this.phi) ) / this.r;


		this.trail.push(this.pos.clone());
	}

	step() {
		if (this.r  > this.eventHorizon){
			
			//Update velocity, close to blackhole -> faster and bend more
			this.dr 	+= this.calcD2r() * this.delta;
			this.dphi += this.calcD2phi() * this.delta;

			this.r 		+= this.dr * this.delta;
			this.phi 	+= this.dphi * this.delta;

			//Polar positions to Cartesian
			this.pos.x = Math.cos(this.phi) * this.r;
			this.pos.y = Math.sin(this.phi) * this.r;

			this.trail.push(this.pos.clone());
		}

		if (this.trail.length > this.maxTrail  || this.r  <= this.eventHorizon) {
			this.trail.shift();
		}
		this.updateGeometry();
	}
	draw(): THREE.Points {
		this.updateGeometry();
		this.points.material = new THREE.PointsMaterial({color: 0xffffff, size: 0.02, transparent: true, opacity: 0.5});
		return this.points;
	}

	// Calculate second derivative of r (radial acceleration)
	private calcD2r(): number {
		// Geodesic equation for radial coordinate in Schwarzschild metric (2D approximation)
		// d²r/dλ² = r(dφ/dλ)² - rs/(2r²) * (1 - rs/r) * c²
		return this.r * this.dphi * this.dphi - (this.eventHorizon) / (2.0 * this.r * this.r);

	}

	// Calculate second derivative of phi (angular acceleration)
	private calcD2phi(): number {
		// Geodesic equation for angular coordinate
		// d²φ/dλ² = -2(dr/dλ)(dφ/dλ)/r
		return -2.0 * this.dr * this.dphi / this.r;
	}

	private updateGeometry() {
		if (this.points.geometry) {
			this.points.geometry.dispose();
		}
		this.points.geometry = new THREE.BufferGeometry().setFromPoints(this.trail);
	}
}
