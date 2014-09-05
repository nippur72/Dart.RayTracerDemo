package io.github.timeu.javagwtraytracerdemo.client.util;

import io.github.timeu.javagwtraytracerdemo.client.MersenneTwisterJs;
import io.github.timeu.javagwtraytracerdemo.shared.util.Random;

public class RandomGwt implements Random {

    private MersenneTwisterJs mt;

    @Override
    public void newSeed(int seed) {
        mt = MersenneTwisterJs.create(seed);
        //mt = new MersenneTwisterFast(seed);
    }

    @Override
    public double NextDouble() {
        return mt.nextDouble();
    }

    @Override
    public int Next(double maxValue) {
        double n = this.mt.nextDouble();
        return (int) Math.floor(n * maxValue);
    }

}
