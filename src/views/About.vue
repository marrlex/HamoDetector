<template lang="pug">
  v-container
    v-row
      v-col(cols="12")
        p.subheading.font-weight-regular
          | marrlex
        h1.display-2.font-weight-bold.mb-3
          | このアプリについて
        p
          | このアプリは、純正律を再生することができるキーボードを用いて、純正律によるハーモニーの構築を助けるものです。
          | 同時に、平均律との違いを体感しながら、純正律について深く学ぶことを目的としています。
      v-col(cols="12")
        h2 ハーモニー
        p
          | ハーモニーのページでは、下部に表示される鍵盤を用いて、ハーモニーを平均律と純正律で再生することができます。
        h3 音色
        p
          | 音色はパソコンでは左側に、スマートフォンでは上から二番目にあるパネルにて調整出来ます。
        h4 波形
        p
          | 正弦波、方形波、三角波、鋸波から選べます。
          | 正弦波が一番シンプルな波形で、ハーモニーを理解するうえで最も基本的な波形です。
        h4 音域
        p
          | 音域は、5段階でスライダーを動かすことで設定できます。
          | 音の再生中に変化させると、音はそのままになります。
          | 「低1」が最も低く、最低音はC1（ピアノ最低音から二個右隣のC）です。
        h4 持続
        p
          | 物理的なキーボードと比べて、同時押しがしにくく、ハーモニーを鳴らしにくい点を考慮して、二種類の持続方法を備えています。
          | 「瞬時」では持続を行いません。
        ul
          li 排他：同時に再生したハーモニーを持続します。すなわち、全ての指を放すまで持続し、一度放せば、次に押すときに持続を解除します。画面が大きければ一番使いやすいと思います。
          li 交互：一度押した音を持続し、もう一度押すと解除します。イメージは天井灯などカチッとなるタイプのスイッチや電源ボタンです。

        h4 調
        p
          | 再生する音の音律を決定します。
          | 平均律を選べば、長短は無視されます。
          | 音名を選択すると純正律となります。同時に長短を選んでください。
          | また、右上の歯車ボタンをから設定を開き、「一般＞調の自動選択」をオンにすると、弾いた和音に対して自動的に選択します。

        h3 和音判定部
        p
          | パソコンだと中央に、スマートフォンだと最上部にあります。
          | 弾いた和音のコード名を判定し、一致する和音の内最もそれらしいものを左側に、その他の一致する全ての和音を右側に表示します。
          | 最もそれらしいコード名に対して、その構成音を下側の鍵盤風の枠に色を付けて示します。
        p
          | 設定メニューから、「一般＞セント値を表示」をオンにすると、音名の代わりにセント値（平均律からの増加量）を表示します。

        h3 波形表示
        p
          | 和音判定部の真下にあります。
          | 再生中の音の波形をオシロスコープ風に表示します。
          | 再生ボタンを押して開始し、倍率スライダーで縦と横を拡大できます。
          | 見づらい場合はスライダーで調整し、必要に応じて音域を変えることでも倍率を変えるような働きがありますので利用してください。
        p
          | 処理が大きいため、必要でないなら一時停止ボタン（開始後、再生ボタンが変化します）にて停止してください。
        p
          | 更新ボタンでは、トリガレベルをその時点での最大値に更新します。
          | トリガ機能、はオシロスコープのトリガ機能を模倣したもので、簡単に言えば波形の表示の開始する値を設定するものです。
          | 波が流れて見づらい場合に使うことで、波を止めることができますが、波形の表示をずらす都合上、右側で足りなくなった分がチカチカしてしまいますから、倍率を上げて隠すなどの工夫をしてください。

        h3 メトロノーム
        p
          | パソコンだと右側、スマートフォンだと最下部にあります。
          | メトロノームを電子的に再生するものです。
        p
          | 拍子は4分の何拍子かを設定でき、その位置に強拍が鳴ります。
          | 複合拍子は足し算の記号「+」で繋いでいけばよいですが、数字以外の文字ならなんでも構いません。
          | テンポは、前後にあるボタンとスライダーのどちらかを使って、1ずつ変化させることができます。
          | その他のスライダーは音量を変化させます。
</template>
