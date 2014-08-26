package io.github.timeu.javagwtraytracerdemo.shared;

/**
 * Created by uemit.seren on 8/25/14.
 */
public class Color {

    public int R;
    public int G;
    public int B;
    public int A;

    public static Color blueViolet() {
        return new Color(255,138, 43,226);  // #FF8A2BE2
    }

    public static Color aquamarine() {
        return new Color(255,127,255,212);  // #FF7FFFD4
    }

    public Color(int a, int r, int g, int b)
    {
        A = a;
        R = r;
        G = g;
        B = b;
    }

    public static Color FromArgb(int a, int r, int g, int b)
    {
        return new Color(a,r,g,b);
    }
}
