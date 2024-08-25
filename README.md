# AviUtl カラーハーフトーンスクリプト

カラーハーフトーン加工をする AviUtl スクリプトです。動作には karoterra氏の [GLShaderKit](https://github.com/karoterra/aviutl-GLShaderKit) が必要になります。

![sample01](https://github.com/user-attachments/assets/88b6a0fb-cc5d-486c-9ade-05b59e1becb5)

## 導入方法
1. [GLShaderKit](https://github.com/karoterra/aviutl-GLShaderKit) を導入します。
2. `exedit.auf` と同一ディレクトリ(または1層下)にある `script` フォルダに以下のファイルを入れてください。
- `ColorHalftone.anm`
- `ColorHalftone.frag`
- `ColorHalftone.vert`

## 使い方
オブジェクトに `ColorHalftone.anm` を適用してください。

## パラメーター

### トラックバー
- #### サイズ
  トーンのサイズを変更します。

- #### ぼかし幅
  トーンの境界をぼかします。

- #### 最小サイズ
  トーンの最小サイズを変更します。

- #### 最大サイズ
  トーンの最大サイズを変更します。デフォルトは `110` です。`0` にすると全てのトーンが `最小サイズ` で設定した値になります。

### チェックボックス
- #### 再読み込み
  シェーダーを再読み込みします。

### 設定ダイアログ
- #### 色1[表示], 色2[表示], 色3[表示]
  各トーンの表示/非表示を切り替えます。

- #### 色1, 色2, 色3
  各トーンの色を設定します。デフォルトは以下の色に設定されています。
  - 色1 : `00ffff`(シアン/C)
  - 色2 : `ff00ff`(マゼンタ/M)
  - 色3 : `ffff00`(イエロー/Y)

- #### 背景色
  下地となる色を設定します。デフォルトは `ffffff`(白) です。

- #### モード[0-1]
  トーンをの混色方法を変更します。
  | モード | 混色方法 | 備考 |
  |:---:|:---:| :---: |
  | `0` | 減法混色 | デフォルト |
  | `1` | 加法混色 |※1|

- #### 反転
  トーンを反転します。

- #### 滑らかさ[0-100]
  全体にブラーをかけることでトーンを滑らかにします。デフォルトは `1` です。

#### ※1 注意
モードを `加法混色` にした際、背景がデフォルト `ffffff`(白) のままだと真っ白になります。暗めの色に変更してください。<br>加法混色で元のオブジェクトと同じ色にしたいときは、背景を `000000`(黒)、色1を `ff0000`(赤/R)、 色2を `00ff00`(緑/G)、 色3を `0000ff`(青/B) に変更してください。
  

#### 個別設定
  `角度`, `ぼかし幅`, `最小サイズ`, `最大サイズ` は
  ```
  {色1, 色2, 色3}
  ```
  の順にトーンと対応しており、それぞれ個別に設定することができます。
  
- #### 角度
  各トーンの角度を設定します。デフォルトは `{15, 75, 30}` になっています。値が `nil` のときは `0` になります。

- #### ぼかし幅
  効果はトラックバーの `ぼかし幅` と同じです。`0` 以上 `100` 以下の値のみ受け付けます。範囲を超えた値を設定すると `nil` になります。<br>値が `nil` のときはトラックバーの値を使用します。

- #### 最小サイズ
  効果はトラックバーの `最小サイズ` と同じです。`0` 以上 `100` 以下の値のみ受け付けます。範囲を超えた値を設定すると `nil` になります。<br>値が `nil` のときはトラックバーの値を使用します。
- #### 最大サイズ
  効果はトラックバーの `最大サイズ` と同じです。`0` 以上 `200` 以下の値のみ受け付けます。範囲を超えた値を設定すると `nil` になります。<br>値が `nil` のときはトラックバーの値を使用します。


## ライセンス
[MIT Lisence](LICENSE.txt) に基づくものとします。

## 更新履歴
- #### v.1.2.2 (2024/08/25)
  step関数のオーバーロードによるエラーの修正。
- #### v1.2.1 (2024/08/22)
  加法混色にした際の色の補正方法を修正。
- #### v1.2.0 (2024/08/19)
  - 色の調整が不適切だったのを修正。
  - デフォルトでアンチエイリアスがかかるように修正。
  - 設定ダイアログに `滑らかさ` を追加。
  - トラックバーの `変化率` を `最大サイズ` に名称を変更。
- #### v1.1.0 (2024/08/10)
  加法混色にした際にトーンが反転する問題を修正。
- #### v1.0.0 (2024/08/09)
  初版
