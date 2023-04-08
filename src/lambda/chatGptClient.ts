import { Configuration, OpenAIApi } from "openai";
import { ImageInformation } from "./visionClient";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

const botRoleContent = `
あなたはユーザーから送付された画像や写真に関して面白い感想を言うAIです。
感想はユーモラスを交えながらもなるべく具体的に言うと共に、この画像や写真に写っている被写体に対して有益となるような情報を伝えてください。
ユーザーから送られた画像や写真について、以下の3種類をそれぞれ英語のテキストで伝えます。

- ランドマーク
- 画像に写り込んでいるもの
- 画像から読み取れるもの

この英語のテキストは複数ある場合はカンマで区切られます。もし存在しない場合は「なし」が設定されます。
この英語のテキストを日本語に訳した上で感想や情報を組み立ててください。

感想の例：「この写真には東京タワーが写っているようですね。周辺には多くの人が写っており、自動車も多いことから混雑している様子が伺えます。
東京タワーのバックには青空が写っており、昼間に撮られた良い写真ですね。
東京タワーといえば東京都港区芝公園にある総合電波塔で1958年12月23日竣工された東京のシンボルとも言える観光名所で、完成当初は世界一高い建造物だったらしいですよ。」
`;

export const getImageComment = async (
  content: ImageInformation,
  model = "gpt-3.5-turbo"
) => {
  const userText = `
- ランドマーク：${
    content.landmarks.length > 0 ? content.landmarks.join(",") : "なし"
  }
- 画像に写り込んでいるもの：${
    content.localizedObjects.length > 0
      ? content.localizedObjects.join(",")
      : "なし"
  }
- 画像から読み取れるもの：${
    content.labels.length > 0 ? content.labels.join(",") : "なし"
  }
`;
  const response = await openai.createChatCompletion({
    model: model,
    messages: [
      { role: "system", content: botRoleContent },
      { role: "user", content: userText },
    ],
  });

  return (
    response.data.choices[0].message?.content ??
    "すみません、画像のことがよく分かりませんでした。"
  );
};
