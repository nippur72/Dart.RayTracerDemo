namespace CSharp.RayTracerDemo
{
   partial class MainForm
   {
      /// <summary>
      /// Variabile di progettazione necessaria.
      /// </summary>
      private System.ComponentModel.IContainer components = null;

      /// <summary>
      /// Pulire le risorse in uso.
      /// </summary>
      /// <param name="disposing">ha valore true se le risorse gestite devono essere eliminate, false in caso contrario.</param>
      protected override void Dispose(bool disposing)
      {
         if (disposing && (components != null))
         {
            components.Dispose();
         }
         base.Dispose(disposing);
      }

      #region Codice generato da Progettazione Windows Form

      /// <summary>
      /// Metodo necessario per il supporto della finestra di progettazione. Non modificare
      /// il contenuto del metodo con l'editor di codice.
      /// </summary>
      private void InitializeComponent()
      {
         this.button1 = new System.Windows.Forms.Button();
         this.label1 = new System.Windows.Forms.Label();
         this.pictureBox1 = new System.Windows.Forms.PictureBox();
         this.log = new System.Windows.Forms.Label();
         ((System.ComponentModel.ISupportInitialize)(this.pictureBox1)).BeginInit();
         this.SuspendLayout();
         // 
         // button1
         // 
         this.button1.Location = new System.Drawing.Point(21, 12);
         this.button1.Name = "button1";
         this.button1.Size = new System.Drawing.Size(133, 23);
         this.button1.TabIndex = 0;
         this.button1.Text = "Render scene";
         this.button1.UseVisualStyleBackColor = true;
         this.button1.Click += new System.EventHandler(this.button1_Click);
         // 
         // label1
         // 
         this.label1.AutoSize = true;
         this.label1.Font = new System.Drawing.Font("Consolas", 11.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
         this.label1.Location = new System.Drawing.Point(18, 524);
         this.label1.Name = "label1";
         this.label1.Size = new System.Drawing.Size(56, 18);
         this.label1.TabIndex = 1;
         this.label1.Text = "Speed ";
         // 
         // pictureBox1
         // 
         this.pictureBox1.Location = new System.Drawing.Point(21, 41);
         this.pictureBox1.Name = "pictureBox1";
         this.pictureBox1.Size = new System.Drawing.Size(640, 480);
         this.pictureBox1.TabIndex = 2;
         this.pictureBox1.TabStop = false;
         // 
         // log
         // 
         this.log.AutoSize = true;
         this.log.Font = new System.Drawing.Font("Consolas", 12F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
         this.log.Location = new System.Drawing.Point(17, 542);
         this.log.Name = "log";
         this.log.Size = new System.Drawing.Size(36, 19);
         this.log.TabIndex = 3;
         this.log.Text = "Log";
         // 
         // MainForm
         // 
         this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
         this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
         this.BackColor = System.Drawing.Color.White;
         this.ClientSize = new System.Drawing.Size(998, 679);
         this.Controls.Add(this.log);
         this.Controls.Add(this.pictureBox1);
         this.Controls.Add(this.label1);
         this.Controls.Add(this.button1);
         this.Name = "MainForm";
         this.Text = "C# native RayTracer demo";
         ((System.ComponentModel.ISupportInitialize)(this.pictureBox1)).EndInit();
         this.ResumeLayout(false);
         this.PerformLayout();

      }

      #endregion

      private System.Windows.Forms.Button button1;
      public System.Windows.Forms.Label label1;
      private System.Windows.Forms.PictureBox pictureBox1;
      public System.Windows.Forms.Label log;
   }
}

