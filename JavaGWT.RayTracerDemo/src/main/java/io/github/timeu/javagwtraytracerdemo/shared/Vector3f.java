package io.github.timeu.javagwtraytracerdemo.shared;

/**
 * Created by uemit.seren on 8/25/14.
 */
public class Vector3f {

    public double x;
    public double y;
    public double z;

    public Vector3f(double x, double y, double z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public double Dot(Vector3f b) {
        return (x * b.x + y * b.y + z * b.z);
    }

    public void Normalise() {
        final double f = (double)(1.0f / Math.sqrt(x*x + y*y + z*z));
        x *= f;
        y *= f;
        z *= f;
    }

    public double magnitude() {
        return (double)Math.sqrt(x*x + y*y + z*z);
    }


    public static Vector3f subtract(Vector3f a, Vector3f b) {
        return new Vector3f(a.x - b.x, a.y - b.y, a.z - b.z);
    }

    public static Vector3f subtract(Vector3f a) {
        return new Vector3f(-a.x, -a.y, -a.z);
    }

    public static Vector3f multiply(Vector3f a, double b) {
        return new Vector3f(a.x * b, a.y * b, a.z * b);
    }

    public static Vector3f divide(Vector3f a, double b) {
        return new Vector3f(a.x / b, a.y / b, a.z / b);
    }

    public static Vector3f add(Vector3f a, Vector3f b) {
        return new Vector3f(a.x + b.x, a.y + b.y, a.z + b.z);
    }

    public Vector3f ReflectIn(Vector3f normal) {
        Vector3f negVector = subtract(this);
        Vector3f reflectedDir = subtract(multiply(normal,(2.0f * negVector.Dot(normal))),negVector);
        return reflectedDir;
    }

}
