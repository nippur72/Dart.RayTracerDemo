package io.github.timeu.javagwtraytracerdemo.shared;

/**
 * Created by uemit.seren on 8/25/14.
 */
public class Plane extends RTObject{
    public Vector3f normal;
    public float distance;

    public Plane(Vector3f n, float d, Color c) {
        normal = n;
        distance = d;
        color = c;
    }

    public float Intersect(Ray ray) {
        float normalDotRayDir = normal.Dot(ray.direction);
        if (normalDotRayDir == 0)   // Ray is parallel to plane (this early-out won't help very often!)
            return -1;

        // Any none-parallel ray will hit the plane at some point - the question now is just
        // if it in the positive or negative ray direction.
        float hitDistance = -(normal.Dot(ray.origin) - distance) / normalDotRayDir;

        if (hitDistance < 0)        // Ray dir is negative, ie we're behind the ray's origin
            return -1;
        else
            return hitDistance;
    }

    public Vector3f GetSurfaceNormalAtPoint(Vector3f p) {
        return normal;              // This is of course the same across the entire plane
    }
}
