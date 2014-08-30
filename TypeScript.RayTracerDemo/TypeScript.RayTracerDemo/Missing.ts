declare var MersenneTwister: any;

   class Color
   {
      R: number;
      G: number;
      B: number;
      A: number;

      static BlueViolet = new Color(255,138, 43,226);  // #FF8A2BE2
      static Aquamarine = new Color(255,127,255,212);  // #FF7FFFD4 

      constructor(a:number, r:number, g:number, b:number)
      {
         this.A = a;
         this.R = r;
         this.G = g;
         this.B = b;
      }

      static FromArgb(a:number, r:number, g:number, b:number):Color 
      {
          return new Color(a>>0,r>>0,g>>0,b>>0);
      }
   }


   class Bitmap
   {
       width: number;
       height: number;

       canvas: HTMLCanvasElement;
       context: CanvasRenderingContext2D; 
       imagedata: ImageData;
                
       constructor(w:number,h:number)
       {
           this.width = w;
           this.height = h;

           this.canvas = <HTMLCanvasElement> document.getElementById("canvas");
           this.context = <CanvasRenderingContext2D> this.canvas.getContext("2d");
           this.context.globalCompositeOperation = "copy";  
           this.imagedata = this.context.createImageData(w,1);  // w,h
       }

       SetPixel(x:number,y:number,c:Color):void
       {           
           var index = x * 4;
           this.imagedata.data[index + 0] = c.R;
           this.imagedata.data[index + 1] = c.G;
           this.imagedata.data[index + 2] = c.B;
           this.imagedata.data[index + 3] = c.A;           
           //context.PutImageData(imagedata, x, y); 
           if(x==this.width-1) this.context.putImageData(this.imagedata, 0, y); 
       }

       Save(filename: string):void
       {
          // ignored
       }
   }


   class Stopwatch
   {
      start_time: Date;
      
      Restart()
      {
         this.start_time = this.getTime();
      }      

      ElapsedMilliseconds(): number
      {
         return this.getTime().valueOf() - this.start_time.valueOf();
      }
      
      getTime(): Date
      {
         return new Date();
      }
   }

    class MyConsole
    {        
        static WriteLine(msg: string):void
        {
           this.Write(msg+"<br>");
        }
        
        static Write(msg: string):void
        {
            document.getElementById('log').innerHTML += msg;
        }        
    }
   
   class Random
   {
      mt: any;

      constructor(seed: number)
      {
         this.mt = new MersenneTwister(seed);
      }
      
      NextDouble(): number
      {
         return this.mt.genrand_real1();
      }

      Next(maxValue: number): number
      {
          var real = this.mt.genrand_real1();
          return Math.floor(real * maxValue);
      }
   }    


