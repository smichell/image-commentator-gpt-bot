import * as cdk from "aws-cdk-lib";
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { ManagedPolicy, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { config } from "dotenv";

// .envファイル読み込み
config();

export class ImageCommentatorGptBotStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // IAMロール
    const lambdaRole = new Role(this, "lambdaRole", {
      roleName: "bot-lambda-role",
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole"
        ),
      ],
    });

    // Lambda関数
    const lambda = new NodejsFunction(this, "lambda", {
      entry: "src/lambda/index.ts",
      handler: "handler",
      runtime: Runtime.NODEJS_16_X,
      environment: {
        CHANNEL_ACCESS_TOKEN: process.env.CHANNEL_ACCESS_TOKEN ?? "",
        CHANNEL_SECRET: process.env.CHANNEL_SECRET ?? "",
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
        GOOGLE_APPLICATION_CREDENTIALS: "./workloadIdentityCredentials.json",
      },
      role: lambdaRole,
      timeout: cdk.Duration.seconds(60),
      bundling: {
        commandHooks: {
          // デプロイ時に特定のファイルをアップロードするためにコマンドフックを使用。
          // 参考：https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda_nodejs-readme.html#command-hooks
          beforeBundling(inputDir: string, outputDir: string): string[] {
            return [
              `cp ${inputDir}/.credentials/workloadIdentityCredentials.json ${outputDir}/workloadIdentityCredentials.json`,
            ];
          },
          afterBundling() {
            return [];
          },
          beforeInstall() {
            return [];
          },
        },
      },
    });

    // API Gateway
    new LambdaRestApi(this, "gateway", {
      handler: lambda,
    });
  }
}
