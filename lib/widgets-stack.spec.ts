import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { WidgetsStack } from './widgets-stack';

describe('WidgetsStack', () => {
    test('Lambda Created', () => {
        const app = new cdk.App();

        // test should this stack name be used IN the stack? the lambda name doesn't include the stack name at all.... should it?
        const stack = new WidgetsStack(app, 'TEST-Widgets', { environment: 'test' });

        const template = Template.fromStack(stack);

        console.log(JSON.stringify(template, undefined, 4));

        template.hasResourceProperties('AWS::Lambda::Function', {
            Description: "List Widgets Lambda",
            Architectures: ["x86_64"],
            PackageType: "Image",
            Code: {
                ImageUri: Match.objectLike({ "Fn::Sub": Match.anyValue() }),
            },
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
            PackageType: "Image",
            Code: {
                ImageUri: Match.objectLike({ "Fn::Sub": Match.anyValue() }),
            },
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