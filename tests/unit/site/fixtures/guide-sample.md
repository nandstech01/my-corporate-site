```nands-hero
{"lead":"使い方、MCP でのツール接続、モデルの選び方を、当社の実測とともにまとめました。","answer":["Claude Code は、Anthropic が提供するコーディング用の AI エージェントです。ターミナルや IDE から頼むと、コードを読み、ファイルを編集し、コマンドを実行します。","外部のツールには、MCP という共通の仕組みでつなぎます。","当社の実測 (小さな 6 課題 × 3 回) では 4 つの設定がすべて 18/18 回成功。Opus 5.5 は Opus 5 の約半分の時間、約 4 割安い費用でした。","難しい課題での比較は検証中です。結果が出たら更新します。"],"aiNote":"下書きに AI (Claude) を使い、数値はすべて当社の検証記録と照合しています。","env":"Claude Code 2.1.283、macOS 15.1","terminal":{"lines":[{"kind":"cmd","text":"claude --version"},{"kind":"out","text":"2.1.283 (Claude Code)"},{"kind":"cmd","text":"claude mcp add playwright -- npx @playwright/mcp@latest"},{"kind":"out","text":"Added stdio MCP server playwright with command: npx @playwright/mcp@latest to local config"},{"kind":"out","text":"File modified: ~/.claude.json [project: ~/app]"},{"kind":"cmd","text":"claude mcp add --transport http sentry https://mcp.sentry.dev/mcp"},{"kind":"out","text":"Added HTTP MCP server sentry with URL: https://mcp.sentry.dev/mcp to local config"},{"kind":"out","text":"File modified: ~/.claude.json [project: ~/app]"}],"caption":"Claude Code 2.1.283 で実際に実行した出力です。パスは ~ で短縮しています。"}}
```

## この記事でわかること {#summary}

Claude Code の始め方、外部のツールとのつなぎ方、モデルと effort の選び方を、当社が同じ課題で測った結果とともに説明します。数値はすべて 2026 年 9 月 27 日の実測です。

```nands-stats
{"caption":"当社の実測の要点 (6 課題 × 3 回)","items":[{"label":"成功した回数","value":"18/18","note":"4 つの設定すべて"},{"label":"時間の中央値 (Opus 5.5)","value":30,"unit":"秒","note":"Opus 5 は 62 秒"},{"label":"費用の中央値 (Opus 5.5)","value":0.15,"unit":"ドル","note":"API 定価での換算"},{"label":"測った課題","value":6,"unit":"課題","note":"各 3 回"}]}
```

## どのモデルを選べばいい？同じ課題で測りました {#compare}

この難しさの課題では、成功した回数に差は出ませんでした。差が出たのは時間と費用です。Opus 5.5 は Opus 5 の約半分の時間で終わり、費用は約 4 割安く済みました。Fable 5.1 は成功数で上回らず、費用は Opus 5.5 の 2 倍強でした。

| モデル | effort | 成功 | 時間の中央値 (秒) | 費用の中央値 (ドル) |
| --- | --- | ---: | ---: | ---: |
| Opus 5.5 | high | 18/18 | 31 | 0.15 |
| Opus 5.5 | medium (既定) | 18/18 | 30 | 0.16 |
| Opus 5 | high | 18/18 | 62 | 0.25 |
| Fable 5.1 | high | 18/18 | 39 | 0.34 |

- バグ修正やリファクタリングなど小さな 6 課題を、設定ごとに 3 回ずつ解かせました。成功は、元のテストと採点用の隠しテストの両方が通ったものです。
- 費用は Claude Code が出力する API 定価での換算額 (1 回あたりの中央値) で、サブスクリプションの請求額ではありません。

```nands-chart
{"title":"1 回あたりの時間の中央値","unit":"秒","note":"水色が Opus 5.5 です。数値は上の表と同じです。","source":"当社の検証記録 (2026-09-27)","rows":[{"label":"Opus 5.5","note":"high","value":31,"highlight":true},{"label":"Opus 5.5","note":"medium","value":30,"highlight":true},{"label":"Opus 5","note":"high","value":62},{"label":"Fable 5.1","note":"high","value":39}]}
```

```nands-callout
{"tone":"unverified","title":"難しい課題での差","body":"今回の 6 課題はどの設定でも解ける難しさでした。難しい課題で成功数に差が出るかは検証中で、結果が出たらこの節を更新します。"}
```

## Claude Code は外部のツールとどうつながる？ {#mcp}

MCP (Model Context Protocol) でつなぎます。Claude Code が MCP クライアントになり、登録した MCP サーバーを通して、ブラウザや SaaS を道具として使います。

```nands-diagram
{"kind":"flow","title":"Claude Code と MCP サーバー、外部のツールの関係","nodes":[{"id":"you","label":"あなた","sub":"ターミナルや IDE で依頼"},{"id":"cc","label":"Claude Code","sub":"MCP クライアントを内蔵","emphasis":true},{"id":"local","label":"MCP サーバー","sub":"手元で動くプロセス"},{"id":"remote","label":"MCP サーバー","sub":"提供元がネットで公開"},{"id":"ltool","label":"手元の道具","sub":"ブラウザや DB"},{"id":"rtool","label":"SaaS のデータ","sub":"Sentry や Notion"}],"edges":[{"from":"you","to":"cc"},{"from":"cc","to":"local","label":"stdio"},{"from":"cc","to":"remote","label":"HTTP"},{"from":"local","to":"ltool"},{"from":"remote","to":"rtool"}]}
```

### 登録のコマンド {#mcp-commands}

登録は既定で、このプロジェクトの自分だけに入ります (local)。`--scope project` にすると .mcp.json に書かれ、リポジトリを通じてチームで共有できます。

```bash
# 手元で動く MCP サーバー (stdio)
claude mcp add playwright -- npx @playwright/mcp@latest

# 提供元が公開している MCP サーバー (HTTP)
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp
```

## effort の選び方 {#choose}

```nands-decide
{"title":"どの設定で使うか","root":{"question":"失敗すると困る作業ですか","options":[{"label":"はい","next":{"question":"時間よりも確実さを優先しますか","options":[{"label":"はい","result":{"title":"Opus 5.5 の high","body":"今回の実測では medium と同じ時間で終わりました"}},{"label":"いいえ","result":{"title":"Opus 5.5 の medium","body":"既定の設定のまま使えます"}}]}},{"label":"いいえ","result":{"title":"Opus 5.5 の medium","body":"まずは既定のままで十分です","href":"/posts/opus-5-5-vs-opus-5-fable-5-1-measured-ep619n"}}]}}
```

## このガイドの変わり方 {#history}

```nands-diagram
{"kind":"timeline","title":"このガイドの主な更新","nodes":[{"id":"first","label":"初版を公開 (インストールと MCP の接続)","sub":"2026-09-20"},{"id":"measure","label":"Opus 5.5・Opus 5・Fable 5.1 の実測を追加","sub":"2026-09-27"},{"id":"next","label":"難しい課題での比較を追加する予定","sub":"検証中"}]}
```

## 更新履歴 {#changelog}

```nands-changelog
{"entries":[{"date":"2026-09-20","change":"初版を公開","basis":"当社の検証 (Claude Code 2.1.270)"},{"date":"2026-09-27","change":"モデルの比較の表とグラフを追加","basis":"当社の検証記録","url":"/posts/opus-5-5-vs-opus-5-fable-5-1-measured-ep619n"}]}
```

## 出典 {#sources}

```nands-sources
{"items":[{"title":"Connect Claude Code to tools via MCP","url":"https://docs.claude.com/en/docs/claude-code/mcp","publisher":"Anthropic","accessed":"2026-09-27"},{"title":"Opus 5.5・Opus 5・Fable 5.1 を同じ課題で測った結果","url":"/posts/opus-5-5-vs-opus-5-fable-5-1-measured-ep619n","publisher":"NANDS"}]}
```

```nands-cta
{"title":"Claude Code の導入を相談する","body":"当社は Claude Code を日々の開発で使い、このページのようにモデルの比較も自分たちで測っています。導入の進め方、社内ツールとの MCP 接続、費用の見積もりについて、相談を受け付けています。","form":true,"secondary":{"label":"実測の比較記事を読む","href":"/posts/opus-5-5-vs-opus-5-fable-5-1-measured-ep619n"}}
```
