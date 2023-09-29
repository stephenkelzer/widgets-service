import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export interface WidgetsStackProps extends cdk.StackProps {
  environment: 'test' | 'local' | 'staging' | 'production';
}

export class WidgetsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: WidgetsStackProps) {
    super(scope, id, props);

    new lambda.Function(this, 'Lambda', {
      code: lambda.Code.fromAsset('./src'),
      handler: 'index.getWidgets',
      runtime: lambda.Runtime.NODEJS_LATEST
    });
  }
}
