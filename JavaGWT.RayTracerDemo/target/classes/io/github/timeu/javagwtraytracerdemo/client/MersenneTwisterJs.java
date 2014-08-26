package io.github.timeu.javagwtraytracerdemo.client;

import com.google.gwt.core.client.JavaScriptObject;

/**
 * Created by uemit.seren on 8/25/14.
 */
public class MersenneTwisterJs extends JavaScriptObject{


    protected MersenneTwisterJs() {

    }

    public native static MersenneTwisterJs create(int seed) /*-{
        return new $wnd.MersenneTwister(seed);
    }-*/;

    public final native double nextDouble() /*-{
        return this.genrand_real1();
    }-*/;
}
