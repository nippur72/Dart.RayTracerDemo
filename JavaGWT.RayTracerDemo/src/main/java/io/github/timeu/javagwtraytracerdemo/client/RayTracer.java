package io.github.timeu.javagwtraytracerdemo.client;


import com.google.gwt.core.client.Scheduler;
import com.google.gwt.dom.client.Element;
import com.google.gwt.user.client.DOM;
import io.github.timeu.javagwtraytracerdemo.shared.Light;
import io.github.timeu.javagwtraytracerdemo.shared.Plane;
import io.github.timeu.javagwtraytracerdemo.shared.RTObject;
import io.github.timeu.javagwtraytracerdemo.shared.Ray;
import io.github.timeu.javagwtraytracerdemo.shared.Sphere;
import io.github.timeu.javagwtraytracerdemo.shared.Vector3f;
import io.github.timeu.javagwtraytracerdemo.client.util.Bitmap;
import io.github.timeu.javagwtraytracerdemo.shared.Color;
import io.github.timeu.javagwtraytracerdemo.client.util.Console;
import io.github.timeu.javagwtraytracerdemo.client.util.Random;
import io.github.timeu.javagwtraytracerdemo.shared.Stopwatch;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by uemit.seren on 8/25/14.
 */
public class RayTracer {
    static final float PI =        3.1415926536f;                                  // maths constants
    static final  float PI_X_2 =    6.2831853072f;
    static final  float PI_OVER_2 = 1.5707963268f;

    static final  int CANVAS_WIDTH = 640;                                          // output image dimensions
    static final  int CANVAS_HEIGHT = 480;

    static final  float TINY = 0.0001f;                                             // a very short distance in world space coords
    static final  int MAX_DEPTH = 3;                                                // max recursion for reflections

    static final  float MATERIAL_DIFFUSE_COEFFICIENT = 0.5f;                        // material diffuse brightness
    static final  float MATERIAL_REFLECTION_COEFFICIENT = 0.5f;                     // material reflection brightness
    static final  float MATERIAL_SPECULAR_COEFFICIENT = 2.0f;                       // material specular highlight brightness
    static final  float MATERIAL_SPECULAR_POWER = 50.0f;                            // material shininess (higher values=smaller highlights)
    static Color BG_COLOR = Color.blueViolet();                               // scene bg colour

    static Vector3f eyePos = new Vector3f(0, 0, -5.0f);                     // eye pos in world space coords
    static Vector3f screenTopLeftPos = new Vector3f(-6.0f, 4.0f, 0);        // top-left corner of screen in world coords
    static Vector3f screenBottomRightPos = new Vector3f(6.0f, -4.0f, 0);    // bottom-right corner of screen in world coords

    static float pixelWidth, pixelHeight;                                   // dimensions of screen pixel **in world coords**

    static List<RTObject> objects;                                          // all RTObjects in the scene
    static List<Light> lights;                                              // all lights
    static Random random;                                                   // global random for repeatability

    static Stopwatch stopwatch;
    static double minSpeed = Double.MAX_VALUE, maxSpeed = Double.MIN_VALUE;
    static double totalTime = 0;
    static List<Double> speedSamples;
    private static Element speedElem;

    //static void Main(string[] args) {
    public static void Mainx() {
        speedElem = DOM.getElementById("speed");

        // init structures
        objects = new ArrayList<RTObject>();
        lights = new ArrayList<Light>();
        random = new Random(1478650229);
        stopwatch = new Stopwatch();
        speedSamples = new ArrayList<Double>();
        Bitmap canvas = new Bitmap(CANVAS_WIDTH, CANVAS_HEIGHT);

        // add some objects
        // in the original test it was 30 and not 300
        for (int i = 0; i < 300; i++) {
            float x = (float)(random.NextDouble() * 10.0f) - 5.0f;          // Range -5 to 5
            float y = (float)(random.NextDouble() * 10.0f) - 5.0f;          // Range -5 to 5
            float z = (float)(random.NextDouble() * 10.0f);                 // Range 0 to 10
            Color c = Color.FromArgb(255, random.Next(255), random.Next(255), random.Next(255));
            Sphere s = new Sphere(new Vector3f(x, y, z), (float)(random.NextDouble()), c);
            objects.add(s);
        }
        //Sphere debugSphere = new Sphere(new Vector3f(0, 0, 5.0f), 0.2f, Color.ForestGreen);
        //objects.Add(debugSphere);
        Plane floor = new Plane(new Vector3f(0, 1.0f, 0), -10.0f, Color.aquamarine());
        objects.add(floor);

        // add some lights
        lights.add(new Light(new Vector3f(2.0f, 0.0f, 0)));
        lights.add(new Light(new Vector3f(0, 10.0f, 7.5f)));

        // calculate width and height of a pixel in world space coords
        pixelWidth = (screenBottomRightPos.x - screenTopLeftPos.x) / CANVAS_WIDTH;
        pixelHeight = (screenTopLeftPos.y - screenBottomRightPos.y) / CANVAS_HEIGHT;

        // render it
        int dotPeriod = CANVAS_HEIGHT / 10;
        Console.WriteLine("Rendering...\n");
        Console.WriteLine("|0%---100%|");

        RenderRow(canvas, dotPeriod, 0);

        // save the pretties
        canvas.Save("output.png");
    }

    static void RenderRow (final Bitmap canvas, final int dotPeriod, final int y) {
        if (y >= CANVAS_HEIGHT)
            return;

        if ((y % dotPeriod) == 0) Console.Write("*");

        stopwatch.Restart();
        for (int x = 0; x < CANVAS_WIDTH; x++) {
            Color c = RenderPixel(x, y);
            canvas.SetPixel(x, y, c);
        }
        //canvas.Refresh(); // added for make it work with Saltarelle
        double elapsed = stopwatch.ElapsedMilliseconds();
        double msPerPixel = (double)elapsed / CANVAS_WIDTH;
        totalTime+=elapsed;

        ReportSpeed(msPerPixel);

        Scheduler.get().scheduleDeferred(new Scheduler.ScheduledCommand() {
            @Override
            public void execute() {
                RenderRow(canvas, dotPeriod, (y + 1));
            }
        });
    }

    static void ReportSpeed (double msPerPixel) {
        minSpeed = Math.min(msPerPixel, minSpeed);
        maxSpeed = Math.max(msPerPixel, maxSpeed);
        speedSamples.add(msPerPixel);

        double average = 0;
        for (Double d : speedSamples)
        average += d;
        average /= speedSamples.size();

        String text =  "min: "+minSpeed+" ms/pixel, max: "+maxSpeed+" ms/pixel, avg: "+average+" ms/pixel, total: "+totalTime+" ms";
        WriteSpeedText(text);
    }

    static void WriteSpeedText (String text) {
        speedElem.setInnerHTML(text);
    }

    static void SetTimeout (int timeoutMs, final Runnable action) {
        Scheduler.get().scheduleDeferred(new Scheduler.ScheduledCommand() {
            @Override
            public void execute() {
                action.run();
            }
        });
    }

    // Given a ray with origin and direction set, fill in the intersection info
    static void CheckIntersection(Ray ray) {
        for (RTObject obj : objects) {                     // loop through objects, test for intersection
            float hitDistance = obj.Intersect(ray);             // check for intersection with this object and find distance
            if (hitDistance < ray.closestHitDistance && hitDistance > 0) {
                ray.closestHitObject = obj;                     // object hit and closest yet found - store it
                ray.closestHitDistance = hitDistance;
            }
        }

        ray.hitPoint = Vector3f.add(ray.origin,Vector3f.multiply(ray.direction,ray.closestHitDistance));   // also store the point of intersection
    }

    // raytrace a pixel (ie, set pixel color to result of a trace of a ray starting from eye position and
    // passing through the world coords of the pixel)
    static Color RenderPixel(int x, int y) {
        // First, calculate direction of the current pixel from eye position
        float sx = screenTopLeftPos.x + (x * pixelWidth);
        float sy = screenTopLeftPos.y - (y * pixelHeight);
        Vector3f eyeToPixelDir = Vector3f.subtract(new Vector3f(sx, sy, 0),eyePos);
        eyeToPixelDir.Normalise();

        // Set up primary (eye) ray
        Ray ray = new Ray(eyePos, eyeToPixelDir);

        // And trace it!
        return Trace(ray, 0);
    }

    // given a ray, trace it into the scene and return the colour of the surface it hits
    // (handles reflections recursively)
    static Color Trace(Ray ray, int traceDepth) {
        // See if the ray intersected an object
        CheckIntersection(ray);
        if (ray.closestHitDistance >= Ray.WORLD_MAX || ray.closestHitObject == null) // No intersection
            return BG_COLOR;

        // Got a hit - set initial colour to ambient light
        float r = 0.15f * ray.closestHitObject.color.R;
        float g = 0.15f * ray.closestHitObject.color.G;
        float b = 0.15f * ray.closestHitObject.color.B;

        // Set up stuff we'll need for shading calcs
        Vector3f surfaceNormal = ray.closestHitObject.GetSurfaceNormalAtPoint(ray.hitPoint);
        Vector3f viewerDir = Vector3f.subtract(ray.direction);                            // Direction back to the viewer (simply negative of ray dir)

        // Loop through the lights, adding contribution of each
        for (Light light : lights) {
            Vector3f lightDir;
            float lightDistance;

            // Find light direction and distance
            lightDir = Vector3f.subtract(light.position,ray.hitPoint);               // Get direction to light
            lightDistance = lightDir.magnitude();
            //lightDir = lightDir / lightDistance;                  // Light exponential falloff
            lightDir.Normalise();

            // Shadow check: check if this light's visible from the point
            // NB: Step out slightly from the hitpoint first
            Ray shadowRay = new Ray(Vector3f.add(ray.hitPoint,(Vector3f.multiply(lightDir,TINY))), lightDir);
            shadowRay.closestHitDistance = lightDistance;           // IMPORTANT: We only want it to trace as far as the light!
            CheckIntersection(shadowRay);
            if (shadowRay.closestHitObject != null)                 // We hit something -- ignore this light entirely
                continue;

            float cosLightAngleWithNormal = surfaceNormal.Dot(lightDir);

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
                // Specular component - Dot product of light's reflection vector and viewer direction
                // Direction to the viewer is simply negative of the ray direction
                Vector3f lightReflectionDir = Vector3f.subtract(Vector3f.multiply(surfaceNormal,(cosLightAngleWithNormal* 2)),lightDir);
                float specularFactor = viewerDir.Dot(lightReflectionDir);
                if (specularFactor > 0) {
                    // To get smaller, sharper highlights we raise it to a power and multiply it
                    specularFactor = MATERIAL_SPECULAR_COEFFICIENT * (float)Math.pow(specularFactor, MATERIAL_SPECULAR_POWER);

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
            Ray reflectionRay = new Ray(Vector3f.add(ray.hitPoint,Vector3f.multiply(reflectedDir,TINY)), reflectedDir);

            // And trace!
            Color reflectionCol = Trace(reflectionRay, traceDepth + 1);

            // Add reflection results to running totals, scaling by reflect coeff.
            r += MATERIAL_REFLECTION_COEFFICIENT * reflectionCol.R;
            g += MATERIAL_REFLECTION_COEFFICIENT * reflectionCol.G;
            b += MATERIAL_REFLECTION_COEFFICIENT * reflectionCol.B;
        }

        // Clamp RGBs
        if (r > 255) r = 255;
        if (g > 255) g = 255;
        if (b > 255) b = 255;

        return (Color.FromArgb(255, (int)r, (int)g, (int)b));
    }
}
