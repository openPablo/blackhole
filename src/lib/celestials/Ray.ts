import * as THREE from 'three';
const { sqrt, sin, cos, acos, atan2 } = Math;

export class Ray {
	pos: THREE.Vector3;
	dir: THREE.Vector3;
	points: THREE.Points = new THREE.Points();
	private trail: THREE.Vector3[] = [];

	//polar positions
	r: number;
	phi: number;
	theta: number;

	//Velocity (derivative) polar pos
	dr: number;
	dphi: number;
	dtheta: number;

	stepSize = 0.05;
	eventHorizon: number;
	maxLength: number = 600;
	E: number;

	constructor(pos: THREE.Vector3, dir: THREE.Vector3, blackholeEventHorizon: number) {
		this.pos = pos;
		this.dir = dir;
		this.eventHorizon = blackholeEventHorizon;

		//Get spherical (polar) coords
		this.r = this.pos.length();
		this.phi = atan2(this.pos.y, this.pos.x);
		this.theta = acos(this.pos.z / this.r);

		// Get polar velocities
		this.dr =
			sin(this.theta) * cos(this.phi) * this.dir.x +
			sin(this.theta) * sin(this.phi) * this.dir.y +
			cos(this.theta) * this.dir.z;
		this.dtheta =
			(cos(this.theta) * cos(this.phi) * this.dir.x +
				cos(this.theta) * sin(this.phi) * this.dir.y -
				sin(this.theta) * this.dir.z) /
			this.r;
		this.dphi =
			(-sin(this.phi) * this.dir.x + cos(this.phi) * this.dir.y) / (this.r * sin(this.theta));

		// calc energy constant
		let f = 1.0 - blackholeEventHorizon / this.r;
		let dt_dlambda = sqrt(
			(this.dr * this.dr) / f +
				this.r * this.r * this.dtheta * this.dtheta +
				this.r * this.r * sin(this.theta) * sin(this.theta) * this.dphi * this.dphi
		);
		this.E = f * dt_dlambda;

		this.trail.push(this.pos.clone());
	}

	step() {
		if (this.trail.length >= this.maxLength || this.r < this.eventHorizon) return;
		let adaptiveStep = 0.02;
		//let adaptiveStep =
		//	this.stepSize *
		//	(1 / (1 + 2 * (this.eventHorizon / Math.max(this.r - this.eventHorizon, 1e-6))));

		//Update velocity, close to blackhole -> faster and bend more
		this.dr += this.calcD2r() * adaptiveStep;
		this.dphi += this.calcD2phi() * adaptiveStep;
		this.dtheta += this.calcD2Theta() * adaptiveStep;

		this.r += this.dr * adaptiveStep;
		this.phi += this.dphi * adaptiveStep;
		this.theta += this.dtheta * adaptiveStep;

		//Polar positions to Cartesian
		this.pos.x = this.r * sin(this.theta) * cos(this.phi);
		this.pos.y = this.r * sin(this.theta) * sin(this.phi);
		this.pos.z = this.r * cos(this.theta);

		this.trail.push(this.pos.clone());
		this.updateGeometry();
	}
	draw(): THREE.Points {
		this.updateGeometry();
		this.points.material = new THREE.PointsMaterial({
			color: 0xffffff,
			size: 0.02,
			transparent: true,
			opacity: 0.5
		});
		return this.points;
	}

	// Calculate second derivatives of r (radial acceleration)
	// Geodesic equation for radial coordinate in Schwarzschild metric (2D approximation)
	private calcD2r(): number {
		let f = 1.0 - this.eventHorizon / this.r;
		let dt_dlambda = this.E / f;
		return (
			-(this.eventHorizon / (2 * this.r * this.r)) * f * dt_dlambda * dt_dlambda +
			(this.eventHorizon / (2 * this.r * this.r * f)) * this.dr * this.dr +
			this.r *
				(this.dtheta * this.dtheta + sin(this.theta) * sin(this.theta) * this.dphi * this.dphi)
		);
	}
	private calcD2Theta(): number {
		return (
			-(2.0 / this.r) * this.dr * this.dtheta +
			sin(this.theta) * cos(this.theta) * this.dphi * this.dphi
		);
	}

	// Calculate second derivative of phi (angular acceleration)
	private calcD2phi(): number {
		return (
			-(2.0 / this.r) * this.dr * this.dphi -
			((2.0 * cos(this.theta)) / sin(this.theta)) * this.dtheta * this.dphi
		);
	}

	private updateGeometry() {
		if (this.points.geometry) {
			this.points.geometry.dispose();
		}
		this.points.geometry = new THREE.BufferGeometry().setFromPoints(this.trail);
	}
}
