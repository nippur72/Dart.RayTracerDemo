package io.github.timeu.javagwtraytracerdemo.server.util;

import io.github.timeu.javagwtraytracerdemo.shared.util.Stopwatch;

public class StopwatchJava implements Stopwatch {

    private long started;

    @Override
    public void Restart() {
        started = System.currentTimeMillis();
    }

    @Override
    public double ElapsedMilliseconds() {
        return System.currentTimeMillis() - started;
    }

}
