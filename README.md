# RayTracerDemo

In this project, the same raytracer program was written in C#, Dart, Java and TypeScript.

Sources were then compiled to JavaScript with their respective compilers and run on all major browsers. 
They were run also on their respective virtual machines (where available).

The raytracer builds a 3d scene made of 300 reflecting spheres randomly placed on the space over a plane surface.

The time elapsed to render a 640x480 image of the scene was measured and the result is tabled here: 

```
Environment               Elapsed time (secs) 
============================================
Java native JVM on Windows              5,2
TypeScript to Javascript on Chrome      8,3
Dart VM (unchecked mode) on Dartium    10,1
C# to javascript on Chrome             15,0
Java to JavaScript (GWT) on Chrome     15,5
TypeScript to Javascript on Firefox    24,3
C# to javascript on Firefox            26,9
Dart VM (checked mode) on Dartium      27,3
dart2js on Chrome                      35,3
C# native (CLR) on Windows             40,1
Java to JavaScript (GWT) on Explorer   51,6
TypeScript to Javascript on Explorer   57,4
C# to javascript on Explorer           60,6
Java to JavaScript (GWT) on Firefox   109,9
dart2js on Explorer                   212,1
dart2js on Firefox                    218,9
```

## Machine used for the test:

* AMD Athlon II X4 640 processor running @3GHZ
* Windows 7 PC, 64 bits, 8GB Ram
* Firefox 31.0 
* Chrome 36.0 
* Explorer 11.0.11
* Dart SDK 1.5.8
* Java 1.7
* .NET 4.5.1

## The RayTracer program

The raytracer program used in this test was originally written in C# by IainC in 2009 (license info included in the source) 
and firstly appeared as a demo for the JSIL compiler. 

When I started to play with Dart, I wrote a port for this raytracer in order to compare Dart to C#. Eventually a Java and TypeScript 
version were added, making this test become a test among the major Web development languages.

## Run the test yourself

Here's how to build and run the program by yourself:

### C# - Saltarelle compiler

Windows only:

* open the folder `Saltarelle.RaytracerDemo`
* open the `.sln` file in Visual Studio 2013
* open nuget console and type `update-package`, this will download the compiler
* rebuild the solution
* open the file `index.html` inside the `WebSite` folder with your browser

### C# - Native CLR

For Windows:

* open the folder `CSharp.RaytracerDemo`
* open the `.sln` file in Visual Studio 2013
* build 
* launch CSharp.RayTracerDemo.exe from `bin\Release\` folder
* click on the button to render the image

### C# - Mono virtual machine

* install Mono (tested with 3.2.3)
* add `Mono-3.2.3\bin` to `PATH` variable 
* from command prompt go to `CSharp.RaytracerDemo\CSharp.RaytracerDemo`
* run `build_mono.bat`
* launch `Mono_RaytracerDemo.exe`
* click on the button to render the image

### Dart

All systems, with DartEditor:

* from DartEditor open the folder `Dart.RayTracerDemo`
* from menu 'Pub build' to generate the JavaScript files
* open the `build` directory and launch `index.html`
* Dart native VM (Dartium) can be run directly from the editor (`Manage Launches`)

### Java GWT

All systems, requires Java and Maven installed:

* from shell cd to `JavaGWT.RaytracerDemo`
* type `mvn clean package` and wait build to complete
* open directory `javaraytracerdemo-1.0-SNAPSHOT`
* launch with your browser `gwt_raytracerdemo.html`   

### Java native

All systems, requires Java and Maven installed:

* from shell cd to `JavaGWT.RaytracerDemo`
* type `mvn clean package` and wait build to complete
* type `java -cp target/javaraytracerdemo-1.0-SNAPSHOT/WEB-INF/classes io.github.timeu.javagwtraytracerdemo.server.App`
* The image isn't displayed but is calculated in memory.

### TypeScript

Windows only:

* open the folder `TypeScript.RaytracerDemo`
* open the `.sln` file in Visual Studio 2013
* rebuild the solution
* open the file `index.html` inside the `WebSite` folder with your browser

# History

31-Aug-2014:
  C# native changed "class" to "struct" in Vector3f to take advantage of value types
  Added build with Mono batch file  

30-Aug-2014:
  Fixed Java native version of MersenneTwister 
  Converted Java native to double to make it comparable with other implementations
  Converted C# native to double to make it comparable with other implementations
  Added checksum to the rendered scene to make sure it's pixel-exact correct

29-Aug-2014:
  Made native C# render on screen instead of memory
  Fixed native C# random bug, implemented MersenneTwister natively
    
26-Aug-2014:
  Added Java GTW and JVM implementation
  
24-Aug-2014:
  Added Typescript implementation
  
23-Aug-2014:
  Added C# native (CLR) implementation
   
22-Aug-2014: 
  First release featuring Dart and C#