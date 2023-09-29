import { App } from 'aws-cdk-lib';
import MyStack from '../lib/my-stack';

const stage = process.env.STAGE;

if (!stage) {
    throw new Error("process.env.STAGE is required")
}

const app = new App();

new MyStack(app, `MyStack-${stage}`);