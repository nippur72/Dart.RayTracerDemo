package io.github.timeu.javagwtraytracerdemo.client.util;

import io.github.timeu.javagwtraytracerdemo.shared.Color;
import io.github.timeu.javagwtraytracerdemo.shared.util.Bitmap;

import com.google.gwt.canvas.dom.client.CanvasPixelArray;
import com.google.gwt.canvas.dom.client.Context2d;
import com.google.gwt.canvas.dom.client.ImageData;
import com.google.gwt.dom.client.CanvasElement;
import com.google.gwt.user.client.DOM;

public class BitmapGwt implements Bitmap {
    private int width;
    @SuppressWarnings("unused")
    private int height;
    CanvasElement _canvas;
    Context2d _context;
    ImageData _imagedata;

    @Override
    public void init(int w, int h) {
        width = w;
        height = h;

        _canvas = DOM.getElementById("canvas").cast();
        _context = _canvas.getContext2d();
        _context.setGlobalCompositeOperation(Context2d.Composite.COPY);
        _imagedata = _context.createImageData(w, 1); // w,h
    }

    @Override
    public void SetPixel(int x, int y, Color c) {
        int index = x * 4;
        CanvasPixelArray data = _imagedata.getData();
        data.set((index + 0), c.R);
        data.set((index + 1), c.G);
        data.set((index + 2), c.B);
        data.set((index + 3), c.A);
        //context.PutImageData(imagedata, x, y);
        if (x == width-1) _context.putImageData(_imagedata, 0, y);
    }

    @Override
    public void Save(String filename) {
        // ignored
    }
}
