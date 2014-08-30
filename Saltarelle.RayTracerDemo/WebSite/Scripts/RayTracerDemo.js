(function() {
	'use strict';
	var $asm = {};
	ss.initAssembly($asm, 'RayTracerDemo');
	////////////////////////////////////////////////////////////////////////////////
	// simpleray.Plane
	var $$Plane = function(n, d, c) {
		this.$normal = null;
		this.$distance = 0;
		$RTObject.call(this);
		this.$normal = n;
		this.$distance = d;
		this.color = c;
	};
	$$Plane.__typeName = '$Plane';
	////////////////////////////////////////////////////////////////////////////////
	// simpleray.RayTracer
	var $$RayTracer = function() {
	};
	$$RayTracer.__typeName = '$RayTracer';
	$$RayTracer.$main = function() {
		// init structures
		$$RayTracer.$objects = [];
		$$RayTracer.$lights = [];
		$$RayTracer.$random = new $Random(1478650229);
		$$RayTracer.$stopwatch = new ss.Stopwatch();
		$$RayTracer.$speedSamples = [];
		$$RayTracer.$checkNumber = 0;
		var canvas = new $Bitmap($$RayTracer.$canvaS_WIDTH, $$RayTracer.$canvaS_HEIGHT);
		// add some objects
		// in the original test it was 30 and not 300
		for (var i = 0; i < 300; i++) {
			var x = $$RayTracer.$random.nextDouble() * 10 - 5;
			// Range -5 to 5
			var y = $$RayTracer.$random.nextDouble() * 10 - 5;
			// Range -5 to 5
			var z = $$RayTracer.$random.nextDouble() * 10;
			// Range 0 to 10
			var c = $Color.fromArgb(255, $$RayTracer.$random.next(255), $$RayTracer.$random.next(255), $$RayTracer.$random.next(255));
			var s = new $$Sphere(new $Vector3f(x, y, z), $$RayTracer.$random.nextDouble(), c);
			ss.add($$RayTracer.$objects, s);
		}
		//Sphere debugSphere = new Sphere(new Vector3f(0, 0, 5.0f), 0.2f, Color.ForestGreen);
		//objects.Add(debugSphere);
		var floor = new $$Plane(new $Vector3f(0, 1, 0), -10, $Color.get_aquamarine());
		ss.add($$RayTracer.$objects, floor);
		// add some lights
		ss.add($$RayTracer.$lights, new $Light(new $Vector3f(2, 0, 0)));
		ss.add($$RayTracer.$lights, new $Light(new $Vector3f(0, 10, 7.5)));
		// calculate width and height of a pixel in world space coords
		$$RayTracer.$pixelWidth = ($$RayTracer.$screenBottomRightPos.x - $$RayTracer.$screenTopLeftPos.x) / 640;
		$$RayTracer.$pixelHeight = ($$RayTracer.$screenTopLeftPos.y - $$RayTracer.$screenBottomRightPos.y) / 480;
		// render it
		var dotPeriod = 48;
		$Console.writeLine('Rendering...\n');
		$Console.writeLine('|0%---100%|');
		$$RayTracer.$renderRow(canvas, dotPeriod, 0);
	};
	$$RayTracer.$renderRow = function(canvas, dotPeriod, y) {
		if (y >= $$RayTracer.$canvaS_HEIGHT) {
			// checksum control
			$Console.writeLine('');
			if ($$RayTracer.$checkNumber === 107521263) {
				$Console.writeLine('checksum ok');
			}
			else {
				$Console.writeLine('checksum error');
			}
			return;
		}
		if (y % dotPeriod === 0) {
			document.getElementById('log').innerHTML += '*';
		}
		$$RayTracer.$stopwatch.restart();
		for (var x = 0; x < $$RayTracer.$canvaS_WIDTH; x++) {
			var c = $$RayTracer.$renderPixel(x, y);
			canvas.setPixel(x, y, c);
			$$RayTracer.$checkNumber += c.r + c.g + c.b;
		}
		//canvas.Refresh(); // added for make it work with Saltarelle
		var elapsed = $$RayTracer.$stopwatch.milliseconds();
		var msPerPixel = elapsed / 640;
		$$RayTracer.$totalTime += elapsed;
		$$RayTracer.$reportSpeed(msPerPixel);
		setTimeout(function() {
			$$RayTracer.$renderRow(canvas, dotPeriod, y + 1);
		}, 0);
	};
	$$RayTracer.$reportSpeed = function(msPerPixel) {
		$$RayTracer.$minSpeed = Math.min(msPerPixel, $$RayTracer.$minSpeed);
		$$RayTracer.$maxSpeed = Math.max(msPerPixel, $$RayTracer.$maxSpeed);
		ss.add($$RayTracer.$speedSamples, msPerPixel);
		var average = 0;
		for (var $t1 = 0; $t1 < $$RayTracer.$speedSamples.length; $t1++) {
			var d = $$RayTracer.$speedSamples[$t1];
			average += d;
		}
		average /= $$RayTracer.$speedSamples.length;
		document.getElementById('speed').innerHTML = ss.formatString('min: {0} ms/pixel, max: {1} ms/pixel, avg: {2} ms/pixel, total: {3} ms', $$RayTracer.$minSpeed, $$RayTracer.$maxSpeed, average, $$RayTracer.$totalTime);
	};
	$$RayTracer.$checkIntersection = function(ray) {
		for (var $t1 = 0; $t1 < $$RayTracer.$objects.length; $t1++) {
			var obj = $$RayTracer.$objects[$t1];
			// loop through objects, test for intersection
			var hitDistance = obj.intersect(ray);
			// check for intersection with this object and find distance
			if (hitDistance < ray.closestHitDistance && hitDistance > 0) {
				ray.closestHitObject = obj;
				// object hit and closest yet found - store it
				ray.closestHitDistance = hitDistance;
			}
		}
		ray.hitPoint = $Vector3f.op_Addition(ray.origin, $Vector3f.op_Multiply(ray.direction, ray.closestHitDistance));
		// also store the point of intersection 
	};
	$$RayTracer.$renderPixel = function(x, y) {
		// First, calculate direction of the current pixel from eye position
		var sx = $$RayTracer.$screenTopLeftPos.x + x * $$RayTracer.$pixelWidth;
		var sy = $$RayTracer.$screenTopLeftPos.y - y * $$RayTracer.$pixelHeight;
		var eyeToPixelDir = $Vector3f.op_Subtraction(new $Vector3f(sx, sy, 0), $$RayTracer.$eyePos);
		eyeToPixelDir.normalise();
		// Set up primary (eye) ray
		var ray = new $Ray($$RayTracer.$eyePos, eyeToPixelDir);
		// And trace it!
		return $$RayTracer.$trace(ray, 0);
	};
	$$RayTracer.$trace = function(ray, traceDepth) {
		// See if the ray intersected an object
		$$RayTracer.$checkIntersection(ray);
		if (ray.closestHitDistance >= $Ray.worlD_MAX || ss.isNullOrUndefined(ray.closestHitObject)) {
			return $$RayTracer.$bG_COLOR;
		}
		// Got a hit - set initial colour to ambient light
		var r = 0.150000005960464 * ray.closestHitObject.color.r;
		var g = 0.150000005960464 * ray.closestHitObject.color.g;
		var b = 0.150000005960464 * ray.closestHitObject.color.b;
		// Set up stuff we'll need for shading calcs
		var surfaceNormal = ray.closestHitObject.getSurfaceNormalAtPoint(ray.hitPoint);
		var viewerDir = $Vector3f.op_UnaryNegation(ray.direction);
		// Direction back to the viewer (simply negative of ray dir)
		// Loop through the lights, adding contribution of each
		for (var $t1 = 0; $t1 < $$RayTracer.$lights.length; $t1++) {
			var light = $$RayTracer.$lights[$t1];
			var lightDir = new $Vector3f(0, 0, 0);
			var lightDistance;
			// Find light direction and distance
			lightDir = $Vector3f.op_Subtraction(light.position, ray.hitPoint);
			// Get direction to light
			lightDistance = lightDir.magnitude();
			//lightDir = lightDir / lightDistance;                  // Light exponential falloff
			lightDir.normalise();
			// Shadow check: check if this light's visible from the point
			// NB: Step out slightly from the hitpoint first
			var shadowRay = new $Ray($Vector3f.op_Addition(ray.hitPoint, $Vector3f.op_Multiply(lightDir, $$RayTracer.$TINY)), lightDir);
			shadowRay.closestHitDistance = lightDistance;
			// IMPORTANT: We only want it to trace as far as the light!
			$$RayTracer.$checkIntersection(shadowRay);
			if (ss.isValue(shadowRay.closestHitObject)) {
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
				r += $$RayTracer.$materiaL_DIFFUSE_COEFFICIENT * cosLightAngleWithNormal * ray.closestHitObject.color.r;
				g += $$RayTracer.$materiaL_DIFFUSE_COEFFICIENT * cosLightAngleWithNormal * ray.closestHitObject.color.g;
				b += $$RayTracer.$materiaL_DIFFUSE_COEFFICIENT * cosLightAngleWithNormal * ray.closestHitObject.color.b;
			}
			if (true) {
				// Specular component - dot product of light's reflection vector and viewer direction
				// Direction to the viewer is simply negative of the ray direction
				var lightReflectionDir = $Vector3f.op_Subtraction($Vector3f.op_Multiply(surfaceNormal, cosLightAngleWithNormal * 2), lightDir);
				var specularFactor = viewerDir.dot(lightReflectionDir);
				if (specularFactor > 0) {
					// To get smaller, sharper highlights we raise it to a power and multiply it
					specularFactor = $$RayTracer.$materiaL_SPECULAR_COEFFICIENT * Math.pow(specularFactor, 50);
					// Add the specular contribution to our running totals
					r += specularFactor * ray.closestHitObject.color.r;
					g += specularFactor * ray.closestHitObject.color.g;
					b += specularFactor * ray.closestHitObject.color.b;
				}
			}
		}
		// Now do reflection, unless we're too deep
		if (traceDepth < $$RayTracer.$maX_DEPTH && true) {
			// Set up the reflected ray - notice we move the origin out a tiny bit again
			var reflectedDir = ray.direction.reflectIn(surfaceNormal);
			var reflectionRay = new $Ray($Vector3f.op_Addition(ray.hitPoint, $Vector3f.op_Multiply(reflectedDir, $$RayTracer.$TINY)), reflectedDir);
			// And trace!
			var reflectionCol = $$RayTracer.$trace(reflectionRay, traceDepth + 1);
			// Add reflection results to running totals, scaling by reflect coeff.
			r += $$RayTracer.$materiaL_REFLECTION_COEFFICIENT * reflectionCol.r;
			g += $$RayTracer.$materiaL_REFLECTION_COEFFICIENT * reflectionCol.g;
			b += $$RayTracer.$materiaL_REFLECTION_COEFFICIENT * reflectionCol.b;
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
		return $Color.fromArgb(255, ss.Int32.trunc(r), ss.Int32.trunc(g), ss.Int32.trunc(b));
	};
	////////////////////////////////////////////////////////////////////////////////
	// simpleray.Sphere
	var $$Sphere = function(p, r, c) {
		this.$position = null;
		this.$radius = 0;
		$RTObject.call(this);
		this.$position = p;
		this.$radius = r;
		this.color = c;
	};
	$$Sphere.__typeName = '$Sphere';
	////////////////////////////////////////////////////////////////////////////////
	// System.Drawing.Bitmap
	var $Bitmap = function(w, h) {
		this.$width = 0;
		this.$height = 0;
		this.$canvas = null;
		this.$context = null;
		this.$imagedata = null;
		this.$width = w;
		this.$height = h;
		var $t1 = document.getElementById('canvas');
		this.$canvas = ss.cast($t1, ss.isValue($t1) && (ss.isInstanceOfType($t1, Element) && $t1.tagName === 'CANVAS'));
		this.$context = ss.cast(this.$canvas.getContext('2d'), CanvasRenderingContext2D);
		// "2d"    
		this.$context.globalCompositeOperation = 'copy';
		// ### it was: CompositeOperation         
		this.$imagedata = this.$context.createImageData(w, 1);
		// w,h
	};
	$Bitmap.__typeName = 'Bitmap';
	global.Bitmap = $Bitmap;
	////////////////////////////////////////////////////////////////////////////////
	// System.Color
	var $Color = function(a, r, g, b) {
		this.r = 0;
		this.g = 0;
		this.b = 0;
		this.a = 0;
		this.a = a;
		this.r = r;
		this.g = g;
		this.b = b;
	};
	$Color.__typeName = 'Color';
	$Color.get_blueViolet = function() {
		return new $Color(255, 138, 43, 226);
		// #FF8A2BE2
	};
	$Color.get_aquamarine = function() {
		return new $Color(255, 127, 255, 212);
		// #FF7FFFD4
	};
	$Color.fromArgb = function(a, r, g, b) {
		return new $Color(a, r, g, b);
	};
	global.Color = $Color;
	////////////////////////////////////////////////////////////////////////////////
	// Missing.Console
	var $Console = function() {
	};
	$Console.__typeName = 'Console';
	$Console.writeLine = function(msg) {
		document.getElementById('log').innerHTML += msg + '<br>';
	};
	global.Console = $Console;
	////////////////////////////////////////////////////////////////////////////////
	// simpleray.Light
	var $Light = function(p) {
		this.position = null;
		this.position = p;
	};
	$Light.__typeName = 'Light';
	global.Light = $Light;
	////////////////////////////////////////////////////////////////////////////////
	// Missing.Random
	var $Random = function(seed) {
		this.$mt = null;
		this.$mt = new MersenneTwister(seed);
	};
	$Random.__typeName = 'Random';
	global.Random = $Random;
	////////////////////////////////////////////////////////////////////////////////
	// simpleray.Ray
	var $Ray = function(o, d) {
		this.origin = null;
		this.direction = null;
		this.closestHitObject = null;
		this.closestHitDistance = 0;
		this.hitPoint = null;
		this.origin = o;
		this.direction = d;
		this.closestHitDistance = $Ray.worlD_MAX;
		this.closestHitObject = null;
	};
	$Ray.__typeName = 'Ray';
	global.Ray = $Ray;
	////////////////////////////////////////////////////////////////////////////////
	// simpleray.RTObject
	var $RTObject = function() {
		this.color = null;
	};
	$RTObject.__typeName = 'RTObject';
	global.RTObject = $RTObject;
	////////////////////////////////////////////////////////////////////////////////
	// Missing.Stopwatch
	var $Stopwatch = function() {
		this.$start_time = 0;
	};
	$Stopwatch.__typeName = 'Stopwatch';
	global.Stopwatch = $Stopwatch;
	////////////////////////////////////////////////////////////////////////////////
	// simpleray.Vector3f
	var $Vector3f = function(x, y, z) {
		this.x = 0;
		this.y = 0;
		this.z = 0;
		this.x = x;
		this.y = y;
		this.z = z;
	};
	$Vector3f.__typeName = 'Vector3f';
	$Vector3f.op_Subtraction = function(a, b) {
		return new $Vector3f(a.x - b.x, a.y - b.y, a.z - b.z);
	};
	$Vector3f.op_UnaryNegation = function(a) {
		return new $Vector3f(-a.x, -a.y, -a.z);
	};
	$Vector3f.op_Multiply = function(a, b) {
		return new $Vector3f(a.x * b, a.y * b, a.z * b);
	};
	$Vector3f.op_Division = function(a, b) {
		return new $Vector3f(a.x / b, a.y / b, a.z / b);
	};
	$Vector3f.op_Addition = function(a, b) {
		return new $Vector3f(a.x + b.x, a.y + b.y, a.z + b.z);
	};
	global.Vector3f = $Vector3f;
	ss.initClass($RTObject, $asm, { intersect: null, getSurfaceNormalAtPoint: null });
	ss.initClass($$Plane, $asm, {
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
	}, $RTObject);
	ss.initClass($$RayTracer, $asm, {});
	ss.initClass($$Sphere, $asm, {
		intersect: function(ray) {
			var lightFromOrigin = $Vector3f.op_Subtraction(this.$position, ray.origin);
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
			var normal = $Vector3f.op_Subtraction(p, this.$position);
			normal.normalise();
			return normal;
		}
	}, $RTObject);
	ss.initClass($Bitmap, $asm, {
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
	});
	ss.initClass($Color, $asm, {});
	ss.initClass($Console, $asm, {});
	ss.initClass($Light, $asm, {});
	ss.initClass($Random, $asm, {
		nextDouble: function() {
			return this.$mt.genrand_real1();
		},
		next: function(maxValue) {
			var real = this.$mt.genrand_real1();
			return Math.floor(real * maxValue);
		}
	});
	ss.initClass($Ray, $asm, {});
	ss.initClass($Stopwatch, $asm, {
		restart: function() {
			this.$start_time = (new Date()).getTime();
		},
		get_elapsedMilliseconds: function() {
			return (new Date()).getTime() - this.$start_time;
		}
	});
	ss.initClass($Vector3f, $asm, {
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
			var negVector = $Vector3f.op_UnaryNegation(this);
			var reflectedDir = $Vector3f.op_Subtraction($Vector3f.op_Multiply(normal, 2 * negVector.dot(normal)), negVector);
			return reflectedDir;
		}
	});
	$Ray.worlD_MAX = 1000;
	$$RayTracer.$PI = 3.14159274101257;
	$$RayTracer.$pI_X_2 = 6.28318548202515;
	$$RayTracer.$pI_OVER_2 = 1.57079637050629;
	$$RayTracer.$canvaS_WIDTH = 640;
	$$RayTracer.$canvaS_HEIGHT = 480;
	$$RayTracer.$TINY = 9.99999974737875E-05;
	$$RayTracer.$maX_DEPTH = 3;
	$$RayTracer.$materiaL_DIFFUSE_COEFFICIENT = 0.5;
	$$RayTracer.$materiaL_REFLECTION_COEFFICIENT = 0.5;
	$$RayTracer.$materiaL_SPECULAR_COEFFICIENT = 2;
	$$RayTracer.$materiaL_SPECULAR_POWER = 50;
	$$RayTracer.$bG_COLOR = $Color.get_blueViolet();
	$$RayTracer.$eyePos = new $Vector3f(0, 0, -5);
	$$RayTracer.$screenTopLeftPos = new $Vector3f(-6, 4, 0);
	$$RayTracer.$screenBottomRightPos = new $Vector3f(6, -4, 0);
	$$RayTracer.$pixelWidth = 0;
	$$RayTracer.$pixelHeight = 0;
	$$RayTracer.$objects = null;
	$$RayTracer.$lights = null;
	$$RayTracer.$random = null;
	$$RayTracer.$stopwatch = null;
	$$RayTracer.$minSpeed = Number.MAX_VALUE;
	$$RayTracer.$maxSpeed = -Number.MAX_VALUE;
	$$RayTracer.$totalTime = 0;
	$$RayTracer.$speedSamples = null;
	$$RayTracer.$checkNumber = 0;
	$$RayTracer.$main();
})();
