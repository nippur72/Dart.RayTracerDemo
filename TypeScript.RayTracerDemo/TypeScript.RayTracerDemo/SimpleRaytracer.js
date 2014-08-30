// Based on http://www.coldcity.com/index.php/simple-csharp-raytracer/
// Original license comment follows
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/*
* simpleray
* A simple raytracer for teaching purposes
*
* IainC, 2009
* License: Do WTF you want
*
* World coord system:
*  Origin (0,0,0) is the center of the screen
*  X increases towards right of screen
*  Y increases towards top of screen
*  Z increases into screen
*
* Enough vector maths to get you through:
*  - The dot product of two vectors gives the cosine of the angle between them
*  - Normalisation is scaling a vector to have magnitude 1: makes it a "unit vector"
*  - To get a unit direction vector from point A to point B, do B-A and normalise the result
*  - To move n units along a direction vector from an origin, new position = origin + (direction * n)
*  - To reflect a vector in a surface with a known surface normal:
*          negativeVec = -vecToReflect;
*          reflectedVec = normal * (2.0f * negativeVec.Dot(normal)) - negativeVec;
*/
var Vector3f = (function () {
    function Vector3f(x /*= 0*/ , y /*= 0*/ , z /*= 0*/ ) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    Vector3f.prototype.Dot = function (b) {
        return (this.x * b.x + this.y * b.y + this.z * b.z);
    };

    Vector3f.prototype.Normalise = function () {
        var f = (1.0 / Math.sqrt(this.Dot(this)));

        this.x *= f;
        this.y *= f;
        this.z *= f;
    };

    Vector3f.prototype.Magnitude = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    };

    Vector3f.operator_sub = function (a, b) {
        return new Vector3f(a.x - b.x, a.y - b.y, a.z - b.z);
    };

    Vector3f.operator_sub_unary = function (a) {
        return new Vector3f(-a.x, -a.y, -a.z);
    };

    Vector3f.operator_mul = function (a, b) {
        return new Vector3f(a.x * b, a.y * b, a.z * b);
    };

    Vector3f.operator_div = function (a, b) {
        return new Vector3f(a.x / b, a.y / b, a.z / b);
    };

    Vector3f.operator_sum = function (a, b) {
        return new Vector3f(a.x + b.x, a.y + b.y, a.z + b.z);
    };

    Vector3f.prototype.ReflectIn = function (normal) {
        var negVector = Vector3f.operator_sub_unary(this);
        var reflectedDir = Vector3f.operator_sub(Vector3f.operator_mul(normal, (2.0 * negVector.Dot(normal))), negVector);
        return reflectedDir;
    };
    return Vector3f;
})();

var Light = (function () {
    function Light(p) {
        this.position = p;
    }
    return Light;
})();

var Ray = (function () {
    function Ray(o, d) {
        this.origin = o;
        this.direction = d;
        this.closestHitDistance = Ray.WORLD_MAX;
        this.closestHitObject = null;
    }
    Ray.WORLD_MAX = 1000.0;
    return Ray;
})();

var RTObject = (function () {
    function RTObject() {
    }
    RTObject.prototype.Intersect = function (ray) {
        return 0;
    };
    RTObject.prototype.GetSurfaceNormalAtPoint = function (p) {
        return null;
    };
    return RTObject;
})();

var Sphere = (function (_super) {
    __extends(Sphere, _super);
    function Sphere(p, r, c) {
        _super.call(this);
        this.position = p;
        this.radius = r;
        this.color = c;
    }
    Sphere.prototype.Intersect = function (ray) {
        var lightFromOrigin = Vector3f.operator_sub(this.position, ray.origin);
        var v = lightFromOrigin.Dot(ray.direction);

        var hitDistance = this.radius * this.radius + v * v - lightFromOrigin.x * lightFromOrigin.x - lightFromOrigin.y * lightFromOrigin.y - lightFromOrigin.z * lightFromOrigin.z;

        if (hitDistance < 0)
            return -1;

        hitDistance = v - Math.sqrt(hitDistance); // get actual hit distance

        if (hitDistance < 0)
            return -1;
        else
            return hitDistance;
    };

    Sphere.prototype.GetSurfaceNormalAtPoint = function (p) {
        var normal = Vector3f.operator_sub(p, this.position);
        normal.Normalise();
        return normal;
    };
    return Sphere;
})(RTObject);

var Plane = (function (_super) {
    __extends(Plane, _super);
    function Plane(n, d, c) {
        _super.call(this);
        this.normal = n;
        this.distance = d;
        this.color = c;
    }
    Plane.prototype.Intersect = function (ray) {
        var normalDotRayDir = this.normal.Dot(ray.direction);
        if (normalDotRayDir == 0)
            return -1;

        // Any none-parallel ray will hit the plane at some point - the question now is just
        // if it in the positive or negative ray direction.
        var hitDistance = -(this.normal.Dot(ray.origin) - this.distance) / normalDotRayDir;

        if (hitDistance < 0)
            return -1;
        else
            return hitDistance;
    };

    Plane.prototype.GetSurfaceNormalAtPoint = function (p) {
        return this.normal;
    };
    return Plane;
})(RTObject);

var RayTracer = (function () {
    function RayTracer() {
    }
    //static void Main(string[] args) {
    RayTracer.Main = function () {
        // init structures
        this.objects = new Array();
        this.lights = new Array();
        this.random = new Random(1478650229); // new Random(01478650229);
        this.stopwatch = new Stopwatch();
        this.speedSamples = new Array();
        this.checkNumber = 0;
        var canvas = new Bitmap(RayTracer.CANVAS_WIDTH, RayTracer.CANVAS_HEIGHT);

        for (var i = 0; i < 300; i++) {
            var x = (this.random.NextDouble() * 10.0) - 5.0;
            var y = (this.random.NextDouble() * 10.0) - 5.0;
            var z = (this.random.NextDouble() * 10.0);
            var c = Color.FromArgb(255, this.random.Next(255), this.random.Next(255), this.random.Next(255));
            var s = new Sphere(new Vector3f(x, y, z), (this.random.NextDouble()), c);
            this.objects.push(s);
        }

        //Sphere debugSphere = new Sphere(new Vector3f(0, 0, 5.0f), 0.2f, Color.ForestGreen);
        //objects.Add(debugSphere);
        var floor = new Plane(new Vector3f(0, 1.0, 0), -10.0, Color.Aquamarine);
        this.objects.push(floor);

        // add some lights
        this.lights.push(new Light(new Vector3f(2.0, 0.0, 0)));
        this.lights.push(new Light(new Vector3f(0, 10.0, 7.5)));

        // calculate width and height of a pixel in world space coords
        this.pixelWidth = (this.screenBottomRightPos.x - this.screenTopLeftPos.x) / RayTracer.CANVAS_WIDTH;
        this.pixelHeight = (this.screenTopLeftPos.y - this.screenBottomRightPos.y) / RayTracer.CANVAS_HEIGHT;

        // render it
        var dotPeriod = RayTracer.CANVAS_HEIGHT / 10;
        MyConsole.WriteLine("Rendering...\n");
        MyConsole.WriteLine("|0%---100%|");

        this.RenderRow(canvas, dotPeriod, 0);
    };

    RayTracer.RenderRow = function (canvas, dotPeriod, y) {
        var _this = this;
        if (y >= RayTracer.CANVAS_HEIGHT) {
            // checksum control
            MyConsole.WriteLine("");
            if (this.checkNumber == 107521263)
                MyConsole.WriteLine("checksum ok");
            else
                MyConsole.WriteLine("checksum error");
            return;
        }

        if ((y % dotPeriod) == 0)
            MyConsole.Write("*");

        this.stopwatch.Restart();
        for (var x = 0; x < RayTracer.CANVAS_WIDTH; x++) {
            var c = this.RenderPixel(x, y);
            canvas.SetPixel(x, y, c);
            this.checkNumber += c.R + c.G + c.B;
        }

        //canvas.Refresh(); // added for make it work with Saltarelle
        var elapsed = this.stopwatch.ElapsedMilliseconds();
        var msPerPixel = elapsed / RayTracer.CANVAS_WIDTH;
        this.totalTime += elapsed;

        this.ReportSpeed(msPerPixel);

        setTimeout(function () {
            return _this.RenderRow(canvas, dotPeriod, y + 1);
        }, 0);
    };

    RayTracer.ReportSpeed = function (msPerPixel) {
        var minSpeed = Math.min(msPerPixel, minSpeed);
        var maxSpeed = Math.max(msPerPixel, maxSpeed);
        this.speedSamples.push(msPerPixel);

        var average = 0;
        for (var i = 0; i < this.speedSamples.length; i++) {
            var d = this.speedSamples[i];
            average += d;
        }
        average /= this.speedSamples.length;

        this.WriteSpeedText("min: " + minSpeed + " ms/pixel, max: " + maxSpeed + " ms/pixel, avg: " + average + " ms/pixel, total: " + this.totalTime + " ms");
    };

    RayTracer.WriteSpeedText = function (text) {
        document.getElementById('speed').innerHTML = text;
    };

    // Given a ray with origin and direction set, fill in the intersection info
    RayTracer.CheckIntersection = function (/*ref*/ ray) {
        for (var i = 0; i < this.objects.length; i++) {
            var obj = this.objects[i];
            var hitDistance = obj.Intersect(ray);
            if (hitDistance < ray.closestHitDistance && hitDistance > 0) {
                ray.closestHitObject = obj; // object hit and closest yet found - store it
                ray.closestHitDistance = hitDistance;
            }
        }

        ray.hitPoint = Vector3f.operator_sum(ray.origin, Vector3f.operator_mul(ray.direction, ray.closestHitDistance)); // also store the point of intersection
    };

    // raytrace a pixel (ie, set pixel color to result of a trace of a ray starting from eye position and
    // passing through the world coords of the pixel)
    RayTracer.RenderPixel = function (x, y) {
        // First, calculate direction of the current pixel from eye position
        var sx = this.screenTopLeftPos.x + (x * this.pixelWidth);
        var sy = this.screenTopLeftPos.y - (y * this.pixelHeight);
        var eyeToPixelDir = Vector3f.operator_sub(new Vector3f(sx, sy, 0), this.eyePos);
        eyeToPixelDir.Normalise();

        // Set up primary (eye) ray
        var ray = new Ray(this.eyePos, eyeToPixelDir);

        // And trace it!
        return this.Trace(ray, 0);
    };

    // given a ray, trace it into the scene and return the colour of the surface it hits
    // (handles reflections recursively)
    RayTracer.Trace = function (ray, traceDepth) {
        // See if the ray intersected an object
        this.CheckIntersection(ray);
        if (ray.closestHitDistance >= Ray.WORLD_MAX || ray.closestHitObject == null)
            return this.BG_COLOR;

        // Got a hit - set initial colour to ambient light
        var r = 0.15 * ray.closestHitObject.color.R;
        var g = 0.15 * ray.closestHitObject.color.G;
        var b = 0.15 * ray.closestHitObject.color.B;

        // Set up stuff we'll need for shading calcs
        var surfaceNormal = ray.closestHitObject.GetSurfaceNormalAtPoint(ray.hitPoint);
        var viewerDir = Vector3f.operator_sub_unary(ray.direction);

        for (var i = 0; i < this.lights.length; i++) {
            var light = this.lights[i];
            var lightDir = new Vector3f(0, 0, 0);
            var lightDistance;

            // Find light direction and distance
            lightDir = Vector3f.operator_sub(light.position, ray.hitPoint); // Get direction to light
            lightDistance = lightDir.Magnitude();

            //lightDir = lightDir / lightDistance;                  // Light exponential falloff
            lightDir.Normalise();

            // Shadow check: check if this light's visible from the point
            // NB: Step out slightly from the hitpoint first
            var shadowRay = new Ray(Vector3f.operator_sum(ray.hitPoint, Vector3f.operator_mul(lightDir, this.TINY)), lightDir);
            shadowRay.closestHitDistance = lightDistance; // IMPORTANT: We only want it to trace as far as the light!
            this.CheckIntersection(shadowRay);
            if (shadowRay.closestHitObject != null)
                continue;

            var cosLightAngleWithNormal = surfaceNormal.Dot(lightDir);

            if (this.MATERIAL_DIFFUSE_COEFFICIENT > this.TINY) {
                // Calculate light's diffuse component - note that this is view independant
                // Dot product of surface normal and light direction gives cos of angle between them so will be in
                // range -1 to 1. We use that as a scaling factor; common technique, called "cosine shading".
                if (cosLightAngleWithNormal <= 0)
                    continue;

                // Add this light's diffuse contribution to our running totals
                r += this.MATERIAL_DIFFUSE_COEFFICIENT * cosLightAngleWithNormal * ray.closestHitObject.color.R;
                g += this.MATERIAL_DIFFUSE_COEFFICIENT * cosLightAngleWithNormal * ray.closestHitObject.color.G;
                b += this.MATERIAL_DIFFUSE_COEFFICIENT * cosLightAngleWithNormal * ray.closestHitObject.color.B;
            }

            if (this.MATERIAL_SPECULAR_COEFFICIENT > this.TINY) {
                // Specular component - dot product of light's reflection vector and viewer direction
                // Direction to the viewer is simply negative of the ray direction
                var lightReflectionDir = Vector3f.operator_sub(Vector3f.operator_mul(surfaceNormal, (cosLightAngleWithNormal * 2)), lightDir);
                var specularFactor = viewerDir.Dot(lightReflectionDir);
                if (specularFactor > 0) {
                    // To get smaller, sharper highlights we raise it to a power and multiply it
                    specularFactor = this.MATERIAL_SPECULAR_COEFFICIENT * Math.pow(specularFactor, this.MATERIAL_SPECULAR_POWER);

                    // Add the specular contribution to our running totals
                    r += specularFactor * ray.closestHitObject.color.R;
                    g += specularFactor * ray.closestHitObject.color.G;
                    b += specularFactor * ray.closestHitObject.color.B;
                }
            }
        }

        // Now do reflection, unless we're too deep
        if (traceDepth < this.MAX_DEPTH && this.MATERIAL_REFLECTION_COEFFICIENT > this.TINY) {
            // Set up the reflected ray - notice we move the origin out a tiny bit again
            var reflectedDir = ray.direction.ReflectIn(surfaceNormal);
            var reflectionRay = new Ray(Vector3f.operator_sum(ray.hitPoint, Vector3f.operator_mul(reflectedDir, this.TINY)), reflectedDir);

            // And trace!
            var reflectionCol = this.Trace(reflectionRay, traceDepth + 1);

            // Add reflection results to running totals, scaling by reflect coeff.
            r += this.MATERIAL_REFLECTION_COEFFICIENT * reflectionCol.R;
            g += this.MATERIAL_REFLECTION_COEFFICIENT * reflectionCol.G;
            b += this.MATERIAL_REFLECTION_COEFFICIENT * reflectionCol.B;
        }

        // Clamp RGBs
        if (r > 255)
            r = 255;
        if (g > 255)
            g = 255;
        if (b > 255)
            b = 255;

        return Color.FromArgb(255, r, g, b);
    };
    RayTracer.PI = 3.1415926536;
    RayTracer.PI_X_2 = 6.2831853072;
    RayTracer.PI_OVER_2 = 1.5707963268;

    RayTracer.CANVAS_WIDTH = 640;
    RayTracer.CANVAS_HEIGHT = 480;

    RayTracer.TINY = 0.0001;
    RayTracer.MAX_DEPTH = 3;

    RayTracer.MATERIAL_DIFFUSE_COEFFICIENT = 0.5;
    RayTracer.MATERIAL_REFLECTION_COEFFICIENT = 0.5;
    RayTracer.MATERIAL_SPECULAR_COEFFICIENT = 2.0;
    RayTracer.MATERIAL_SPECULAR_POWER = 50.0;
    RayTracer.BG_COLOR = Color.BlueViolet;

    RayTracer.eyePos = new Vector3f(0, 0, -5.0);
    RayTracer.screenTopLeftPos = new Vector3f(-6.0, 4.0, 0);
    RayTracer.screenBottomRightPos = new Vector3f(6.0, -4.0, 0);

    RayTracer.minSpeed = Number.MAX_VALUE;
    RayTracer.maxSpeed = Number.MIN_VALUE;
    RayTracer.totalTime = 0;
    return RayTracer;
})();
//# sourceMappingURL=SimpleRaytracer.js.map
