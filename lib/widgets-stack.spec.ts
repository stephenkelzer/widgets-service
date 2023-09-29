import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { WidgetsStack } from './widgets-stack';

describe('WidgetsStack', () => {
    test('Lambda Created', () => {
        const app = new cdk.App();

        // test should this stack name be used IN the stack? the lambda name doesn't include the stack name at all.... should it?
        const stack = new WidgetsStack(app, 'TEST-Widgets', { environment: 'test' });

        const template = Template.fromStack(stack);

        // console.log(JSON.stringify(template, undefined, 4));

        template.hasResourceProperties('AWS::Lambda::Function', {
            Code: {
                "S3Bucket": Match.anyValue(),
                "S3Key": Match.anyValue()
            },
            Handler: 'list-widgets-lambda.handler',
            Runtime: 'nodejs18.x',
        });


        template.hasResourceProperties('AWS::Lambda::Function', {
            Code: {
                "S3Bucket": Match.anyValue(),
                "S3Key": Match.anyValue()
            },
            Handler: 'create-widget-lambda.handler',
            Runtime: 'nodejs18.x',
        });

        template.hasResourceProperties('AWS::ApiGatewayV2::Api', {
            CorsConfiguration: {
                AllowHeaders: [
                    "Content-Type",
                    "X-Amz-Date",
                    "Authorization",
                    "X-Api-Key",
                    "X-Amz-Security-Token",
                    "X-Amz-User-Agent"
                ],
                AllowMethods: ["*"],
                AllowOrigins: ["*"]
            },
            Name: "test-ApiGateway",
            ProtocolType: "HTTP"
        });

        template.hasResourceProperties('AWS::ApiGatewayV2::Stage', {
            AutoDeploy: true,
            StageName: "$default"
        });
    });
});