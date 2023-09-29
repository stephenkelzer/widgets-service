import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class WidgetsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new lambda.Function(this, 'WidgetLambda', {
      code: lambda.Code.fromInline('exports.handler = async (event) => console.log(event)'),
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_LATEST
    });
  }
}
