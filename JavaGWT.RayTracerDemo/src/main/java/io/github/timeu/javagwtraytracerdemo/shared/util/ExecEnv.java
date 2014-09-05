package io.github.timeu.javagwtraytracerdemo.shared.util;

public interface ExecEnv {
    void WriteLine(String s);
    void Write(String s);
    void WriteSpeedText(String text);

    void RenderRow(final Bitmap canvas, final int dotPeriod, final int y);
}
