package io.github.timeu.javagwtraytracerdemo.server.util;

/**
 * Created by uemit.seren on 8/25/14.
 */
public class Console {

    public static void WriteLine(String msg)
    {
        Write(msg+"<br>");
    }

    public static void Write(String msg)
    {
        System.out.println(msg);
    }
}
