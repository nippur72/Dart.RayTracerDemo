package io.github.timeu.javagwtraytracerdemo.shared;

import java.util.Date;

/**
 * Created by uemit.seren on 8/25/14.
 */
public class Stopwatch {

    Date start_time;

    public void Restart()
    {
        start_time = new Date();
    }

    public long ElapsedMilliseconds() {
        return (getTime().getTime() - start_time.getTime());
    }

    public Date getTime()
    {
        return new Date();
    }
}
