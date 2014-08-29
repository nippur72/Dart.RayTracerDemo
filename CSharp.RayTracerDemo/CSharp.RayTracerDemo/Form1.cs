using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace CSharp.RayTracerDemo
{
   public partial class MainForm : Form
   {
      public MainForm()
      {
         InitializeComponent();
         Document.form = this;
         Document.canvas = this.pictureBox1;
         Document.labelSpeed = this.label1;
      }

      private void button1_Click(object sender, EventArgs e)
      {        
         simpleray.RayTracer.Main();
      }
   }

   // mocks browser DOM document
   public static class Document
   {
      public static MainForm form;
      public static PictureBox canvas;      
      public static Label labelSpeed;
   }
}
