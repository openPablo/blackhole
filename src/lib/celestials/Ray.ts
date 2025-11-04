import * as THREE from 'three';
import type { BlackHole } from '$lib/celestials/BlackHole';

// Butcher Tableau coefficients for RKF45 https://en.wikipedia.org/wiki/Runge%E2%80%93Kutta%E2%80%93Fehlberg_method
const A = [0, 1/4, 3/8, 12/13, 1, 1/2];
const B = [
	[1/4],
	[3/32, 9/32],
	[1932/2197, -7200/2197, 7296/2197],
	[439/216, -8, 3680/513, -845/4104],
	[-8/27, 2, -3544/2565, 1859/4104, -11/40]
];
const C4 = [25/216, 0, 1408/2565, 2197/4104, -1/5, 0];
const C5 = [16/135, 0, 6656/12825, 28561/56430, -9/50, 2/55];


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


	h: number = 0.01; //Step size
	eventHorizon: number;
	maxTrail: number = 200;
	constructor(pos: THREE.Vector2, dir: THREE.Vector2, blackholeEventHorizon: number) {
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

			const d2r = this.calcD2r(this.r, this.dphi);
			const d2phi= this.calcD2phi(this.r,this.dr,this.dphi);
			//Update velocity, close to blackhole -> faster and bend more
			this.dr 	+= d2r * this.h;
			this.dphi += d2phi * this.h;

			this.r 		+= this.dr * this.h;
			this.phi 	+= this.dphi * this.h;

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

	//calculate second derivative of r (radial acceleration)
	private calcD2r(r: number, dphi: number): number {
		//Geodesic equation for radial coordinate in Schwarzschild metric (2D approximation)
		//d²r/dλ² = r(dφ/dλ)² - rs/(2r²) * (1 - rs/r) * c²
		//Simplified:
		return r * dphi * dphi - (this.eventHorizon) / (2.0 * r * r);
	}

	//calculate second derivative of phi (angular acceleration)
	private calcD2phi(r: number, dr: number, dphi: number): number {
		//Geodesic equation for angular coordinate
		//d²φ/dλ² = -2(dr/dλ)(dφ/dλ)/r
		//Simplified:
		return -2.0 * dr * dphi / r;
	}
	private updateGeometry() {
		if (this.points.geometry) {
			this.points.geometry.dispose();
		}
		this.points.geometry = new THREE.BufferGeometry().setFromPoints(this.trail);
	}
}
