package io.github.timeu.javagwtraytracerdemo.shared;

/**
 * Created by uemit.seren on 8/25/14.
 */
public abstract class RTObject {
    public Color color;

    public abstract double Intersect(Ray ray);

    public abstract Vector3f GetSurfaceNormalAtPoint(Vector3f p);

}
