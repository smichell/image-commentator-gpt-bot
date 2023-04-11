# Image Commentator GPT Bot

Cloud Vision APIを使用して画像から抽出したランドマークやラベルをChatGPT APIに渡し、その画像に対してコメントをするLINEボットのサンプルです。
以下のQiita記事のサンプル用に作成したプロジェクトで、CDKを使用してLambda関数を作成します。

[Cloud Vision API + ChatGPT APIを使用して画像にコメントするLINEボットを作る](https://qiita.com/smcl/items/f85745c1150c0bb3d96c)

## 使い方
詳しくはQiitaの記事に記載していますがデプロイまでの流れは以下です。

1. [LINE Developers](https://developers.line.biz/)でMessaging APIを使用するチャンネルを作成し、チャンネルシークレットとチャンネルアクセストークンを取得します。
1. [Open API](https://openai.com/)でAPI keyを取得します。
1. チャンネルシークレット、チャンネルアクセストークン、API keyを記載した `.env` ファイルをディレクトリのルートに作成します。
    ```.env
    CHANNEL_SECRET={チャンネルシークレット}
    CHANNEL_ACCESS_TOKEN={チャンネルアクセストークン}
    OPENAI_API_KEY={API key}
    ```
1. Docker Desktop を起動します。
1. AWS CLIをセットアップしていない場合、以下のコマンドでセットアップします。
    ```
    $ aws configure
    ```
1. [Google Cloud](https://cloud.google.com/)でCloud Vision APIの利用を許可したWorkload Identityプールと、AWS用のWorkload Identityプロバイダを作成し、JSON形式の構成ファイルをダウンロードします。
1. ダウンロードした構成ファイルは `.credentials/workloadIdentityCredentials.json` に置きます。
1. CDKツールキットをインストールします。
1. 以下のコマンドでAWSにデプロイします。
    ```
    $ yarn install
    $ cdk deploy
    ```
1. デプロイ後に表示されるURLをLINEチャンネルのWebhookに登録します。
1. LINEチャンネルを友だち登録し、画像を送信するとその画像に対するコメントが返ります。

## ライセンス
MIT License

## 参考
[Cloud Vision API + ChatGPT APIを使用して画像にコメントするLINEボットを作る](https://qiita.com/smcl/items/f85745c1150c0bb3d96c)