import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";

export default class MyStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    console.log("todo")
  }
}