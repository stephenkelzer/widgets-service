import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdkApiGateway from 'aws-cdk-lib/aws-apigateway';
import * as cdkDynamoDB from 'aws-cdk-lib/aws-dynamodb';
import * as cdkLambda from 'aws-cdk-lib/aws-lambda';
import { Platform } from 'aws-cdk-lib/aws-ecr-assets';

export interface WidgetsStackProps extends cdk.StackProps {
  environment: 'test' | 'local' | 'staging' | 'production';
}

export class WidgetsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: WidgetsStackProps) {
    super(scope, id, props);

    const dynamoTable = new cdkDynamoDB.Table(this, 'WidgetsDb', {
      tableName: 'widgets',
      partitionKey: {
        name: "id",
        type: cdkDynamoDB.AttributeType.STRING
      },
      billingMode: cdkDynamoDB.BillingMode.PAY_PER_REQUEST,
    });

    const createLambda = new cdkLambda.DockerImageFunction(this, 'CreateWidgetLambda', {
      description: "Create Widget Lambda",
      code: cdkLambda.DockerImageCode.fromImageAsset("./", {
        buildArgs: {
          FILE_PATH: "./src/lambdas/create.js"
        },
        platform: Platform.LINUX_AMD64
      }),
      architecture: cdkLambda.Architecture.X86_64,
      environment: {
        DYNAMO_TABLE_NAME: dynamoTable.tableName,
      },
    });
    dynamoTable.grantReadWriteData(createLambda);

    const listLambda = new cdkLambda.DockerImageFunction(this, 'ListWidgetsLambda', {
      description: "List Widgets Lambda",
      code: cdkLambda.DockerImageCode.fromImageAsset("./", {
        buildArgs: {
          FILE_PATH: "./src/lambdas/list.js"
        },
        platform: Platform.LINUX_AMD64
      }),
      architecture: cdkLambda.Architecture.X86_64,
      environment: {
        DYNAMO_TABLE_NAME: dynamoTable.tableName,
      },
    });
    dynamoTable.grantReadData(listLambda);

    const apiGateway = new cdkApiGateway.RestApi(this, `${props.environment}-ApiGateway`, {
      defaultCorsPreflightOptions: {
        allowOrigins: cdkApiGateway.Cors.ALL_ORIGINS,
        allowMethods: cdkApiGateway.Cors.ALL_METHODS,
        allowHeaders: cdkApiGateway.Cors.DEFAULT_HEADERS,
      },
      endpointTypes: [cdkApiGateway.EndpointType.REGIONAL],
      deployOptions: { stageName: "default" },
      deploy: true,
    });

    const widgetApiEndpoint = apiGateway.root.addResource("widgets");
    widgetApiEndpoint.addMethod("GET", new cdkApiGateway.LambdaIntegration(listLambda));
    widgetApiEndpoint.addMethod("POST", new cdkApiGateway.LambdaIntegration(createLambda, { proxy: false }));

    new cdk.CfnOutput(this, 'api_gateway_url', { value: apiGateway.url ?? "unknown" });
  }
}
