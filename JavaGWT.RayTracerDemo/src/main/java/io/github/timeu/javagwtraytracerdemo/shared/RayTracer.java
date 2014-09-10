package io.github.timeu.javagwtraytracerdemo.shared;

import io.github.timeu.javagwtraytracerdemo.shared.util.Bitmap;
import io.github.timeu.javagwtraytracerdemo.shared.util.ExecEnv;
import io.github.timeu.javagwtraytracerdemo.shared.util.Random;
import io.github.timeu.javagwtraytracerdemo.shared.util.Stopwatch;

/**
 * Created by uemit.seren on 8/25/14.
 */
public class RayTracer {
    static final double PI =        3.1415926536f;                          // maths constants
    static final double PI_X_2 =    6.2831853072f;
    static final double PI_OVER_2 = 1.5707963268f;

    static final int N_OF_OBJECTS = 300; // in the original test it was 30 and not 300
    static final int CANVAS_WIDTH = 640;                                    // output image dimensions
    static final int CANVAS_HEIGHT = 480;

    static final double TINY = 0.0001f;                                     // a very short distance in world space coords
    static final int MAX_DEPTH = 3;                                         // max recursion for reflections
    static final double AMBIENT_LIGHT = 0.15f;

    static final double MATERIAL_DIFFUSE_COEFFICIENT = 0.5f;                // material diffuse brightness
    static final double MATERIAL_REFLECTION_COEFFICIENT = 0.5f;             // material reflection brightness
    static final double MATERIAL_SPECULAR_COEFFICIENT = 2.0f;               // material specular highlight brightness
    static final double MATERIAL_SPECULAR_POWER = 50.0f;                    // material shininess (higher values=smaller highlights)
    static final Color BG_COLOR = Color.blueViolet();                       // scene bg colour

    static final Vector3f eyePos = new Vector3f(0, 0, -5.0f);               // eye pos in world space coords
    static final Vector3f screenTopLeftPos = new Vector3f(-6.0f, 4.0f, 0);  // top-left corner of screen in world coords
    static final Vector3f screenBottomRightPos = new Vector3f(6.0f, -4.0f, 0); // bottom-right corner of screen in world coords

    static double pixelWidth, pixelHeight;                                  // dimensions of screen pixel **in world coords**

    static final RTObject[] objects = new RTObject[N_OF_OBJECTS + 1];       // all RTObjects in the scene
    static final Light[] lights = new Light[2];                             // all lights
    static Random random;                                                   // global random for repeatability

    static Stopwatch stopwatch;
    static double minSpeed = Double.MAX_VALUE, maxSpeed = Double.MIN_VALUE;
    static double totalTime = 0;
    static final double[] speedSamples = new double[CANVAS_HEIGHT];

    static int checkNumber;

    static ExecEnv execEnv;

    public static void Mainx(Random randomParam, Bitmap canvas, Stopwatch stopwatchParam,
                             ExecEnv execEnvParam) {
        execEnv = execEnvParam;
        // init structures
        random = randomParam;
        random.newSeed(1478650229);
        stopwatch = stopwatchParam;
        checkNumber = 0;
        canvas.init(CANVAS_WIDTH, CANVAS_HEIGHT);

        // add some objects
        for (int i = 0; i < N_OF_OBJECTS; i++) {
            double x = random.NextDouble() * 10.0f - 5.0f;          // Range -5 to 5
            double y = random.NextDouble() * 10.0f - 5.0f;          // Range -5 to 5
            double z = random.NextDouble() * 10.0f;                 // Range 0 to 10
            Color c = Color.FromArgb(255, random.Next(255), random.Next(255), random.Next(255));
            Sphere s = new Sphere(new Vector3f(x, y, z), (random.NextDouble()), c);
            objects[i] = s;
        }
        //Sphere debugSphere = new Sphere(new Vector3f(0, 0, 5.0f), 0.2f, Color.ForestGreen);
        //objects.Add(debugSphere);
        Plane floor = new Plane(new Vector3f(0, 1.0f, 0), -10.0f, Color.aquamarine());
        objects[N_OF_OBJECTS] = floor;

        // add some lights
        lights[0] = new Light(new Vector3f(2.0f,  0.0f, 0.0f));
        lights[1] = new Light(new Vector3f(0.0f, 10.0f, 7.5f));

        // calculate width and height of a pixel in world space coords
        pixelWidth = (screenBottomRightPos.x - screenTopLeftPos.x) / CANVAS_WIDTH;
        pixelHeight = (screenTopLeftPos.y - screenBottomRightPos.y) / CANVAS_HEIGHT;

        // render it
        int dotPeriod = CANVAS_HEIGHT / 10;
        execEnv.WriteLine("Rendering...\n");
        execEnv.WriteLine("|0%---100%|");

        RenderRow(canvas, dotPeriod, 0);

        // save the pretties
        canvas.Save("output.png");
    }

    public static void RenderRow(final Bitmap canvas, final int dotPeriod, final int y) {
		if (y >= CANVAS_HEIGHT) {
		    //execEnv.WriteLine("");
		    //execEnv.WriteLine("total: " + totalTime + " ms");

		    // checksum control
		    execEnv.WriteLine("");
            if (checkNumber == 107521263) execEnv.WriteLine("checksum ok");
            else execEnv.WriteLine("checksum error: " + Integer.toString(checkNumber));
            return;
        }

        if ((y % dotPeriod) == 0) execEnv.Write("*");

        stopwatch.Restart();
        for (int x = 0; x < CANVAS_WIDTH; x++) {
            Color c = RenderPixel(x, y);
            canvas.SetPixel(x, y, c);
            checkNumber += c.R + c.G + c.B;
        }

        double elapsed = stopwatch.ElapsedMilliseconds();
        totalTime += elapsed;
        double msPerPixel = elapsed / CANVAS_WIDTH;
        ReportSpeed(msPerPixel, y);

        execEnv.RenderRow(canvas, dotPeriod, y + 1);
    }

    static void ReportSpeed(final double msPerPixel, final int row) {
        minSpeed = Math.min(msPerPixel, minSpeed);
        maxSpeed = Math.max(msPerPixel, maxSpeed);
        speedSamples[row] = msPerPixel;

        double average = 0;
        for (int i = 0; i <= row; i++) average += speedSamples[i];
        average /= (row + 1);

        String text = "min: " + minSpeed + " ms/pixel, max: " + maxSpeed + " ms/pixel, avg: "
                      + average + " ms/pixel, total: " + totalTime + " ms";
        execEnv.WriteSpeedText(text);
    }

    // Given a ray with origin and direction set, fill in the intersection info
    static void CheckIntersection(Ray ray) {
        for (RTObject obj : objects) { // loop through objects, test for intersection
            double hitDistance = obj.Intersect(ray); // check for intersection with this object and find distance
            if (hitDistance > 0 && hitDistance < ray.closestHitDistance) {
                ray.closestHitObject = obj; // object hit and closest yet found - store it
                ray.closestHitDistance = hitDistance;
            }
        }
        ray.hitPoint = Vector3f.add(ray.origin, Vector3f.multiply(ray.direction, ray.closestHitDistance)); // also store the point of intersection
    }

    // raytrace a pixel (ie, set pixel color to result of a trace of a ray starting from eye position and
    // passing through the world coords of the pixel)
    static Color RenderPixel(int x, int y) {
        // First, calculate direction of the current pixel from eye position
        double sx = screenTopLeftPos.x + (x * pixelWidth);
        double sy = screenTopLeftPos.y - (y * pixelHeight);
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
        final RTObject closestHitObject = ray.closestHitObject;
        if (ray.closestHitDistance >= Ray.WORLD_MAX || closestHitObject == null) // No intersection
            return BG_COLOR;

        // Got a hit - set initial color to ambient light
        final Color closestHitColor = closestHitObject.color;
        double r = AMBIENT_LIGHT * closestHitColor.R;
        double g = AMBIENT_LIGHT * closestHitColor.G;
        double b = AMBIENT_LIGHT * closestHitColor.B;

        // Set up stuff we'll need for shading calcs
        Vector3f surfaceNormal = closestHitObject.GetSurfaceNormalAtPoint(ray.hitPoint);
        Vector3f viewerDir = Vector3f.subtract(ray.direction); // Direction back to the viewer (simply negative of ray dir)

        // Loop through the lights, adding contribution of each
        for (Light light : lights) {
            Vector3f lightDir;
            double lightDistance;

            // Find light direction and distance
            lightDir = Vector3f.subtract(light.position, ray.hitPoint); // Get direction to light
            lightDistance = lightDir.magnitude();
            //lightDir = lightDir / lightDistance;   // Light exponential falloff
            lightDir.Normalise();

            // Shadow check: check if this light's visible from the point
            // NB: Step out slightly from the hitpoint first
            Ray shadowRay = new Ray(Vector3f.add(ray.hitPoint, (Vector3f.multiply(lightDir, TINY))), lightDir);
            shadowRay.closestHitDistance = lightDistance; // IMPORTANT: We only want it to trace as far as the light!
            CheckIntersection(shadowRay);
            if (shadowRay.closestHitObject != null) // We hit something -- ignore this light entirely
                continue;

            double cosLightAngleWithNormal = surfaceNormal.Dot(lightDir);

            if (MATERIAL_DIFFUSE_COEFFICIENT > TINY) {
                // Calculate light's diffuse component - note that this is view independant
                // Dot product of surface normal and light direction gives cos of angle between them so will be in
                // range -1 to 1. We use that as a scaling factor; common technique, called "cosine shading".
                if (cosLightAngleWithNormal <= 0) continue;

                // Add this light's diffuse contribution to our running totals
                final double diffuseFactor = MATERIAL_DIFFUSE_COEFFICIENT * cosLightAngleWithNormal;
                r += diffuseFactor * closestHitColor.R;
                g += diffuseFactor * closestHitColor.G;
                b += diffuseFactor * closestHitColor.B;
            }

            if (MATERIAL_SPECULAR_COEFFICIENT > TINY) {
                // Specular component - Dot product of light's reflection vector and viewer direction
                // Direction to the viewer is simply negative of the ray direction
                Vector3f lightReflectionDir = Vector3f.subtract(Vector3f.multiply(surfaceNormal, (cosLightAngleWithNormal * 2)), lightDir);
                double specularFactor = viewerDir.Dot(lightReflectionDir);
                if (specularFactor > 0) {
                    // To get smaller, sharper highlights we raise it to a power and multiply it
                    specularFactor = MATERIAL_SPECULAR_COEFFICIENT * Math.pow(specularFactor, MATERIAL_SPECULAR_POWER);

                    // Add the specular contribution to our running totals
                    r += specularFactor * closestHitColor.R;
                    g += specularFactor * closestHitColor.G;
                    b += specularFactor * closestHitColor.B;
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
        if (r > 255.0f) r = 255.0f;
        if (g > 255.0f) g = 255.0f;
        if (b > 255.0f) b = 255.0f;

        return (Color.FromArgb(255, (int)r, (int)g, (int)b));
    }
}
