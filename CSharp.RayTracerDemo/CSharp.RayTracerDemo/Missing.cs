using System;
using System.Collections.Generic;
using System.Runtime.CompilerServices;

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

   public class Bitmap
   {
       private int width;
       private int height;
       /*
       private CanvasElement canvas;
       private CanvasRenderingContext2D context; // ### it was: CanvasContext2D
       private ImageData imagedata;
       */         
       public Bitmap(int w, int h)
       {
       /*
           width = w;
           height = h;

           canvas = (CanvasElement) Document.GetElementById("canvas");
           context = (CanvasRenderingContext2D) canvas.GetContext(CanvasContextId.Render2D); // "2d"    
           context.GlobalCompositeOperation = CompositeOperation.Copy;  // ### it was: CompositeOperation         
           imagedata = context.CreateImageData(w,1);  // w,h
       */
       }

       public void SetPixel(int x, int y, Color c)
       {           
       /*
           int index = x * 4;
           imagedata.Data[index + 0] = (byte) c.R;
           imagedata.Data[index + 1] = (byte) c.G;
           imagedata.Data[index + 2] = (byte) c.B;
           imagedata.Data[index + 3] = (byte) c.A;           
           //context.PutImageData(imagedata, x, y); 
           if(x==width-1) context.PutImageData(imagedata, 0, y); 
       */
       }

       public void Save(string filename)
       {
          // ignored
       }
   }   

    /*
    public class Console
    {
        //[InlineCode("document.getElementById('log').innerHTML = ({msg} + '\n')")]
        public static void WriteLine(string msg)
        {
           Write(msg+"<br>");
        }

        //[InlineCode("document.getElementById('log').innerHTML += {msg}")]
        public static void Write(string msg)
        {

        }        
    }
    */

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

   //[Imported]
   public class MersenneTwister
   {                                         
        //[InlineCode("new MersenneTwister({seed})")]  
        public MersenneTwister(int seed)
        {
        }

        //[InlineCode("{this}.genrand_real1()")]  
        public float genrand_real1()
        {
           return 0;
        }
   }
   
   public class Random
   {
      MersenneTwister mt;

      public Random(int seed)
      {
         mt = new MersenneTwister(seed);
      }
      
      public double NextDouble()
      {
         return mt.genrand_real1();
      }

      public int Next(float maxValue)
      {
          float real = this.mt.genrand_real1();
          return FloorInt(real * maxValue);
      }

      //[InlineCode("Math.floor({value})")]
      public static int FloorInt(float value)
      {
          return (int) Math.Floor(value);
      }
   }    
}

