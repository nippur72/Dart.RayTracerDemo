package io.github.timeu.javagwtraytracerdemo.client;

import io.github.timeu.javagwtraytracerdemo.client.util.BitmapGwt;
import io.github.timeu.javagwtraytracerdemo.client.util.ExecEnvGwt;
import io.github.timeu.javagwtraytracerdemo.client.util.RandomGwt;
import io.github.timeu.javagwtraytracerdemo.client.util.StopwatchGwt;
import io.github.timeu.javagwtraytracerdemo.shared.RayTracer;

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
                RayTracer.Mainx(new RandomGwt(), new BitmapGwt(), new StopwatchGwt(), new ExecEnvGwt());
            }
        });
    }
}
