package io.github.timeu.javagwtraytracerdemo.client.util;

import com.google.gwt.canvas.dom.client.Context2d;
import com.google.gwt.canvas.dom.client.ImageData;
import com.google.gwt.dom.client.CanvasElement;
import com.google.gwt.user.client.DOM;
import io.github.timeu.javagwtraytracerdemo.shared.Color;

/**
 * Created by uemit.seren on 8/25/14.
 */
public class Bitmap {

    private int width;
    private int height;
    CanvasElement _canvas;
    Context2d _context;
    ImageData _imagedata;
    public Bitmap(int w, int h)
    {
        width = w;
        height = h;

        _canvas = DOM.getElementById("canvas").cast();
        _context = _canvas.getContext2d();
        _context.setGlobalCompositeOperation(Context2d.Composite.COPY);
        _imagedata = _context.createImageData(w,1);  // w,h
    }

    public void SetPixel(int x, int y, Color c)
    {
        int index = x * 4;
        _imagedata.getData().set((index + 0),c.R);
        _imagedata.getData().set((index + 1),c.G);
        _imagedata.getData().set((index + 2),c.B);
        _imagedata.getData().set((index + 3),c.A);
        //context.PutImageData(imagedata, x, y);
        if(x==width-1) _context.putImageData(_imagedata, 0, y);
    }

    public void Save(String filename)
    {
        // ignored
    }
}
