import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdkLambda from 'aws-cdk-lib/aws-lambda';
import * as cdkApiGateway from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';

export interface WidgetsStackProps extends cdk.StackProps {
  environment: 'test' | 'local' | 'staging' | 'production';
}

export class WidgetsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: WidgetsStackProps) {
    super(scope, id, props);

    const apiGateway = new cdkApiGateway.HttpApi(this, 'ApiGateway', {
      corsPreflight: {
        allowHeaders: [
          'Content-Type',
        ],
        allowMethods: [
          cdkApiGateway.CorsHttpMethod.GET,
        ],
        // allowCredentials: true,
        allowOrigins: ['http://localhost:3000'],
      },
    });

    const lambda = new cdkLambda.Function(this, 'Lambda', {
      code: cdkLambda.Code.fromAsset('./dist'),
      handler: 'get-widgets-lambda.getWidgets',
      runtime: cdkLambda.Runtime.NODEJS_LATEST
    });

    apiGateway.addRoutes({
      path: '/widgets',
      methods: [cdkApiGateway.HttpMethod.GET],
      integration: new HttpLambdaIntegration('get-todos-integration', lambda),
    });

    new cdk.CfnOutput(this, 'api_gateway_url', {
      value: apiGateway.url ?? "unknown",
    });
  }
}
