package io.github.timeu.javagwtraytracerdemo.client.util;

import io.github.timeu.javagwtraytracerdemo.shared.util.Stopwatch;

import com.google.gwt.core.client.Duration;

public class StopwatchGwt implements Stopwatch {

    private double started;

    @Override
    public void Restart() {
        started = Duration.currentTimeMillis();
    }

    @Override
    public double ElapsedMilliseconds() {
        return Duration.currentTimeMillis() - started;
    }

}
