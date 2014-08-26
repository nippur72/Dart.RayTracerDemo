package io.github.timeu.javagwtraytracerdemo.client;

import com.google.gwt.core.client.EntryPoint;
import com.google.gwt.event.dom.client.ClickEvent;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.user.client.DOM;
import com.google.gwt.user.client.ui.Button;


/**
 * Created by uemit.seren on 8/25/14.
 */
public class GwtRayTracerDemo implements EntryPoint {

    Button btn;

    @Override
    public void onModuleLoad() {
        btn = Button.wrap(DOM.getElementById("runButton"));
        btn.addClickHandler(new ClickHandler() {
            @Override
            public void onClick(ClickEvent event) {
                RayTracer.Mainx();
            }
        });
    }
}
