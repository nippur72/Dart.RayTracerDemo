package io.github.timeu.javagwtraytracerdemo.server.util;

import io.github.timeu.javagwtraytracerdemo.shared.Color;
import io.github.timeu.javagwtraytracerdemo.shared.util.Bitmap;

public class BitmapJava implements Bitmap {

    @SuppressWarnings("unused")
    private int width;
    @SuppressWarnings("unused")
    private int height;

    @Override
    public void init(int w, int h) {
        width = w;
        height = h;
    }

    @Override
    public void SetPixel(int x, int y, Color c) {
    }

    @Override
    public void Save(String filename) {
    }

}
