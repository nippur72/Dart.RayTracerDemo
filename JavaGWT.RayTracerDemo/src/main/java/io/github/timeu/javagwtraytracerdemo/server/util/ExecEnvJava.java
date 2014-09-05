package io.github.timeu.javagwtraytracerdemo.server.util;

import io.github.timeu.javagwtraytracerdemo.shared.RayTracer;
import io.github.timeu.javagwtraytracerdemo.shared.util.Bitmap;
import io.github.timeu.javagwtraytracerdemo.shared.util.ExecEnv;

import java.util.Timer;
import java.util.TimerTask;

public class ExecEnvJava implements ExecEnv {

    private static final Timer timer = new Timer();

    @Override
    public void WriteLine(String s) {
        System.out.println(s);
    }

    @Override
    public void Write(String s) {
        System.out.print(s);
    }

    @Override
    public void WriteSpeedText(String text) {
        System.out.println(text);
    }

    /** @param timeoutMs */
    private static void SetTimeout(int timeoutMs, final TimerTask action) {
        timer.schedule(action, 0);
    }

    @Override
    public void RenderRow(final Bitmap canvas, final int dotPeriod, final int y) {
        SetTimeout(0, new TimerTask() {
            @Override
            public void run() {
                RayTracer.RenderRow(canvas, dotPeriod, y);
            }
        });
    }

}
