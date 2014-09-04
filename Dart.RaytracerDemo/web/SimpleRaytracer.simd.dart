// Based on http://www.coldcity.com/index.php/simple-csharp-raytracer/
//
// Converted to Dart by Antonino Porcino, Aug 22, 2014
// nino.porcino@gmail.com
//
// Original license comment follows

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

import "dart:core" hide Stopwatch;
import "dart:math" hide Random;
import "dart:html" hide Console;
import "dart:async";
import "missing.dart";
import 'dart:typed_data';

class SimdV {
  static Float32x4 xyz(double x, double y, double z) =>
      new Float32x4(x, y, z, 0.0);

  static Float32x4 normalize(Float32x4 xyz) {
    return xyz.scale(1.0 / sqrt(dot(xyz, xyz)));
  }

  static double magnitude(final Float32x4 xyz) {
    var prod = xyz * xyz;
    return sqrt(prod.x + prod.y + prod.z);
  }

  static double dot(final Float32x4 xyz, final Float32x4 abc) {
    var prod = xyz * abc;
    return prod.x + prod.y + prod.z;
  }

  static Float32x4 ReflectIn(final Float32x4 xyz, final Float32x4 normal) {
    Float32x4 negVector = xyz.scale(-1.0);
    return normal.scale(2.0 * dot(negVector, normal)) - negVector;
  }

}

class SimdC {
  static Float32x4 argb(double a, double r, double g, double b) =>
      new Float32x4(a, r, g, b);
}

class Light {
  Float32x4 position;

  Light(Float32x4 p) {
    position = p;
  }
}

class Ray {
  static const double WORLD_MAX = 1000.0;

  Float32x4 origin;
  Float32x4 direction;

  RTObject closestHitObject;
  double closestHitDistance;
  Float32x4 hitPoint;

  Ray(Float32x4 o, Float32x4 d) {
    origin = o;
    direction = d;
    closestHitDistance = WORLD_MAX;
    closestHitObject = null;
  }
}

abstract class RTObject {
  Float32x4 color;

  double Intersect(Ray ray);

  Float32x4 GetSurfaceNormalAtPoint(Float32x4 p);
}

class Sphere extends RTObject {
  // to specify a sphere we need it's position and radius
  Float32x4 position;
  double radius;

  Sphere(Float32x4 p, double r, Float32x4 c) {
    position = p;
    radius = r;
    color = c;
  }

  double Intersect(Ray ray) {
    // dir from origin to us
    Float32x4 lightFromOrigin = position - ray.origin;

        // cos of angle between dirs from origin to us and from origin to where the ray's pointing
    double v = SimdV.dot(lightFromOrigin, ray.direction);

    double hitDistance =
        radius * radius + v * v -
        lightFromOrigin.x * lightFromOrigin.x -
        lightFromOrigin.y * lightFromOrigin.y -
        lightFromOrigin.z * lightFromOrigin.z;

    if (hitDistance <
        0.0) // no hit (do this check now before bothering to do the sqrt below)
    return -1.0;

    hitDistance = v - sqrt(hitDistance); // get actual hit distance

    if (hitDistance < 0.0) return -1.0; else return hitDistance;
  }

  Float32x4 GetSurfaceNormalAtPoint(Float32x4 p) {
    return SimdV.normalize(p - position);
  }
}

class Plane extends RTObject {
  Float32x4 normal;
  double distance;

  Plane(Float32x4 n, double d, Float32x4 c) {
    normal = n;
    distance = d;
    color = c;
  }

  double Intersect(Ray ray) {
    double normalDotRayDir = SimdV.dot(normal, ray.direction);
    if (normalDotRayDir ==
        0.0) // Ray is parallel to plane (this early-out won't help very often!)
    return -1.0;

    // Any none-parallel ray will hit the plane at some point - the question now is just
    // if it in the positive or negative ray direction.
    double hitDistance =
        -(SimdV.dot(normal, ray.origin) - distance) /
        normalDotRayDir;

    if (hitDistance <
        0.0) // Ray dir is negative, ie we're behind the ray's origin
    return -1.0; else return hitDistance;
  }

  // This is of course the same across the entire plane
  Float32x4 GetSurfaceNormalAtPoint(Float32x4 p) => normal;

}

class RayTracer {
  static final Float32x4 BlueViolet = SimdC.argb(255.0, 138.0, 43.0, 226.0);
  static final Float32x4 Aquamarine = SimdC.argb(255.0, 127.0, 255.0, 212.0);

  static const double PI = 3.1415926536; // maths constants
  static const double PI_X_2 = 6.2831853072;
  static const double PI_OVER_2 = 1.5707963268;

  static const int CANVAS_WIDTH = 640; // output image dimensions
  static const int CANVAS_HEIGHT = 480;

  static const double TINY =
      0.0001; // a very short distance in world space coords
  static const int MAX_DEPTH = 3; // max recursion for reflections

  static const double MATERIAL_DIFFUSE_COEFFICIENT =
      0.5; // material diffuse brightness
  static const double MATERIAL_REFLECTION_COEFFICIENT =
      0.5; // material reflection brightness
  static const double MATERIAL_SPECULAR_COEFFICIENT =
      2.0; // material specular highlight brightness
  static const double MATERIAL_SPECULAR_POWER =
      50.0; // material shininess (higher values=smaller highlights)

  static Float32x4 BG_COLOR = BlueViolet; // scene bg colour

  static Float32x4 eyePos =
      SimdV.xyz(0.0, 0.0, -5.0); // eye pos in world space coords
  static Float32x4 screenTopLeftPos =
      SimdV.xyz(-6.0, 4.0, 0.0); // top-left corner of screen in world coords
  static Float32x4 screenBottomRightPos =
      SimdV.xyz(6.0, -4.0, 0.0); // bottom-right corner of screen in world coords

  static double pixelWidth = 0.0,
      pixelHeight = 0.0; // dimensions of screen pixel **in world coords**

  static List<RTObject> objects; // all RTObjects in the scene
  static List<Light> lights; // all lights
  static Random random; // global random for repeatability

  static Stopwatch stopwatch;
  static double minSpeed = double.MAX_FINITE,
      maxSpeed = double.MIN_POSITIVE;
  static double totalTime = 0.0;
  static List<double> speedSamples;

  static void Main() {
    // init structures
    objects = new List<RTObject>();
    lights = new List<Light>();
    random = new Random(01478650229);
    stopwatch = new Stopwatch();
    speedSamples = new List<double>();
    Bitmap canvas = new Bitmap(CANVAS_WIDTH, CANVAS_HEIGHT);

    // add some objects
    // in the original test it was 30 and not 300
    for (int i = 0; i < 300; i++) {
      double x = (random.NextDouble() * 10.0) - 5.0; // Range -5 to 5
      double y = (random.NextDouble() * 10.0) - 5.0; // Range -5 to 5
      double z = (random.NextDouble() * 10.0); // Range 0 to 10
      Float32x4 c = SimdC.argb(
          255.0,
          random.Next(255.0).toDouble(),
          random.Next(255.0).toDouble(),
          random.Next(255.0).toDouble());
      Sphere s = new Sphere(SimdV.xyz(x, y, z), random.NextDouble(), c);
      objects.add(s);
    }

    Plane floor = new Plane(SimdV.xyz(0.0, 1.0, 0.0), -10.0, Aquamarine);
    objects.add(floor);

    // add some lights
    lights.add(new Light(SimdV.xyz(2.0, 0.0, 0.0)));
    lights.add(new Light(SimdV.xyz(0.0, 10.0, 7.5)));

    // calculate width and height of a pixel in world space coords
    pixelWidth = (screenBottomRightPos.x - screenTopLeftPos.x) / CANVAS_WIDTH;
    pixelHeight = (screenTopLeftPos.y - screenBottomRightPos.y) / CANVAS_HEIGHT;

    // render it
    int dotPeriod = CANVAS_HEIGHT ~/ 10;
    Console.WriteLine("Rendering...\n");
    Console.WriteLine("|0%---100%|");

    stopwatch.Restart();
    for (int y = 0; y < CANVAS_HEIGHT; y++) {
      RenderRow(canvas, dotPeriod, y);
    }

    // save the pretties
    canvas.Save("output.png");
  }

  static void RenderRow(Bitmap canvas, int dotPeriod, int y) {
    if (y >= CANVAS_HEIGHT) return;

    if ((y % dotPeriod) == 0) Console.Write("*");

    for (int x = 0; x < CANVAS_WIDTH; x++) {
      Float32x4 cs = RenderPixel(x, y);
      Color c =
          new Color(cs.x.toInt(), cs.y.toInt(), cs.z.toInt(), cs.w.toInt());
      canvas.SetPixel(x, y, c);
    }
    var elapsed = stopwatch.ElapsedMilliseconds;
    double msPerPixel = elapsed / CANVAS_WIDTH;
    totalTime = elapsed.toDouble();
    ReportSpeed(msPerPixel);
  }

  static void ReportSpeed(double msPerPixel) {
    minSpeed = min(msPerPixel, minSpeed);
    maxSpeed = max(msPerPixel, maxSpeed);
    speedSamples.add(msPerPixel);

    double average = 0.0;
    for (var d in speedSamples) average += d;
    average /= speedSamples.length;

    WriteSpeedText(
        "min: ${minSpeed} ms/pixel, max: $maxSpeed ms/pixel, avg: $average ms/pixel, total $totalTime ms Trace calls: $traceCalls");
  }

  static void WriteSpeedText(String text) {
    querySelector("#speed").innerHtml = text;
  }

  static void SetTimeout(int timeoutMs, action) {
    new Timer(new Duration(milliseconds: timeoutMs), action);
  }

  // Given a ray with origin and direction set, fill in the intersection info
  static void CheckIntersection(/*ref*/ Ray ray) {
    // loop through objects, test for intersection
    for (RTObject obj in objects) {
      // check for intersection with this object and find distance
      double hitDistance = obj.Intersect(ray);
      if (hitDistance < ray.closestHitDistance && hitDistance > 0) {
        // object hit and closest yet found - store it
        ray.closestHitObject = obj;
        ray.closestHitDistance = hitDistance;
      }
    }
    // also store the point of intersection
    ray.hitPoint = ray.origin + (ray.direction.scale(ray.closestHitDistance));
  }

  // raytrace a pixel (ie, set pixel color to result of a trace of a ray starting from eye position and
  // passing through the world coords of the pixel)
  static Float32x4 RenderPixel(int x, int y) {
    // First, calculate direction of the current pixel from eye position
    double sx = screenTopLeftPos.x + (x * pixelWidth);
    double sy = screenTopLeftPos.y - (y * pixelHeight);
    Float32x4 eyeToPixelDir = SimdV.normalize(SimdV.xyz(sx, sy, 0.0) - eyePos);

    // Set up primary (eye) ray
    Ray ray = new Ray(eyePos, eyeToPixelDir);

    // And trace it!
    return Trace(ray, 0);
  }

  static final Float32x4 zero = new Float32x4.zero();
  static final Float32x4 clampUpper = new Float32x4.splat(255.0);
  static int traceCalls = 0;

  // given a ray, trace it into the scene and return the colour of the surface it hits
  // (handles reflections recursively)
  static Float32x4 Trace(Ray ray, int traceDepth) {
    traceCalls++;
    // See if the ray intersected an object
    CheckIntersection(/*ref*/ ray);
    // No intersection
    if (ray.closestHitDistance >= Ray.WORLD_MAX ||
        ray.closestHitObject == null) return BG_COLOR;

    // Got a hit - set initial colour to ambient light
    Float32x4 argb = ray.closestHitObject.color.scale(0.15);

    // Set up stuff we'll need for shading calcs
    Float32x4 surfaceNormal =
        ray.closestHitObject.GetSurfaceNormalAtPoint(ray.hitPoint);
    // Direction back to the viewer (simply negative of ray dir)
    Float32x4 viewerDir = -ray.direction;

    // Loop through the lights, adding contribution of each
    for (Light light in lights) {
      double lightDistance;

      // Find light direction and distance
      Float32x4 lightDir = light.position - ray.hitPoint;
      // Get direction to light
      lightDistance = SimdV.magnitude(lightDir);
      // Light exponential falloff
      //lightDir = lightDir / lightDistance;
      lightDir = SimdV.normalize(lightDir);

      // Shadow check: check if this light's visible from the point
      // NB: Step out slightly from the hitpoint first
      Ray shadowRay = new Ray(ray.hitPoint + (lightDir.scale(TINY)), lightDir);
      // IMPORTANT: We only want it to trace as far as the light!
      shadowRay.closestHitDistance = lightDistance;
      CheckIntersection(/*ref*/ shadowRay);
      // We hit something -- ignore this light entirely
      if (shadowRay.closestHitObject != null) continue;

      double cosLightAngleWithNormal = SimdV.dot(surfaceNormal, lightDir);

      if (MATERIAL_DIFFUSE_COEFFICIENT > TINY) {

            // Calculate light's diffuse component - note that this is view independant

            // Dot product of surface normal and light direction gives cos of angle between them so will be in

            // range -1 to 1. We use that as a scaling factor; common technique, called "cosine shading".
        if (cosLightAngleWithNormal <= 0) continue;

        // Add this light's diffuse contribution to our running totals
        argb += ray.closestHitObject.color.scale(
            MATERIAL_DIFFUSE_COEFFICIENT * cosLightAngleWithNormal);
      }

      if (MATERIAL_SPECULAR_COEFFICIENT > TINY) {

            // Specular component - dot product of light's reflection vector and viewer direction
        // Direction to the viewer is simply negative of the ray direction
        Float32x4 lightReflectionDir =
            surfaceNormal.scale(cosLightAngleWithNormal * 2) -
            lightDir;
        double specularFactor = SimdV.dot(viewerDir, lightReflectionDir);
        if (specularFactor > 0) {

              // To get smaller, sharper highlights we raise it to a power and multiply it
          specularFactor =
              MATERIAL_SPECULAR_COEFFICIENT * pow(specularFactor, MATERIAL_SPECULAR_POWER);
          // Add the specular contribution to our running totals
          argb += ray.closestHitObject.color.scale(specularFactor);
        }
      }
    }

    // Now do reflection, unless we're too deep
    if (traceDepth < MAX_DEPTH && MATERIAL_REFLECTION_COEFFICIENT > TINY) {

          // Set up the reflected ray - notice we move the origin out a tiny bit again
      Float32x4 reflectedDir = SimdV.ReflectIn(ray.direction, surfaceNormal);
      Ray reflectionRay =
          new Ray(ray.hitPoint + reflectedDir.scale(TINY), reflectedDir);

      // And trace!
      Float32x4 reflectionCol = Trace(reflectionRay, traceDepth + 1);

      // Add reflection results to running totals, scaling by reflect coeff.
      argb += reflectionCol.scale(MATERIAL_REFLECTION_COEFFICIENT);
    }

    // Clamp RGBs
    argb = argb.clamp(zero, clampUpper);
    return argb.withX(255.0);
  }
}

