# 開発メモ

## 仕様について

* ソースを隠して内部にレンダリングも考えたがおそらく良くない点がいくつかある
  * CSSが効かないので埋め込む対応が必要になる。
  * 更にHTMLを編集するJSが軒並み使えなくなる。

## PowerShellでfnm

```
fnm env --use-on-cd | Out-String | Invoke-Expression
```
