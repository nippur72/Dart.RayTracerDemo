package io.github.timeu.javagwtraytracerdemo.server.util;

import io.github.timeu.javagwtraytracerdemo.shared.Color;

/**
 * Created by uemit.seren on 8/25/14.
 */
public class Bitmap {

    private int width;
    private int height;
    public Bitmap(int w, int h)
    {
        width = w;
        height = h;

    }

    public void SetPixel(int x, int y, Color c)
    {
    }

    public void Save(String filename)
    {
        // ignored
    }
}
