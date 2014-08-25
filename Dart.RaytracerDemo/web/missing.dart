import "dart:html";
import "dart:js";

class Color
{
   int R;
   int G;
   int B;
   int A;

   static Color get BlueViolet => new Color(255,138, 43,226);  // #FF8A2BE2
           
   static Color get Aquamarine => new Color(255,127,255,212);  // #FF7FFFD4

   Color(this.A, this.R, this.G, this.B);

   static Color FromArgb(int a, int r, int g, int b)
   {
       return new Color(a,r,g,b);
   }
}

class Bitmap
{
    int _width;
    int _height;

    CanvasElement _canvas;
    CanvasRenderingContext2D _context; // ### it was: CanvasContext2D
    ImageData _imagedata;
             
    Bitmap(int w, int h)
    {
        _width = w;
        _height = h;

        _canvas = querySelector("#canvas");           
        _context = _canvas.context2D;     
        _context.globalCompositeOperation = "copy"; // ### was: CompositeOperation.Copy;  // ### it was: CompositeOperation         
        _imagedata = _context.createImageData(w,1);  // w,h
    }

    void SetPixel(int x, int y, Color c)
    {           
        int index = x * 4;
        _imagedata.data[index + 0] = c.R;
        _imagedata.data[index + 1] = c.G;
        _imagedata.data[index + 2] = c.B;
        _imagedata.data[index + 3] = c.A;           
        //context.PutImageData(imagedata, x, y); 
        if(x==_width-1) _context.putImageData(_imagedata, 0, y); 
    }

    void Save(String filename)
    {
       // ignored
    }
}

   class Stopwatch
   {
      int start_time;
      
      void Restart()
      {
         start_time = getTime();
      }      

      int get ElapsedMilliseconds => getTime() - start_time;          

      //[InlineCode("new Date().getTime()")]
      int getTime()
      {
         return new DateTime.now().millisecondsSinceEpoch;
      }
   }
   
 class Console
 {        
     static void WriteLine(String msg)
     {
        Write(msg+"<br>");
     }

     //[InlineCode("document.getElementById('log').innerHTML += {msg}")]
     static void Write(String msg)
     {
        var el = querySelector("#log");
        el.innerHtml += msg;
     }        
 }

class MersenneTwister
{                                         
     JsObject _mt;
           
     MersenneTwister(int seed)
     {
        _mt = new JsObject(context['MersenneTwister'],[seed]); 
     }
  
     double genrand_real1()
     {
        return _mt.callMethod("genrand_real1") as double;
     }
}

class Random
{
   MersenneTwister mt;

   Random(int seed)
   {
      mt = new MersenneTwister(seed);
   }
   
   double NextDouble()
   {
      return mt.genrand_real1();
   }

   int Next(double maxValue)
   {
       double real = this.mt.genrand_real1();
       return FloorInt(real * maxValue);
   }
   
   static int FloorInt(double value)
   {
       return value.floor();
   }
}    

