package io.github.timeu.javagwtraytracerdemo.client.util;

import io.github.timeu.javagwtraytracerdemo.shared.RayTracer;
import io.github.timeu.javagwtraytracerdemo.shared.util.Bitmap;
import io.github.timeu.javagwtraytracerdemo.shared.util.ExecEnv;

import com.google.gwt.core.client.Scheduler;
import com.google.gwt.dom.client.Element;
import com.google.gwt.user.client.DOM;

public class ExecEnvGwt implements ExecEnv {

    private final Element log;
    private final Element speedElem;

    public ExecEnvGwt() {
        log = DOM.getElementById("log");
        speedElem = DOM.getElementById("speed");
    }

    @Override
    public void WriteLine(String s) {
        Write(s + "<br>");
    }

    @Override
    public void Write(String s) {
        log.setInnerHTML(log.getInnerHTML() + s);
    }

    @Override
    public void WriteSpeedText(String text) {
        speedElem.setInnerHTML(text);
    }

    /** @param timeoutMs */
    private static void SetTimeout(int timeoutMs, final Runnable action) {
        Scheduler.get().scheduleDeferred(new Scheduler.ScheduledCommand() {
            @Override
            public void execute() {
                action.run();
            }
        });
    }

    @Override
    public void RenderRow(final Bitmap canvas, final int dotPeriod, final int y) {
        SetTimeout(0, new Runnable() {
            @Override
            public void run() {
                RayTracer.RenderRow(canvas, dotPeriod, y);
            }
        });
    }

}
