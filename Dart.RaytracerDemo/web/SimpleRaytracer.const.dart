// this experimental file ending is a slightly modified version 
// where Vector3f is declared as immutable with a const constructor.
// This provides a little speed increase in javascript only  

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

 class Vector3f {
     final double x, y, z;

     const Vector3f([this.x=0.0, this.y=0.0, this.z=0.0]);

     double Dot(Vector3f b) {
         return (x * b.x + y * b.y + z * b.z);
     }

     Vector3f Normalise() {
         double f = 1.0 / sqrt(this.Dot(this));
         return new Vector3f(x*f,y*f,z*f);
     }

     double Magnitude() {
         return sqrt(x*x + y*y + z*z);
     }

     Vector3f operator -(Vector3f b) {
         return new Vector3f(this.x - b.x, this.y - b.y, this.z - b.z);
     }

     Vector3f operator -() {
         return new Vector3f(-this.x, -this.y, -this.z);
     }

     Vector3f operator *(double b) {
         return new Vector3f(this.x * b, this.y * b, this.z * b);
     }

     Vector3f operator /(double b) {
         return new Vector3f(this.x / b, this.y / b, this.z / b);
     }

     Vector3f operator +(Vector3f b) {
         return new Vector3f(this.x + b.x, this.y + b.y, this.z + b.z);
     }

     Vector3f ReflectIn(Vector3f normal) {
         Vector3f negVector = -this;
         Vector3f reflectedDir = normal * (2.0 * negVector.Dot(normal)) - negVector;
         return reflectedDir;
     }
 }
 
 class Light {
     final Vector3f position;

     Light(Vector3f this.position);
 }
 
 class Ray {        
     static const double WORLD_MAX = 1000.0;

     final Vector3f origin;
     final Vector3f direction;

     RTObject closestHitObject;
     double closestHitDistance;
     Vector3f hitPoint;

     Ray(Vector3f this.origin, Vector3f this.direction)
       :  closestHitDistance = WORLD_MAX;
 }
 
 abstract class RTObject {
     final Color color;

     double Intersect(Ray ray);

     Vector3f GetSurfaceNormalAtPoint(Vector3f p);
     
     RTObject(Color this.color);
 }
 
 class Sphere extends RTObject {
     // to specify a sphere we need it's position and radius
     final Vector3f position;
     final double radius;

     Sphere(Vector3f this.position, double this.radius, Color c) : super(c);

     double Intersect(Ray ray) {
         Vector3f lightFromOrigin = position - ray.origin;               // dir from origin to us
         double v = lightFromOrigin.Dot(ray.direction);                   // cos of angle between dirs from origin to us and from origin to where the ray's pointing

         double hitDistance = 
             radius * radius + v * v - 
             lightFromOrigin.x * lightFromOrigin.x - 
             lightFromOrigin.y * lightFromOrigin.y - 
             lightFromOrigin.z * lightFromOrigin.z;

         if (hitDistance < 0.0)                                            // no hit (do this check now before bothering to do the sqrt below)
             return -1.0;

         hitDistance = v - sqrt(hitDistance);			    // get actual hit distance

         if (hitDistance < 0.0)
             return -1.0;
         else
             return hitDistance;
     }
     
     /*
     Vector3f GetSurfaceNormalAtPoint(Vector3f p) {
         Vector3f normal = p - position;
         normal.Normalise();
         return normal;
     }
     */

     Vector3f GetSurfaceNormalAtPoint(Vector3f p) {
         Vector3f normal = p - position;         
         return normal.Normalise();
     }
 }
 
 class Plane extends RTObject {
     final Vector3f normal;
     final double distance;

     Plane(Vector3f this.normal, double this.distance, Color c) : super(c);

     double Intersect(Ray ray) {
         double normalDotRayDir = normal.Dot(ray.direction);
         if (normalDotRayDir == 0.0)   // Ray is parallel to plane (this early-out won't help very often!)
             return -1.0;

         // Any none-parallel ray will hit the plane at some point - the question now is just
         // if it in the positive or negative ray direction.
         double hitDistance = -(normal.Dot(ray.origin) - distance) / normalDotRayDir;

         if (hitDistance < 0.0)        // Ray dir is negative, ie we're behind the ray's origin
             return -1.0;
         else 
             return hitDistance;
     }

     Vector3f GetSurfaceNormalAtPoint(Vector3f p) {
         return normal;              // This is of course the same across the entire plane
     }
 }
 
 class RayTracer {
     static const double PI =        3.1415926536;                                  // maths constants
     static const double PI_X_2 =    6.2831853072;
     static const double PI_OVER_2 = 1.5707963268;

     static const int CANVAS_WIDTH = 640;                                          // output image dimensions
     static const int CANVAS_HEIGHT = 480;
     
     static const double TINY = 0.0001;                                             // a very short distance in world space coords
     static const int MAX_DEPTH = 3;                                                // max recursion for reflections
     
     static const double MATERIAL_DIFFUSE_COEFFICIENT = 0.5;                        // material diffuse brightness
     static const double MATERIAL_REFLECTION_COEFFICIENT = 0.5;                     // material reflection brightness
     static const double MATERIAL_SPECULAR_COEFFICIENT = 2.0;                       // material specular highlight brightness
     static const double MATERIAL_SPECULAR_POWER = 50.0;                            // material shininess (higher values=smaller highlights)

     static Color BG_COLOR = Color.BlueViolet;                               // scene bg colour
     
     static Vector3f eyePos = new Vector3f(0.0, 0.0, -5.0);                  // eye pos in world space coords
     static Vector3f screenTopLeftPos = new Vector3f(-6.0, 4.0, 0.0);        // top-left corner of screen in world coords
     static Vector3f screenBottomRightPos = new Vector3f(6.0, -4.0, 0.0);    // bottom-right corner of screen in world coords
     
     static double pixelWidth = 0.0, pixelHeight = 0.0;                      // dimensions of screen pixel **in world coords**

     static List<RTObject> objects;                                          // all RTObjects in the scene
     static List<Light> lights;                                              // all lights
     static Random random;                                                   // global random for repeatability
     
     static Stopwatch stopwatch;        
     static double minSpeed = double.MAX_FINITE, maxSpeed = double.MIN_POSITIVE;
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
             double x = (random.NextDouble() * 10.0) - 5.0;          // Range -5 to 5
             double y = (random.NextDouble() * 10.0) - 5.0;          // Range -5 to 5
             double z = (random.NextDouble() * 10.0);                // Range 0 to 10
             Color c = Color.FromArgb(255, random.Next(255.0), random.Next(255.0), random.Next(255.0));
             Sphere s = new Sphere(new Vector3f(x, y, z), random.NextDouble(), c);
             objects.add(s);
         }

         Plane floor = new Plane(new Vector3f(0.0, 1.0, 0.0), -10.0, Color.Aquamarine);
         objects.add(floor);
         
         // add some lights
         lights.add(new Light(new Vector3f(2.0, 0.0, 0.0)));
         lights.add(new Light(new Vector3f(0.0, 10.0, 7.5)));

         // calculate width and height of a pixel in world space coords
         pixelWidth = (screenBottomRightPos.x - screenTopLeftPos.x) / CANVAS_WIDTH;
         pixelHeight = (screenTopLeftPos.y - screenBottomRightPos.y) / CANVAS_HEIGHT;

         // render it
         int dotPeriod = CANVAS_HEIGHT ~/ 10;
         Console.WriteLine("Rendering...\n");
         Console.WriteLine("|0%---100%|");

         RenderRow(canvas, dotPeriod, 0);

         // save the pretties
         canvas.Save("output.png");
     }
     
     static void RenderRow (Bitmap canvas, int dotPeriod, int y) {            
         if (y >= CANVAS_HEIGHT)
             return;
         
         if ((y % dotPeriod) == 0) Console.Write("*");
         
         stopwatch.Restart();
         for (int x = 0; x < CANVAS_WIDTH; x++) {
             Color c = RenderPixel(x, y);
             canvas.SetPixel(x, y, c);
         }
         //canvas.Refresh(); // added for make it work with Saltarelle
         var elapsed = stopwatch.ElapsedMilliseconds;
         double msPerPixel = elapsed / CANVAS_WIDTH;
         totalTime+=elapsed;
         
         ReportSpeed(msPerPixel);
         
         SetTimeout(0, () => 
             RenderRow(canvas, dotPeriod, y + 1)
         );
     }
     
     static void ReportSpeed (double msPerPixel) {
       minSpeed = min(msPerPixel, minSpeed);
       maxSpeed = max(msPerPixel, maxSpeed);
       speedSamples.add(msPerPixel);
       
       double average = 0.0;
       for(var d in speedSamples)
         average += d;
       average /= speedSamples.length;
       
       WriteSpeedText("min: ${minSpeed} ms/pixel, max: ${maxSpeed} ms/pixel, avg: ${average} ms/pixel, total ${totalTime} ms");
     }
     
     //[JSReplacement("document.getElementById('speed').innerHTML = $text")] ####
     //[InlineCode("document.getElementById('speed').innerHTML = {text}")]
     static void WriteSpeedText(String text) {
       querySelector("#speed").innerHtml = text;
     }
     
     //[JSReplacement("setTimeout($action, $timeoutMs)")] ####
     //[InlineCode("setTimeout({action}, {timeoutMs})")]
     static void SetTimeout (int timeoutMs, action) {
       new Timer(new Duration(milliseconds: timeoutMs),action);
     }

     // Given a ray with origin and direction set, fill in the intersection info
     static void CheckIntersection(/*ref*/ Ray ray) {
         for(RTObject obj in objects) {                     // loop through objects, test for intersection
             double hitDistance = obj.Intersect(ray);             // check for intersection with this object and find distance
             if (hitDistance < ray.closestHitDistance && hitDistance > 0) {
                 ray.closestHitObject = obj;                     // object hit and closest yet found - store it
                 ray.closestHitDistance = hitDistance;
             }
         }

         ray.hitPoint = ray.origin + (ray.direction * ray.closestHitDistance);   // also store the point of intersection 
     }

     // raytrace a pixel (ie, set pixel color to result of a trace of a ray starting from eye position and
     // passing through the world coords of the pixel)
     /*
     static Color RenderPixel(int x, int y) {
         // First, calculate direction of the current pixel from eye position
         double sx = screenTopLeftPos.x + (x * pixelWidth);
         double sy = screenTopLeftPos.y - (y * pixelHeight);
         Vector3f eyeToPixelDir = new Vector3f(sx, sy, 0.0) - eyePos;
         eyeToPixelDir.Normalise();

         // Set up primary (eye) ray
         Ray ray = new Ray(eyePos, eyeToPixelDir);

         // And trace it!
         return Trace(ray, 0);
     }
     */
     static Color RenderPixel(int x, int y) {
         // First, calculate direction of the current pixel from eye position
         double sx = screenTopLeftPos.x + (x * pixelWidth);
         double sy = screenTopLeftPos.y - (y * pixelHeight);
         Vector3f eyeToPixelDir = new Vector3f(sx, sy, 0.0) - eyePos;         

         // Set up primary (eye) ray
         Ray ray = new Ray(eyePos, eyeToPixelDir.Normalise());

         // And trace it!
         return Trace(ray, 0);
     }
     
     // given a ray, trace it into the scene and return the colour of the surface it hits 
     // (handles reflections recursively)
     static Color Trace(Ray ray, int traceDepth) {
         // See if the ray intersected an object
         CheckIntersection(/*ref*/ ray);
         if (ray.closestHitDistance >= Ray.WORLD_MAX || ray.closestHitObject == null) // No intersection
             return BG_COLOR;
         
         // Got a hit - set initial colour to ambient light
         double r = 0.15 * ray.closestHitObject.color.R;
         double g = 0.15 * ray.closestHitObject.color.G; 
         double b = 0.15 * ray.closestHitObject.color.B;

         // Set up stuff we'll need for shading calcs
         Vector3f surfaceNormal = ray.closestHitObject.GetSurfaceNormalAtPoint(ray.hitPoint);
         Vector3f viewerDir = -ray.direction;                            // Direction back to the viewer (simply negative of ray dir)

         // Loop through the lights, adding contribution of each
         for (Light light in lights) {
             Vector3f lightDir = new Vector3f();
             double lightDistance;

             // Find light direction and distance
             lightDir = light.position - ray.hitPoint;               // Get direction to light
             lightDistance = lightDir.Magnitude();
             //lightDir = lightDir / lightDistance;                  // Light exponential falloff
             //lightDir.Normalise();
             lightDir = lightDir.Normalise();
             
             // Shadow check: check if this light's visible from the point
             // NB: Step out slightly from the hitpoint first
             Ray shadowRay = new Ray(ray.hitPoint + (lightDir * TINY), lightDir);
             shadowRay.closestHitDistance = lightDistance;           // IMPORTANT: We only want it to trace as far as the light!
             CheckIntersection(/*ref*/ shadowRay);
             if (shadowRay.closestHitObject != null)                 // We hit something -- ignore this light entirely
                 continue;

             double cosLightAngleWithNormal = surfaceNormal.Dot(lightDir);

             if (MATERIAL_DIFFUSE_COEFFICIENT > TINY) {
                 // Calculate light's diffuse component - note that this is view independant
                 // Dot product of surface normal and light direction gives cos of angle between them so will be in 
                 // range -1 to 1. We use that as a scaling factor; common technique, called "cosine shading".
                 if (cosLightAngleWithNormal <= 0) continue;

                 // Add this light's diffuse contribution to our running totals
                 r += MATERIAL_DIFFUSE_COEFFICIENT * cosLightAngleWithNormal * ray.closestHitObject.color.R;
                 g += MATERIAL_DIFFUSE_COEFFICIENT * cosLightAngleWithNormal * ray.closestHitObject.color.G;
                 b += MATERIAL_DIFFUSE_COEFFICIENT * cosLightAngleWithNormal * ray.closestHitObject.color.B;
             }

             if (MATERIAL_SPECULAR_COEFFICIENT > TINY) {
                 // Specular component - dot product of light's reflection vector and viewer direction
                 // Direction to the viewer is simply negative of the ray direction
                 Vector3f lightReflectionDir = surfaceNormal * (cosLightAngleWithNormal * 2) - lightDir;
                 double specularFactor = viewerDir.Dot(lightReflectionDir);
                 if (specularFactor > 0) {
                     // To get smaller, sharper highlights we raise it to a power and multiply it
                     specularFactor = MATERIAL_SPECULAR_COEFFICIENT * pow(specularFactor, MATERIAL_SPECULAR_POWER);

                     // Add the specular contribution to our running totals
                     r += specularFactor * ray.closestHitObject.color.R;
                     g += specularFactor * ray.closestHitObject.color.G;
                     b += specularFactor * ray.closestHitObject.color.B;
                 }
             }
         }
     
         // Now do reflection, unless we're too deep
         if (traceDepth < MAX_DEPTH && MATERIAL_REFLECTION_COEFFICIENT > TINY) {
             // Set up the reflected ray - notice we move the origin out a tiny bit again
             Vector3f reflectedDir = ray.direction.ReflectIn(surfaceNormal);
             Ray reflectionRay = new Ray(ray.hitPoint + reflectedDir * TINY, reflectedDir);

             // And trace!
             Color reflectionCol = Trace(reflectionRay, traceDepth + 1);

             // Add reflection results to running totals, scaling by reflect coeff.
             r += MATERIAL_REFLECTION_COEFFICIENT * reflectionCol.R;
             g += MATERIAL_REFLECTION_COEFFICIENT * reflectionCol.G;
             b += MATERIAL_REFLECTION_COEFFICIENT * reflectionCol.B;
         }

         // Clamp RGBs
         if (r > 255.0) r = 255.0;
         if (g > 255.0) g = 255.0;
         if (b > 255.0) b = 255.0;

         return (Color.FromArgb(255, r.toInt(), g.toInt(), b.toInt()));  // is toInt() necessary?
     }
 }


