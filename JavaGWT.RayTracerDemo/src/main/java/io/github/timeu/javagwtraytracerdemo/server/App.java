package io.github.timeu.javagwtraytracerdemo.server;

import io.github.timeu.javagwtraytracerdemo.server.util.BitmapJava;
import io.github.timeu.javagwtraytracerdemo.server.util.ExecEnvJava;
import io.github.timeu.javagwtraytracerdemo.server.util.RandomJava;
import io.github.timeu.javagwtraytracerdemo.server.util.StopwatchJava;
import io.github.timeu.javagwtraytracerdemo.shared.RayTracer;

public class App {
    public static void main(String[] args) {
        RayTracer.Mainx(new RandomJava(), new BitmapJava(), new StopwatchJava(), new ExecEnvJava());
    }
}
