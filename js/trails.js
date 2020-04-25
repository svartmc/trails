var trails = {

	haveTrails: [],

}

function createTrail( object, length, width, resolution ) {

	// resolution must be less than the length

	if ( resolution > length ) {

		resolution = length;

	}

	object.userData.trail = {

		length: Math.round( length ),
		width: width,
		resolution: Math.round( resolution ),
		trailHistory: [],
		trailVertices: [],
		worldDirection: new THREE.Vector3(),

	}

	// trail geo

	var geometry = new THREE.PlaneGeometry( 1, length, 1, resolution );

	var material = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide, wireframe: false, transparent: true, opacity: 0.2 } ); // opacity: 0.2
	object.userData.trail.mesh = new THREE.Mesh( geometry, material );

	scene.add( object.userData.trail.mesh );

	trails.haveTrails.push( object );

	// setting frustumCulled to false is important because we move the vertices outside the frustum, not the geometry itself

	object.userData.trail.mesh.frustumCulled = false; 

	// create history and store vertices

	object.userData.trail.trailHistory = [];

	object.userData.trail.trailVertices = [];

	for ( var i = 0; i < resolution + 1; i++ ) {

		object.userData.trail.trailVertices[i] = [];

	}

	// store vertices based on left or right

	for ( var i = 0; i < object.userData.trail.trailVertices.length; i ++ ) {

		object.userData.trail.trailVertices[i][0] = object.userData.trail.mesh.geometry.vertices[i*2];
		object.userData.trail.trailVertices[i][1] = object.userData.trail.mesh.geometry.vertices[i*2+1];

	}

}

function updateTrailHistory( object ) {

	object.getWorldDirection( object.userData.trail.worldDirection );

	object.userData.trail.trailHistory.push( [ object.position.x, object.position.y, object.position.z, object.userData.trail.worldDirection.x, object.userData.trail.worldDirection.z ] );

	if ( object.userData.trail.trailHistory.length > object.userData.trail.length ) {

		object.userData.trail.trailHistory.shift();

	}

}

function updateTrails() {

	for ( var i = 0; i < trails.haveTrails.length; i++ ) {

		var object = trails.haveTrails[i];
		var trail = object.userData.trail;

		updateTrailHistory( object );

		for ( var j = 0; j < trail.trailVertices.length; j++ ) {

			var index = Math.round( trail.trailHistory.length / trail.resolution * j );

			if ( index === trail.trailHistory.length ) {

				index = trail.trailHistory.length - 1;

			}

			var pos = trail.trailHistory[index];

			// custom the shape changing this width parameter

			var width = THREE.Math.mapLinear( j, 0, trail.trailVertices.length, 0, 1 ) * trail.width / 2;

			if ( typeof pos != "undefined" ) {

				// update vertices using a "2D cross product"
				// one side of the trail, left or right

				trail.trailVertices[j][0].x = pos[0] - pos[4] * width;
				trail.trailVertices[j][0].y = pos[1];
				trail.trailVertices[j][0].z = pos[2] + pos[3] * width;

				// the other side of the trail

				trail.trailVertices[j][1].x = pos[0] + pos[4] * width;
				trail.trailVertices[j][1].y = pos[1];
				trail.trailVertices[j][1].z = pos[2] - pos[3] * width;

			}

		}

		trail.mesh.geometry.verticesNeedUpdate = true;

	}

}

function resetTrail( object ) {

	object.userData.trail.trailHistory = [];

}