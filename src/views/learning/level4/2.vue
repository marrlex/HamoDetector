<template lang="pug">
  v-container
    v-row
      v-col(cols="12")
        h3 倍音成分の計算（フーリエ級数展開）
        p
          | ここでは実際に、音に倍音が含まれることを証明します。
          | 具体的には、方形波、三角波、鋸波に対して含まれる倍音を求めていきます。
          | 内容は数学でやれって感じです。
        p
          | まず、倍音を求める方法ですが、フーリエ級数展開と呼ばれる展開を行います。
          | 簡単に言えば、周期関数はなんとかして$\sin$と$\cos$の和で表せるだろうから、その式を求めようというものです。
        p
          | 三角関数では、どう頑張ってもその平均値は0になりますから、周期関数を上下に動かして、平均値を0にする必要があります。
          | この動かした分は、直流成分と呼ばれています。
          | 以上から、周期関数は次のような級数
          | $$
          | f(t) = a_0 + \sum_{n=1}{\infty} (a_n \cos(2\pi nft) + b_n \sin(2\pi nft))
          | $$
          | で表せます。これがフーリエ級数と呼ばれるもので、周期関数をこのような級数の形に表すことをフーリエ級数展開と言います。
          | 定数項$a_0$が直流成分なのですが、歴史的には$a_0/2$とする流儀もあります。
        p
          | この級数自体は、定数、全ての周波数の余弦関数、すべての周波数の正弦関数の三つが、互いに直交していることからこの三つで三次元ベクトルを作り、基底をなすことができるからこのような表現ができます。
        p
          | さて、数学的な話は置いといて、求めたいのはそれぞれの成分の係数$a_0$、$a_n$、$b_n$です。これらはそれぞれ、基音の$n$倍の倍音の振幅と見れます。
          | 証明などは専門書や外のサイトなどに放っておいて、結果から言えばそれぞれ次のような式で求めることができます。
</template>
