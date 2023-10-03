import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdkDynamoDB from 'aws-cdk-lib/aws-dynamodb';
import * as cdkLambda from 'aws-cdk-lib/aws-lambda';
import * as cdkApiGateway from '@aws-cdk/aws-apigatewayv2-alpha';
import { Platform } from 'aws-cdk-lib/aws-ecr-assets';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { Cors } from 'aws-cdk-lib/aws-apigateway';

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

    const createLambda = new cdkLambda.Function(this, 'CreateWidgetLambda', {
      description: "Create Widget Lambda",
      code: cdkLambda.AssetCode.fromAsset("./dist/create", { deployTime: true }),
      handler: "index.handler",
      runtime: cdkLambda.Runtime.NODEJS_18_X,
      architecture: cdkLambda.Architecture.X86_64,
      environment: {
        DYNAMO_TABLE_NAME: dynamoTable.tableName,
      },
    });
    dynamoTable.grantReadWriteData(createLambda);

    const listLambda = new cdkLambda.Function(this, 'ListWidgetsLambda', {
      description: "List Widgets Lambda",
      code: cdkLambda.AssetCode.fromAsset("./dist/list", { deployTime: true }),
      handler: "index.handler",
      runtime: cdkLambda.Runtime.NODEJS_18_X,
      architecture: cdkLambda.Architecture.X86_64,
      environment: {
        DYNAMO_TABLE_NAME: dynamoTable.tableName,
      },
    });
    dynamoTable.grantReadData(listLambda);

    const getLambda = new cdkLambda.Function(this, 'GetWidgetLambda', {
      description: "Get Widget Lambda",
      code: cdkLambda.AssetCode.fromAsset("./dist/get", { deployTime: true }),
      handler: "index.handler",
      runtime: cdkLambda.Runtime.NODEJS_18_X,
      architecture: cdkLambda.Architecture.X86_64,
      environment: {
        DYNAMO_TABLE_NAME: dynamoTable.tableName,
      },
    });
    dynamoTable.grantReadData(getLambda);


    const apiGateway = new cdkApiGateway.HttpApi(this, `${props.environment}-ApiGateway`, {
      corsPreflight: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowHeaders: Cors.DEFAULT_HEADERS,
        allowMethods: [cdkApiGateway.CorsHttpMethod.ANY],
      },
      // add default 404 route?
    });


    apiGateway.addRoutes({
      path: '/widgets',
      methods: [cdkApiGateway.HttpMethod.GET],
      integration: new HttpLambdaIntegration('list-widgets-integration', listLambda, { payloadFormatVersion: cdkApiGateway.PayloadFormatVersion.VERSION_2_0 })
    });

    apiGateway.addRoutes({
      path: '/widgets/{id}',
      methods: [cdkApiGateway.HttpMethod.GET],
      integration: new HttpLambdaIntegration('get-widget-integration', getLambda, { payloadFormatVersion: cdkApiGateway.PayloadFormatVersion.VERSION_2_0 })
    });

    apiGateway.addRoutes({
      path: '/widgets',
      methods: [cdkApiGateway.HttpMethod.POST],
      integration: new HttpLambdaIntegration('create-widget-integration', createLambda, { payloadFormatVersion: cdkApiGateway.PayloadFormatVersion.VERSION_2_0 }),
    });

    new cdk.CfnOutput(this, 'GatewayUrl', { value: apiGateway.url ?? "unknown" });
  }
}
