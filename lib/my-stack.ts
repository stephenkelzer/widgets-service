import { Stack, StackProps, CfnParameter } from "aws-cdk-lib";
import { Function, Code, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export default class MyStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new Function(this, 'MyLambda', {
      code: Code.fromCfnParameters({
        bucketNameParam: new CfnParameter(this, 'MyLambdaBucket', {
          type: 'String',
          description: 'The name of the S3 bucket that contains the Lambda code',
        }),
        objectKeyParam: new CfnParameter(this, 'MyLambdaKey', {
          type: 'String',
          description: 'The name of the S3 key that contains the Lambda code',
        }),
      }),
      handler: 'index.handler',
      runtime: Runtime.NODEJS_LATEST
    });

  }
}