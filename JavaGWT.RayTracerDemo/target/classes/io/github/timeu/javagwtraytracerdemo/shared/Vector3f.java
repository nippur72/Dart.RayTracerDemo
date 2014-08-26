package io.github.timeu.javagwtraytracerdemo.shared;

/**
 * Created by uemit.seren on 8/25/14.
 */
public class Vector3f {

    public float x;
    public float y;
    public float z;

    public Vector3f(float x, float y, float z) {
        this.x = x;
        this.y = y;
        this.z  = z;
    }

    public float Dot(Vector3f b) {
        return (x * b.x + y * b.y + z * b.z);
    }

    public void Normalise() {
        float f = (float)(1.0f / Math.sqrt(this.Dot(this)));
        x *= f;
        y *= f;
        z *= f;
    }

    public float magnitude() {
        return (float)Math.sqrt(x*x + y*y + z*z);
    }


    public static Vector3f subtract(Vector3f a, Vector3f b) {
        return new Vector3f(a.x - b.x, a.y - b.y, a.z - b.z);
    }

    public static Vector3f subtract(Vector3f a) {
        return new Vector3f(-a.x, -a.y, -a.z);
    }

    public static Vector3f multiply(Vector3f a, float b) {
        return new Vector3f(a.x * b, a.y * b, a.z * b);
    }

    public static Vector3f divide(Vector3f a, float b) {
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
