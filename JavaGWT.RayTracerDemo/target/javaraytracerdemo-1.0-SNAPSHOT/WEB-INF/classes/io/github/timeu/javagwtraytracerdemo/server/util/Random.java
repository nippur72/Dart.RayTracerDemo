package io.github.timeu.javagwtraytracerdemo.server.util;

import io.github.timeu.javagwtraytracerdemo.server.MersenneTwisterFast;

/**
 * Created by uemit.seren on 8/25/14.
 */
public class Random {

    MersenneTwisterFast mt;


    public Random(int seed) {
        mt = new MersenneTwisterFast(seed);
    }

    public double NextDouble()
    {
        return mt.nextDouble();
    }

    public int Next(double maxValue)
    {
        double real = this.mt.nextDouble();
        return (int)Math.floor(real * maxValue);
    }
}
