package io.github.timeu.javagwtraytracerdemo.server.util;

import io.github.timeu.javagwtraytracerdemo.server.MersenneTwister;
import io.github.timeu.javagwtraytracerdemo.shared.util.Random;

public class RandomJava implements Random {

    private MersenneTwister mt;

    @Override
    public void newSeed(int seed) {
        mt = new MersenneTwister(seed);
    }

    @Override
    public double NextDouble() {
        return mt.genrand_real1();
    }

    @Override
    public int Next(double maxValue) {
        double n = this.mt.genrand_real1();
        return (int) Math.floor(n * maxValue);
    }

}
