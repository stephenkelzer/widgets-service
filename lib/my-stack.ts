import * as cdk from "@aws-cdk/core";

export default class MyStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    console.log("todo")
  }
}