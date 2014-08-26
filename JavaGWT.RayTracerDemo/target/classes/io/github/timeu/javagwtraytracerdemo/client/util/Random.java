package io.github.timeu.javagwtraytracerdemo.client.util;

import io.github.timeu.javagwtraytracerdemo.client.MersenneTwisterJs;

/**
 * Created by uemit.seren on 8/25/14.
 */
public class Random {

    MersenneTwisterJs mt;


    public Random(int seed) {
        mt = MersenneTwisterJs.create(seed);
        //mt = new MersenneTwisterFast(seed);

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
