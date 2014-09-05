package io.github.timeu.javagwtraytracerdemo.shared.util;

public interface Random {

    public abstract void newSeed(int seed);
    public abstract double NextDouble();
    public abstract int Next(double maxValue);
}
