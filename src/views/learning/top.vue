<template lang="pug">
  v-row
    v-col(cols="12")
      h1.display-2.font-weight-bold.mb-3
        | 純正律について
      p
        | このページでは、純正律について学んでいきます。
        | 中学生レベルの感覚的な理解から、より高レベルなものまで、レベル別に解説を行います。
        | 主に必要な知識や理解は、概ね次のようなものですから、参考にしてください。
        |
      ul
        li レベル１…中学生レベル：簡単な数学の知識と楽典の知識
        li レベル２…高校文系レベル：上記に加えて、より詳しい数学と物理基礎の知識、より詳しい楽典の知識
        li レベル３…高校理系レベル：上記に加えて、数学Ⅱ（三角関数、対数）の知識、専門物理の理解（知識は問わない）
        li レベル４…大学理系レベル：上記に加えて、微分積分学の知識
      br
      p
        | 既に完璧だと思う部分については適宜読み飛ばすといいでしょうが、
        | レベルは経験値を積んで順番に上げていくものですから、なるべく順に、せめて一度くらいは読むことをお勧めします。

    v-col(cols="12")
      h2 内容
      p 学習したい内容を選択してください。

    v-col(cols="6")
      v-card
        v-card-title レベル１ 
        ul
          li 
            v-btn(text to="/learning/level1/1") 音について
          li
            v-btn(text to="/learning/level1/2") 音階と音律、そして純正律
    v-col(cols="6")
      v-card
        v-card-title レベル２
        ul
          li
            v-btn(text to="/learning/level2/1") 自然倍音列
          li
            v-btn(text to="/learning/level2/2") ピタゴラス音律
          li
            v-btn(text to="/learning/level2/3") 純正律
    v-col(cols="6")
      v-card
        v-card-title レベル３
        ul
          li
            v-btn(text to="/learning/level3/1") どのようにうなりは生じるか
          li
            v-btn(text to="/learning/level3/2") 純正律再考
          li
            v-btn(text to="/learning/level3/3") 純正律の周波数を求める
          li
            v-btn(text to="/learning/level3/4") 純正律の音程を考察する
    v-col(cols="6")
      v-card
        v-card-title レベル４
        ul
          li 
            v-btn(text to="/learning/level4/1") フェヒナーの法則と音高、音階再考
          li 
            v-btn(text to="/learning/level4/1") 倍音成分の計算（フーリエ級数展開）
</template>
