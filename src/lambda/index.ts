import {
  APIGatewayEventRequestContextV2,
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from "aws-lambda";
import { Client, validateSignature, WebhookEvent } from "@line/bot-sdk";
import { Stream } from "stream";
import { getImageInformation } from "./visionClient";
import { getImageComment } from "./chatGptClient";

const webhookResponse = () => ({
  statusCode: 200,
  headers: { "Content-Type": "text/plain" },
  body: "OK",
});

const streamToBuffer = async (stream: Stream): Promise<Buffer> => {
  return new Promise<Buffer>((resolve, reject) => {
    const buffer = Array<any>();
    stream.on("data", (chunk) => buffer.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(buffer)));
    stream.on("error", (err) => reject(`Error converting stream - ${err}`));
  });
};

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN ?? "",
  channelSecret: process.env.CHANNEL_SECRET ?? "",
};

export const handler = async (
  event: APIGatewayProxyEventV2,
  context: APIGatewayEventRequestContextV2
): Promise<APIGatewayProxyResultV2> => {
  // Messaging APIから実行されたのかを検証する。
  if (
    !validateSignature(
      event.body ?? "",
      config.channelSecret,
      event.headers?.["x-line-signature"] ?? ""
    )
  ) {
    console.error("Invalid signature.");
    return webhookResponse();
  }

  const body = JSON.parse(event.body!);
  const messageEvent = body.events[0] as WebhookEvent;

  if (messageEvent.type !== "message") {
    // メッセージに関するイベント以外は無視する。
    return webhookResponse();
  }

  const client = new Client(config);
  const replyToken = messageEvent.replyToken;

  if (messageEvent.message.type !== "image") {
    // 画像が添付されていなければメッセージを返して処理を終わる。
    await client.replyMessage(replyToken, {
      type: "text",
      text: "このメッセージは対応していません",
    });

    return webhookResponse();
  }

  const stream = await client.getMessageContent(messageEvent.message.id);
  const buffer = await streamToBuffer(stream);
  const ImageInformation = await getImageInformation(buffer);
  const comment = await getImageComment(ImageInformation);

  await client.replyMessage(replyToken, {
    type: "text",
    text: comment,
  });
  return webhookResponse();
};
