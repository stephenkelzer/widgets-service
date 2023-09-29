import * as cdk from '@aws-cdk/core';
import MyStack from '../lib/my-stack';

const stage = process.env.STAGE;

if (!stage) {
    throw new Error("process.env.STAGE is required")
}

const app = new cdk.App();

new MyStack(app, `MyStack-${stage}`);