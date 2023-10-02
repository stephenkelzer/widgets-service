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

        template.hasResourceProperties('AWS::ApiGateway::RestApi', {
            Name: "test-ApiGateway",
            EndpointConfiguration: {
                Types: ["REGIONAL"]
            }
        });
        const apiGatewayLogicalId = Object.keys(template.findResources('AWS::ApiGateway::RestApi', {
            Properties: {
                Name: "test-ApiGateway"
            }
        }))[0];


        // Ensure CORS is setup
        template.hasResourceProperties('AWS::ApiGateway::Method', {
            HttpMethod: "OPTIONS",
            Integration: {
                IntegrationResponses: [
                    {
                        ResponseParameters: {
                            "method.response.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
                            "method.response.header.Access-Control-Allow-Origin": "'*'",
                            "method.response.header.Access-Control-Allow-Methods": "'OPTIONS,GET,PUT,POST,DELETE,PATCH,HEAD'"
                        },
                        StatusCode: "204"
                    }
                ],
                RequestTemplates: {
                    "application/json": "{ statusCode: 200 }"
                },
                Type: "MOCK"
            },
            MethodResponses: [
                {
                    ResponseParameters: {
                        "method.response.header.Access-Control-Allow-Headers": true,
                        "method.response.header.Access-Control-Allow-Methods": true,
                        "method.response.header.Access-Control-Allow-Origin": true
                    },
                    StatusCode: "204"
                }
            ],
            ResourceId: {
                "Fn::GetAtt": [
                    apiGatewayLogicalId,
                    "RootResourceId"
                ]
            },
            RestApiId: {
                Ref: apiGatewayLogicalId
            }
        });

        // Ensure STAGE is setup on ApiGateway
        template.hasResourceProperties('AWS::ApiGateway::Stage', {
            RestApiId: { Ref: apiGatewayLogicalId },
            DeploymentId: { Ref: Match.anyValue() },
            StageName: "default"
        });
    });
});