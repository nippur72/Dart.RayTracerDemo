using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

// Random number generator implementation derived from one by Sean McCullough (banksean@gmail.com)
// Original copyright notice for mersenne follows:
/*
Copyright (C) 1997 - 2002, Makoto Matsumoto and Takuji Nishimura,
All rights reserved.
Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions
are met:
1. Redistributions of source code must retain the above copyright
notice, this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright
notice, this list of conditions and the following disclaimer in the
documentation and/or other materials provided with the distribution.
3. The names of its contributors may not be used to endorse or promote
products derived from this software without specific prior written
permission.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
Any feedback is very welcome.
http://www.math.sci.hiroshima-u.ac.jp/~m-mat/MT/emt.html
email: m-mat @ math.sci.hiroshima-u.ac.jp (remove space)
*/


public class MersenneTwister
{
   uint N = 624;
   uint M = 397;
   uint MATRIX_A;
   uint UPPER_MASK;
   uint LOWER_MASK;

   uint[] mt;
   uint mti;

   public MersenneTwister(uint seed)
   {
     /* Period parameters */
     N = 624;
     M = 397;
     MATRIX_A = 0x9908b0df; /* constant vector a */
     UPPER_MASK = 0x80000000; /* most significant w-r bits */
     LOWER_MASK = 0x7fffffff; /* least significant r bits */
 
     mt = new uint[N]; /* the array for the state vector */
     mti = N+1; /* mti==N+1 means mt[N] is not initialized */

     init_genrand(seed);
  }

   /* initializes mt[N] with a seed */
  void init_genrand(uint s) {
     this.mt[0] = s >> 0;
     for (this.mti=1; this.mti<this.N; this.mti++) {
         s = this.mt[this.mti-1] ^ (this.mt[this.mti-1] >> 30);
         this.mt[this.mti] = (((((s & 0xffff0000) >> 16) * 1812433253) << 16) + (s & 0x0000ffff) * 1812433253) + this.mti;
         /* See Knuth TAOCP Vol2. 3rd Ed. P.106 for multiplier. */
         /* In the previous versions, MSBs of the seed affect */
         /* only MSBs of the array mt[]. */
         /* 2002/01/09 modified by Makoto Matsumoto */
         this.mt[this.mti] >>= 0;
         /* for >32 bit machines */
     }
   }
  
   /* generates a random number on [0,0xffffffff]-interval */
     uint genrand_int32() {
     uint y;
     uint[] mag01 = new uint[624];
     mag01[0] = 0x0;
     mag01[1] = this.MATRIX_A;

     /* mag01[x] = x * MATRIX_A for x=0,1 */

     if (this.mti >= this.N) { /* generate N words at one time */
       uint kk;

       if (this.mti == this.N+1) /* if init_genrand() has not been called, */
         this.init_genrand(5489); /* a default initial seed is used */

       for (kk=0;kk<this.N-this.M;kk++) {
         y = (this.mt[kk]&this.UPPER_MASK)|(this.mt[kk+1]&this.LOWER_MASK);
         this.mt[kk] = this.mt[kk+this.M] ^ (y >> 1) ^ mag01[y & 0x1];
       }
       for (;kk<this.N-1;kk++) {
         y = (this.mt[kk]&this.UPPER_MASK)|(this.mt[kk+1]&this.LOWER_MASK);
         this.mt[kk] = this.mt[kk+(this.M-this.N)] ^ (y >> 1) ^ mag01[y & 0x1];
       }
       y = (this.mt[this.N-1]&this.UPPER_MASK)|(this.mt[0]&this.LOWER_MASK);
       this.mt[this.N-1] = this.mt[this.M-1] ^ (y >> 1) ^ mag01[y & 0x1];

       this.mti = 0;
     }

     y = this.mt[this.mti++];

     /* Tempering */
     y ^= (y >> 11);
     y ^= (y << 7) & 0x9d2c5680;
     y ^= (y << 15) & 0xefc60000;
     y ^= (y >> 18);

     return y >> 0;
   }
 
   /* generates a random number on [0,1]-real-interval */
   public double genrand_real1() 
   {
      return this.genrand_int32()*(1.0/4294967295.0);
      /* divided by 2^32-1 */
   }
}

