package io.github.timeu.javagwtraytracerdemo.client.util;

import com.google.gwt.dom.client.Element;
import com.google.gwt.user.client.DOM;

/**
 * Created by uemit.seren on 8/25/14.
 */
public class Console {

    public static void WriteLine(String msg)
    {
        Write(msg+"<br>");
    }

    public static void Write(String msg)
    {
        Element el = DOM.getElementById("log");
        el.setInnerHTML(el.getInnerHTML()+msg);
    }
}
