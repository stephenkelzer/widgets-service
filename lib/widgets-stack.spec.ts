import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { WidgetsStack } from './widgets-stack';

describe('WidgetsStack', () => {
    test('Lambda Created', () => {
        const app = new cdk.App();

        // test should this stack name be used IN the stack? the lambda name doesn't include the stack name at all.... should it?
        const stack = new WidgetsStack(app, 'TEST-WidgetsStack');

        const template = Template.fromStack(stack);

        // console.log(JSON.stringify(template, undefined, 4));

        template.hasResourceProperties('AWS::Lambda::Function', {
            Handler: 'index.handler',
            Runtime: 'nodejs18.x',
        });
    });
});