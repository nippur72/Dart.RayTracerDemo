var Color = (function () {
    function Color(a, r, g, b) {
        this.A = a;
        this.R = r;
        this.G = g;
        this.B = b;
    }
    Color.FromArgb = function (a, r, g, b) {
        return new Color(a >> 0, r >> 0, g >> 0, b >> 0);
    };
    Color.BlueViolet = new Color(255, 138, 43, 226);
    Color.Aquamarine = new Color(255, 127, 255, 212);
    return Color;
})();

var Bitmap = (function () {
    function Bitmap(w, h) {
        this.width = w;
        this.height = h;

        this.canvas = document.getElementById("canvas");
        this.context = this.canvas.getContext("2d");
        this.context.globalCompositeOperation = "copy";
        this.imagedata = this.context.createImageData(w, 1); // w,h
    }
    Bitmap.prototype.SetPixel = function (x, y, c) {
        var index = x * 4;
        this.imagedata.data[index + 0] = c.R;
        this.imagedata.data[index + 1] = c.G;
        this.imagedata.data[index + 2] = c.B;
        this.imagedata.data[index + 3] = c.A;

        //context.PutImageData(imagedata, x, y);
        if (x == this.width - 1)
            this.context.putImageData(this.imagedata, 0, y);
    };

    Bitmap.prototype.Save = function (filename) {
        // ignored
    };
    return Bitmap;
})();

var Stopwatch = (function () {
    function Stopwatch() {
    }
    Stopwatch.prototype.Restart = function () {
        this.start_time = this.getTime();
    };

    Stopwatch.prototype.ElapsedMilliseconds = function () {
        return this.getTime().valueOf() - this.start_time.valueOf();
    };

    Stopwatch.prototype.getTime = function () {
        return new Date();
    };
    return Stopwatch;
})();

var MyConsole = (function () {
    function MyConsole() {
    }
    MyConsole.WriteLine = function (msg) {
        this.Write(msg + "<br>");
    };

    MyConsole.Write = function (msg) {
        document.getElementById('log').innerHTML += msg;
    };
    return MyConsole;
})();

var Random = (function () {
    function Random(seed) {
        this.mt = new MersenneTwister(seed);
    }
    Random.prototype.NextDouble = function () {
        return this.mt.genrand_real1();
    };

    Random.prototype.Next = function (maxValue) {
        var real = this.mt.genrand_real1();
        return Math.floor(real * maxValue);
    };
    return Random;
})();
//# sourceMappingURL=Missing.js.map
