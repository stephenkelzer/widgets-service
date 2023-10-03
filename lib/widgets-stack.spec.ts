import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { WidgetsStack } from './widgets-stack';

describe('WidgetsStack', () => {
    test('Lambda Created', () => {
        const app = new cdk.App();

        // test should this stack name be used IN the stack? the lambda name doesn't include the stack name at all.... should it?
        const stack = new WidgetsStack(app, 'TEST-Widgets', {
            environment: 'test',
            env: {
                // these are here temporarily. I really feel like these shouldn't be checked in.
                // I see lots of AWS documentation that says to check them in, but I don't like it.
                account: "347554157673",
                region: "us-west-2",
            },
        });

        const template = Template.fromStack(stack);

        console.log(JSON.stringify(template, undefined, 4));

        template.hasResourceProperties('AWS::Lambda::Function', {
            Description: "List Widgets Lambda",
            Architectures: ["x86_64"],
            Code: {
                S3Bucket: Match.anyValue(),
                S3Key: Match.anyValue(),
            },
            Handler: "index.handler",
            Environment: {
                Variables: {
                    "DYNAMO_TABLE_NAME": {
                        Ref: Match.anyValue()
                    }
                }
            }
        });

        template.hasResourceProperties('AWS::Lambda::Function', {
            Description: "Create Widget Lambda",
            Architectures: ["x86_64"],
            Code: {
                S3Bucket: Match.anyValue(),
                S3Key: Match.anyValue(),
            },
            Handler: "index.handler",
            Environment: {
                Variables: {
                    "DYNAMO_TABLE_NAME": {
                        Ref: Match.anyValue()
                    }
                }
            }
        });

        template.hasResourceProperties('AWS::Lambda::Function', {
            Description: "Get Widget Lambda",
            Architectures: ["x86_64"],
            Code: {
                S3Bucket: Match.anyValue(),
                S3Key: Match.anyValue(),
            },
            Handler: "index.handler",
            Environment: {
                Variables: {
                    "DYNAMO_TABLE_NAME": {
                        Ref: Match.anyValue()
                    }
                }
            }
        });

        template.hasResourceProperties('AWS::ApiGatewayV2::Api', {
            Name: "test-ApiGateway",
            ProtocolType: "HTTP",
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
            }
        });
        const apiGatewayLogicalId = Object.keys(template.findResources('AWS::ApiGatewayV2::Api', {
            Properties: {
                Name: "test-ApiGateway"
            }
        }))[0];

        template.hasResourceProperties('AWS::ApiGatewayV2::Stage', {
            AutoDeploy: true,
            StageName: "$default",
            ApiId: { Ref: apiGatewayLogicalId }
        });
    });
});