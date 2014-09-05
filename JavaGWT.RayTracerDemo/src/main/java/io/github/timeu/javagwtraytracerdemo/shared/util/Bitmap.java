package io.github.timeu.javagwtraytracerdemo.shared.util;

import io.github.timeu.javagwtraytracerdemo.shared.Color;

public interface Bitmap {
    public abstract void init(int w, int h);
    public abstract void SetPixel(int x, int y, Color c);
    public abstract void Save(String filename);
}
