package io.github.timeu.javagwtraytracerdemo.server.util;

import io.github.timeu.javagwtraytracerdemo.server.MersenneTwister;

/**
 * Created by uemit.seren on 8/25/14.
 */
public class Random {
    MersenneTwister mt;

    public Random(int seed) {        
        mt = new MersenneTwister(seed);
    }

    public double NextDouble()
    {
        return mt.genrand_real1();
    }

    public int Next(double maxValue)
    {
        double real = this.mt.genrand_real1();
        return (int)Math.floor(real * maxValue);
    }       
}

