package io.github.timeu.javagwtraytracerdemo.shared;

/**
 * Created by uemit.seren on 8/25/14.
 */
public class Ray {
    public static float WORLD_MAX = 1000.0f;

    public Vector3f origin;
    public Vector3f direction;

    public RTObject closestHitObject;
    public float closestHitDistance;
    public Vector3f hitPoint;

    public Ray(Vector3f o, Vector3f d) {
        origin = o;
        direction = d;
        closestHitDistance = WORLD_MAX;
        closestHitObject = null;
    }
}
