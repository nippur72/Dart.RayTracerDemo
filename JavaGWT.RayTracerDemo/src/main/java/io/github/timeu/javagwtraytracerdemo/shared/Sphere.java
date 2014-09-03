package io.github.timeu.javagwtraytracerdemo.shared;

/**
 * Created by uemit.seren on 8/25/14.
 */
public class Sphere extends RTObject {
    // to specify a sphere we need it's position and radius
    public Vector3f position;
    public double radius;

    public Sphere(Vector3f p, double r, Color c) {
        position = p;
        radius = r;
        color = c;
    }

    @Override
    public double Intersect(Ray ray) {
        Vector3f lightFromOrigin = Vector3f.subtract(position,ray.origin);               // dir from origin to us
        double v = lightFromOrigin.Dot(ray.direction);                   // cos of angle between dirs from origin to us and from origin to where the ray's pointing

        double hitDistance =
                radius * radius + v * v -
                        lightFromOrigin.x * lightFromOrigin.x -
                        lightFromOrigin.y * lightFromOrigin.y -
                        lightFromOrigin.z * lightFromOrigin.z;

        if (hitDistance < 0)                                            // no hit (do this check now before bothering to do the sqrt below)
            return -1;

        hitDistance = v - (double)Math.sqrt(hitDistance);			    // get actual hit distance

        if (hitDistance < 0)
            return -1;
        else
            return hitDistance;
    }

    @Override
    public Vector3f GetSurfaceNormalAtPoint(Vector3f p) {
        Vector3f normal = Vector3f.subtract(p,position);
        normal.Normalise();
        return normal;
    }
}
