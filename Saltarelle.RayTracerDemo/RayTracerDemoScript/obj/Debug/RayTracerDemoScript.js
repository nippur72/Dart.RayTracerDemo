(function() {
	////////////////////////////////////////////////////////////////////////////////
	// simpleray.Plane
	var $simpleray_$Plane = function(n, d, c) {
		this.$normal = null;
		this.$distance = 0;
		$simpleray_RTObject.call(this);
		this.$normal = n;
		this.$distance = d;
		this.color = c;
	};
	$simpleray_$Plane.prototype = {
		intersect: function(ray) {
			var normalDotRayDir = this.$normal.dot(ray.direction);
			if (normalDotRayDir === 0) {
				return -1;
			}
			// Any none-parallel ray will hit the plane at some point - the question now is just
			// if it in the positive or negative ray direction.
			var hitDistance = -(this.$normal.dot(ray.origin) - this.$distance) / normalDotRayDir;
			if (hitDistance < 0) {
				return -1;
			}
			else {
				return hitDistance;
			}
		},
		getSurfaceNormalAtPoint: function(p) {
			return this.$normal;
			// This is of course the same across the entire plane
		}
	};
	////////////////////////////////////////////////////////////////////////////////
	// simpleray.RayTracer
	var $simpleray_$RayTracer = function() {
	};
	$simpleray_$RayTracer.$main = function() {
		// init structures
		$simpleray_$RayTracer.$objects = [];
		$simpleray_$RayTracer.$lights = [];
		$simpleray_$RayTracer.$random = new $System_Random(1478650229);
		$simpleray_$RayTracer.$stopwatch = new $System_Stopwatch();
		$simpleray_$RayTracer.$speedSamples = [];
		var canvas = new $System_Drawing_Bitmap($simpleray_$RayTracer.$canvaS_WIDTH, $simpleray_$RayTracer.$canvaS_HEIGHT);
		// add some objects
		for (var i = 0; i < 30; i++) {
			var x = $simpleray_$RayTracer.$random.nextDouble() * 10 - 5;
			// Range -5 to 5
			var y = $simpleray_$RayTracer.$random.nextDouble() * 10 - 5;
			// Range -5 to 5
			var z = $simpleray_$RayTracer.$random.nextDouble() * 10;
			// Range 0 to 10
			var c = $System_Color.fromArgb(255, $simpleray_$RayTracer.$random.next(255), $simpleray_$RayTracer.$random.next(255), $simpleray_$RayTracer.$random.next(255));
			var s = new $simpleray_$Sphere(new $simpleray_Vector3f(x, y, z), $simpleray_$RayTracer.$random.nextDouble(), c);
			ss.add($simpleray_$RayTracer.$objects, s);
		}
		//Sphere debugSphere = new Sphere(new Vector3f(0, 0, 5.0f), 0.2f, Color.ForestGreen);
		//objects.Add(debugSphere);
		var floor = new $simpleray_$Plane(new $simpleray_Vector3f(0, 1, 0), -10, $System_Color.get_aquamarine());
		ss.add($simpleray_$RayTracer.$objects, floor);
		// add some lights
		ss.add($simpleray_$RayTracer.$lights, new $simpleray_Light(new $simpleray_Vector3f(2, 0, 0)));
		ss.add($simpleray_$RayTracer.$lights, new $simpleray_Light(new $simpleray_Vector3f(0, 10, 7.5)));
		// calculate width and height of a pixel in world space coords
		$simpleray_$RayTracer.$pixelWidth = ($simpleray_$RayTracer.$screenBottomRightPos.x - $simpleray_$RayTracer.$screenTopLeftPos.x) / 640;
		$simpleray_$RayTracer.$pixelHeight = ($simpleray_$RayTracer.$screenTopLeftPos.y - $simpleray_$RayTracer.$screenBottomRightPos.y) / 480;
		// render it
		var dotPeriod = 48;
		$System_Console.writeLine('Rendering...\n');
		$System_Console.writeLine('|0%---100%|');
		$simpleray_$RayTracer.$renderRow(canvas, dotPeriod, 0);
		// save the pretties
		canvas.save('output.png');
	};
	$simpleray_$RayTracer.$renderRow = function(canvas, dotPeriod, y) {
		if (y >= $simpleray_$RayTracer.$canvaS_HEIGHT) {
			return;
		}
		if (y % dotPeriod === 0) {
			document.getElementById('log').innerHTML += '*';
		}
		$simpleray_$RayTracer.$stopwatch.restart();
		for (var x = 0; x < $simpleray_$RayTracer.$canvaS_WIDTH; x++) {
			var c = $simpleray_$RayTracer.$renderPixel(x, y);
			canvas.setPixel(x, y, c);
		}
		//canvas.Refresh(); // added for make it work with Saltarelle
		var elapsed = $simpleray_$RayTracer.$stopwatch.get_elapsedMilliseconds();
		var msPerPixel = elapsed / 640;
		$simpleray_$RayTracer.$reportSpeed(msPerPixel);
		setTimeout(function() {
			$simpleray_$RayTracer.$renderRow(canvas, dotPeriod, y + 1);
		}, 0);
	};
	$simpleray_$RayTracer.$reportSpeed = function(msPerPixel) {
		$simpleray_$RayTracer.$minSpeed = Math.min(msPerPixel, $simpleray_$RayTracer.$minSpeed);
		$simpleray_$RayTracer.$maxSpeed = Math.max(msPerPixel, $simpleray_$RayTracer.$maxSpeed);
		ss.add($simpleray_$RayTracer.$speedSamples, msPerPixel);
		var average = 0;
		for (var $t1 = 0; $t1 < $simpleray_$RayTracer.$speedSamples.length; $t1++) {
			var d = $simpleray_$RayTracer.$speedSamples[$t1];
			average += d;
		}
		average /= $simpleray_$RayTracer.$speedSamples.length;
		document.getElementById('speed').innerHTML = ss.formatString('min: {0:F3} ms/pixel, max: {1:F3} ms/pixel, avg: {2:F3} ms/pixel', $simpleray_$RayTracer.$minSpeed, $simpleray_$RayTracer.$maxSpeed, average);
	};
	$simpleray_$RayTracer.$checkIntersection = function(ray) {
		for (var $t1 = 0; $t1 < $simpleray_$RayTracer.$objects.length; $t1++) {
			var obj = $simpleray_$RayTracer.$objects[$t1];
			// loop through objects, test for intersection
			var hitDistance = obj.intersect(ray.$);
			// check for intersection with this object and find distance
			if (hitDistance < ray.$.closestHitDistance && hitDistance > 0) {
				ray.$.closestHitObject = obj;
				// object hit and closest yet found - store it
				ray.$.closestHitDistance = hitDistance;
			}
		}
		ray.$.hitPoint = $simpleray_Vector3f.op_Addition(ray.$.origin, $simpleray_Vector3f.op_Multiply(ray.$.direction, ray.$.closestHitDistance));
		// also store the point of intersection 
	};
	$simpleray_$RayTracer.$renderPixel = function(x, y) {
		// First, calculate direction of the current pixel from eye position
		var sx = $simpleray_$RayTracer.$screenTopLeftPos.x + x * $simpleray_$RayTracer.$pixelWidth;
		var sy = $simpleray_$RayTracer.$screenTopLeftPos.y - y * $simpleray_$RayTracer.$pixelHeight;
		var eyeToPixelDir = $simpleray_Vector3f.op_Subtraction(new $simpleray_Vector3f(sx, sy, 0), $simpleray_$RayTracer.$eyePos);
		eyeToPixelDir.normalise();
		// Set up primary (eye) ray
		var ray = new $simpleray_Ray($simpleray_$RayTracer.$eyePos, eyeToPixelDir);
		// And trace it!
		return $simpleray_$RayTracer.$trace(ray, 0);
	};
	$simpleray_$RayTracer.$trace = function(ray, traceDepth) {
		ray = { $: ray };
		// See if the ray intersected an object
		$simpleray_$RayTracer.$checkIntersection(ray);
		if (ray.$.closestHitDistance >= $simpleray_Ray.worlD_MAX || ss.isNullOrUndefined(ray.$.closestHitObject)) {
			return $simpleray_$RayTracer.$bG_COLOR;
		}
		// Got a hit - set initial colour to ambient light
		var r = 0.150000005960464 * ray.$.closestHitObject.color.r;
		var g = 0.150000005960464 * ray.$.closestHitObject.color.g;
		var b = 0.150000005960464 * ray.$.closestHitObject.color.b;
		// Set up stuff we'll need for shading calcs
		var surfaceNormal = ray.$.closestHitObject.getSurfaceNormalAtPoint(ray.$.hitPoint);
		var viewerDir = $simpleray_Vector3f.op_UnaryNegation(ray.$.direction);
		// Direction back to the viewer (simply negative of ray dir)
		// Loop through the lights, adding contribution of each
		for (var $t1 = 0; $t1 < $simpleray_$RayTracer.$lights.length; $t1++) {
			var light = $simpleray_$RayTracer.$lights[$t1];
			var lightDir = new $simpleray_Vector3f(0, 0, 0);
			var lightDistance;
			// Find light direction and distance
			lightDir = $simpleray_Vector3f.op_Subtraction(light.position, ray.$.hitPoint);
			// Get direction to light
			lightDistance = lightDir.magnitude();
			//lightDir = lightDir / lightDistance;                  // Light exponential falloff
			lightDir.normalise();
			// Shadow check: check if this light's visible from the point
			// NB: Step out slightly from the hitpoint first
			var shadowRay = { $: new $simpleray_Ray($simpleray_Vector3f.op_Addition(ray.$.hitPoint, $simpleray_Vector3f.op_Multiply(lightDir, $simpleray_$RayTracer.$TINY)), lightDir) };
			shadowRay.$.closestHitDistance = lightDistance;
			// IMPORTANT: We only want it to trace as far as the light!
			$simpleray_$RayTracer.$checkIntersection(shadowRay);
			if (ss.isValue(shadowRay.$.closestHitObject)) {
				continue;
			}
			var cosLightAngleWithNormal = surfaceNormal.dot(lightDir);
			if (true) {
				// Calculate light's diffuse component - note that this is view independant
				// Dot product of surface normal and light direction gives cos of angle between them so will be in 
				// range -1 to 1. We use that as a scaling factor; common technique, called "cosine shading".
				if (cosLightAngleWithNormal <= 0) {
					continue;
				}
				// Add this light's diffuse contribution to our running totals
				r += $simpleray_$RayTracer.$materiaL_DIFFUSE_COEFFICIENT * cosLightAngleWithNormal * ray.$.closestHitObject.color.r;
				g += $simpleray_$RayTracer.$materiaL_DIFFUSE_COEFFICIENT * cosLightAngleWithNormal * ray.$.closestHitObject.color.g;
				b += $simpleray_$RayTracer.$materiaL_DIFFUSE_COEFFICIENT * cosLightAngleWithNormal * ray.$.closestHitObject.color.b;
			}
			if (true) {
				// Specular component - dot product of light's reflection vector and viewer direction
				// Direction to the viewer is simply negative of the ray direction
				var lightReflectionDir = $simpleray_Vector3f.op_Subtraction($simpleray_Vector3f.op_Multiply(surfaceNormal, cosLightAngleWithNormal * 2), lightDir);
				var specularFactor = viewerDir.dot(lightReflectionDir);
				if (specularFactor > 0) {
					// To get smaller, sharper highlights we raise it to a power and multiply it
					specularFactor = $simpleray_$RayTracer.$materiaL_SPECULAR_COEFFICIENT * Math.pow(specularFactor, 50);
					// Add the specular contribution to our running totals
					r += specularFactor * ray.$.closestHitObject.color.r;
					g += specularFactor * ray.$.closestHitObject.color.g;
					b += specularFactor * ray.$.closestHitObject.color.b;
				}
			}
		}
		// Now do reflection, unless we're too deep
		if (traceDepth < $simpleray_$RayTracer.$maX_DEPTH && true) {
			// Set up the reflected ray - notice we move the origin out a tiny bit again
			var reflectedDir = ray.$.direction.reflectIn(surfaceNormal);
			var reflectionRay = new $simpleray_Ray($simpleray_Vector3f.op_Addition(ray.$.hitPoint, $simpleray_Vector3f.op_Multiply(reflectedDir, $simpleray_$RayTracer.$TINY)), reflectedDir);
			// And trace!
			var reflectionCol = $simpleray_$RayTracer.$trace(reflectionRay, traceDepth + 1);
			// Add reflection results to running totals, scaling by reflect coeff.
			r += $simpleray_$RayTracer.$materiaL_REFLECTION_COEFFICIENT * reflectionCol.r;
			g += $simpleray_$RayTracer.$materiaL_REFLECTION_COEFFICIENT * reflectionCol.g;
			b += $simpleray_$RayTracer.$materiaL_REFLECTION_COEFFICIENT * reflectionCol.b;
		}
		// Clamp RGBs
		if (r > 255) {
			r = 255;
		}
		if (g > 255) {
			g = 255;
		}
		if (b > 255) {
			b = 255;
		}
		return $System_Color.fromArgb(255, ss.Int32.trunc(r), ss.Int32.trunc(g), ss.Int32.trunc(b));
	};
	////////////////////////////////////////////////////////////////////////////////
	// simpleray.Sphere
	var $simpleray_$Sphere = function(p, r, c) {
		this.$position = null;
		this.$radius = 0;
		$simpleray_RTObject.call(this);
		this.$position = p;
		this.$radius = r;
		this.color = c;
	};
	$simpleray_$Sphere.prototype = {
		intersect: function(ray) {
			var lightFromOrigin = $simpleray_Vector3f.op_Subtraction(this.$position, ray.origin);
			// dir from origin to us
			var v = lightFromOrigin.dot(ray.direction);
			// cos of angle between dirs from origin to us and from origin to where the ray's pointing
			var hitDistance = this.$radius * this.$radius + v * v - lightFromOrigin.x * lightFromOrigin.x - lightFromOrigin.y * lightFromOrigin.y - lightFromOrigin.z * lightFromOrigin.z;
			if (hitDistance < 0) {
				return -1;
			}
			hitDistance = v - Math.sqrt(hitDistance);
			// get actual hit distance
			if (hitDistance < 0) {
				return -1;
			}
			else {
				return hitDistance;
			}
		},
		getSurfaceNormalAtPoint: function(p) {
			var normal = $simpleray_Vector3f.op_Subtraction(p, this.$position);
			normal.normalise();
			return normal;
		}
	};
	////////////////////////////////////////////////////////////////////////////////
	// simpleray.Light
	var $simpleray_Light = function(p) {
		this.position = null;
		this.position = p;
	};
	////////////////////////////////////////////////////////////////////////////////
	// simpleray.Ray
	var $simpleray_Ray = function(o, d) {
		this.origin = null;
		this.direction = null;
		this.closestHitObject = null;
		this.closestHitDistance = 0;
		this.hitPoint = null;
		this.origin = o;
		this.direction = d;
		this.closestHitDistance = $simpleray_Ray.worlD_MAX;
		this.closestHitObject = null;
	};
	////////////////////////////////////////////////////////////////////////////////
	// simpleray.RTObject
	var $simpleray_RTObject = function() {
		this.color = null;
	};
	$simpleray_RTObject.prototype = { intersect: null, getSurfaceNormalAtPoint: null };
	////////////////////////////////////////////////////////////////////////////////
	// simpleray.Vector3f
	var $simpleray_Vector3f = function(x, y, z) {
		this.x = 0;
		this.y = 0;
		this.z = 0;
		this.x = x;
		this.y = y;
		this.z = z;
	};
	$simpleray_Vector3f.prototype = {
		dot: function(b) {
			return this.x * b.x + this.y * b.y + this.z * b.z;
		},
		normalise: function() {
			var f = 1 / Math.sqrt(this.dot(this));
			this.x *= f;
			this.y *= f;
			this.z *= f;
		},
		magnitude: function() {
			return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
		},
		reflectIn: function(normal) {
			var negVector = $simpleray_Vector3f.op_UnaryNegation(this);
			var reflectedDir = $simpleray_Vector3f.op_Subtraction($simpleray_Vector3f.op_Multiply(normal, 2 * negVector.dot(normal)), negVector);
			return reflectedDir;
		}
	};
	$simpleray_Vector3f.op_Subtraction = function(a, b) {
		return new $simpleray_Vector3f(a.x - b.x, a.y - b.y, a.z - b.z);
	};
	$simpleray_Vector3f.op_UnaryNegation = function(a) {
		return new $simpleray_Vector3f(-a.x, -a.y, -a.z);
	};
	$simpleray_Vector3f.op_Multiply = function(a, b) {
		return new $simpleray_Vector3f(a.x * b, a.y * b, a.z * b);
	};
	$simpleray_Vector3f.op_Division = function(a, b) {
		return new $simpleray_Vector3f(a.x / b, a.y / b, a.z / b);
	};
	$simpleray_Vector3f.op_Addition = function(a, b) {
		return new $simpleray_Vector3f(a.x + b.x, a.y + b.y, a.z + b.z);
	};
	////////////////////////////////////////////////////////////////////////////////
	// System.Color
	var $System_Color = function(a, r, g, b) {
		this.r = 0;
		this.g = 0;
		this.b = 0;
		this.a = 0;
		this.a = a;
		this.r = r;
		this.g = g;
		this.b = b;
	};
	$System_Color.get_blueViolet = function() {
		return new $System_Color(255, 138, 43, 226);
		// #FF8A2BE2
	};
	$System_Color.get_aquamarine = function() {
		return new $System_Color(255, 127, 255, 212);
		// #FF7FFFD4
	};
	$System_Color.fromArgb = function(a, r, g, b) {
		return new $System_Color(a, r, g, b);
	};
	////////////////////////////////////////////////////////////////////////////////
	// System.Console
	var $System_Console = function() {
	};
	$System_Console.writeLine = function(msg) {
		document.getElementById('log').innerHTML += msg + '<br>';
	};
	////////////////////////////////////////////////////////////////////////////////
	// System.Random
	var $System_Random = function(seed) {
		this.$mt = null;
		this.$mt = new MersenneTwister(seed);
	};
	$System_Random.prototype = {
		nextDouble: function() {
			return this.$mt.genrand_real1();
		},
		next: function(maxValue) {
			var real = this.$mt.genrand_real1();
			return Math.floor(real * maxValue);
		}
	};
	////////////////////////////////////////////////////////////////////////////////
	// System.Stopwatch
	var $System_Stopwatch = function() {
		this.$start_time = 0;
	};
	$System_Stopwatch.prototype = {
		restart: function() {
			this.$start_time = (new Date()).getTime();
		},
		get_elapsedMilliseconds: function() {
			return (new Date()).getTime() - this.$start_time;
		}
	};
	////////////////////////////////////////////////////////////////////////////////
	// System.Drawing.Bitmap
	var $System_Drawing_Bitmap = function(w, h) {
		this.$width = 0;
		this.$height = 0;
		this.$canvas = null;
		this.$context = null;
		this.$imagedata = null;
		this.$width = w;
		this.$height = h;
		this.$canvas = document.getElementById('canvas');
		this.$context = this.$canvas.getContext('2d');
		// "2d"    
		this.$context.globalCompositeOperation = 'copy';
		this.$imagedata = this.$context.createImageData(w, 1);
		// w,h
	};
	$System_Drawing_Bitmap.prototype = {
		setPixel: function(x, y, c) {
			var index = x * 4;
			this.$imagedata.data[index + 0] = c.r;
			this.$imagedata.data[index + 1] = c.g;
			this.$imagedata.data[index + 2] = c.b;
			this.$imagedata.data[index + 3] = c.a;
			//context.PutImageData(imagedata, x, y); 
			if (x === this.$width - 1) {
				this.$context.putImageData(this.$imagedata, 0, y);
			}
		},
		save: function(filename) {
			// ignored
		}
	};
	ss.registerClass(global, 'simpleray.RTObject', $simpleray_RTObject);
	ss.registerClass(null, 'simpleray.$Plane', $simpleray_$Plane, $simpleray_RTObject);
	ss.registerClass(null, 'simpleray.$RayTracer', $simpleray_$RayTracer);
	ss.registerClass(null, 'simpleray.$Sphere', $simpleray_$Sphere, $simpleray_RTObject);
	ss.registerClass(global, 'simpleray.Light', $simpleray_Light);
	ss.registerClass(global, 'simpleray.Ray', $simpleray_Ray);
	ss.registerClass(global, 'simpleray.Vector3f', $simpleray_Vector3f);
	ss.registerClass(global, 'System.Color', $System_Color);
	ss.registerClass(global, 'System.Console', $System_Console);
	ss.registerClass(global, 'System.Random', $System_Random);
	ss.registerClass(global, 'System.Stopwatch', $System_Stopwatch);
	ss.registerClass(global, 'System.Drawing.Bitmap', $System_Drawing_Bitmap);
	$simpleray_Ray.worlD_MAX = 1000;
	$simpleray_$RayTracer.$PI = 3.14159274101257;
	$simpleray_$RayTracer.$pI_X_2 = 6.28318548202515;
	$simpleray_$RayTracer.$pI_OVER_2 = 1.57079637050629;
	$simpleray_$RayTracer.$canvaS_WIDTH = 640;
	$simpleray_$RayTracer.$canvaS_HEIGHT = 480;
	$simpleray_$RayTracer.$TINY = 9.99999974737875E-05;
	$simpleray_$RayTracer.$maX_DEPTH = 3;
	$simpleray_$RayTracer.$materiaL_DIFFUSE_COEFFICIENT = 0.5;
	$simpleray_$RayTracer.$materiaL_REFLECTION_COEFFICIENT = 0.5;
	$simpleray_$RayTracer.$materiaL_SPECULAR_COEFFICIENT = 2;
	$simpleray_$RayTracer.$materiaL_SPECULAR_POWER = 50;
	$simpleray_$RayTracer.$bG_COLOR = $System_Color.get_blueViolet();
	$simpleray_$RayTracer.$eyePos = new $simpleray_Vector3f(0, 0, -5);
	$simpleray_$RayTracer.$screenTopLeftPos = new $simpleray_Vector3f(-6, 4, 0);
	$simpleray_$RayTracer.$screenBottomRightPos = new $simpleray_Vector3f(6, -4, 0);
	$simpleray_$RayTracer.$pixelWidth = 0;
	$simpleray_$RayTracer.$pixelHeight = 0;
	$simpleray_$RayTracer.$objects = null;
	$simpleray_$RayTracer.$lights = null;
	$simpleray_$RayTracer.$random = null;
	$simpleray_$RayTracer.$stopwatch = null;
	$simpleray_$RayTracer.$minSpeed = Number.MAX_VALUE;
	$simpleray_$RayTracer.$maxSpeed = Number.MIN_VALUE;
	$simpleray_$RayTracer.$speedSamples = null;
	$simpleray_$RayTracer.$main();
})();
