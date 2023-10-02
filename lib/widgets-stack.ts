import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdkLambda from 'aws-cdk-lib/aws-lambda';
import * as cdkDynamoDb from 'aws-cdk-lib/aws-dynamodb';
import * as cdkApiGatewayV2 from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { Cors } from 'aws-cdk-lib/aws-apigateway';
import { CorsHttpMethod } from '@aws-cdk/aws-apigatewayv2-alpha';

export interface WidgetsStackProps extends cdk.StackProps {
  environment: 'test' | 'local' | 'staging' | 'production';
}

export class WidgetsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: WidgetsStackProps) {
    super(scope, id, props);

    const db = new cdkDynamoDb.Table(this, 'WidgetsDb', {
      tableName: 'widgets',
      partitionKey: {
        name: "id",
        type: cdkDynamoDb.AttributeType.STRING
      },
      billingMode: cdkDynamoDb.BillingMode.PAY_PER_REQUEST,
    });

    const apiGateway = new cdkApiGatewayV2.HttpApi(this, `${props.environment}-ApiGateway`, {
      corsPreflight: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowHeaders: Cors.DEFAULT_HEADERS,
        allowMethods: [CorsHttpMethod.ANY],
      },
    });

    const listWidgetsLambda = new cdkLambda.DockerImageFunction(this, "ListWidgetLambda", {
      description: "List Widgets Lambda",
      code: cdkLambda.DockerImageCode.fromImageAsset("./", { buildArgs: { FILE_PATH: "/dist/list.js" } }),
      environment: {
        DYNAMO_TABLE_NAME: db.tableName,
      },
    });

    db.grantReadData(listWidgetsLambda);

    apiGateway.addRoutes({
      path: '/widgets',
      methods: [cdkApiGatewayV2.HttpMethod.GET],
      integration: new HttpLambdaIntegration('list-widgets-integration', listWidgetsLambda),
    });

    const createWidgetLambda = new cdkLambda.DockerImageFunction(this, "CreateWidgetLambda", {
      description: "Create Widget Lambda",
      code: cdkLambda.DockerImageCode.fromImageAsset("./", { buildArgs: { FILE_PATH: "/dist/create.js" } }),
      environment: {
        DYNAMO_TABLE_NAME: db.tableName,
      },
    });

    db.grantWriteData(createWidgetLambda);

    apiGateway.addRoutes({
      path: '/widgets',
      methods: [cdkApiGatewayV2.HttpMethod.POST],
      integration: new HttpLambdaIntegration('create-widget-integration', createWidgetLambda),
    });

    new cdk.CfnOutput(this, 'api_gateway_url', {
      value: apiGateway.url ?? "unknown",
    });
  }
}
