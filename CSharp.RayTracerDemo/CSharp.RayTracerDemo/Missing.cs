using System;
using System.Collections.Generic;
using System.Runtime.CompilerServices;
using CSharp.RayTracerDemo;

namespace Missing
{
   public class Color
   {
      public int R;
      public int G;
      public int B;
      public int A;

      public static Color BlueViolet
      { 
        get
        { 
           return new Color(255,138, 43,226);  // #FF8A2BE2
        }
      }
      public static Color Aquamarine 
      {
        get
        {
           return new Color(255,127,255,212);  // #FF7FFFD4
        }
      }

      public Color(int a, int r, int g, int b)
      {
         A = a;
         R = r;
         G = g;
         B = b;
      }

      public static Color FromArgb(int a, int r, int g, int b)
      {
          return new Color(a,r,g,b);
      }
   }

   public static class BitMapExtensions
   {
      public static void SetPixel(this System.Drawing.Bitmap bitmap, int x, int y, Color c)
      {
         System.Drawing.Color col = System.Drawing.Color.FromArgb(c.A, c.R, c.G, c.B);
         bitmap.SetPixel(x,y,col);
         if(x==639) Document.canvas.Refresh();
      }
   }
  
   public class Stopwatch
   {
      DateTime start_time;
      
      public void Restart()
      {
         start_time = DateTime.Now;
      }      

      public int ElapsedMilliseconds
      {
          get
          {
              return (getTime() - start_time).Milliseconds;
          }
      }
      
      public DateTime getTime()
      {
         return DateTime.Now;
      }
   }    
   
   public class Random
   {
      MersenneTwister mt;

      public Random(uint seed)
      {
         mt = new MersenneTwister(seed);
      }
      
      public double NextDouble()
      {
         return mt.genrand_real1();
      }

      public int Next(float maxValue)
      {
          float real = (float) this.mt.genrand_real1();
          return FloorInt(real * maxValue);
      }
      
      public static int FloorInt(float value)
      {
          return (int) Math.Floor(value);
      }
   }    
}

