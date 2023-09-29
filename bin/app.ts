import { App } from 'aws-cdk-lib';
import WidgetsStack from '../lib/widgets-stack';

const stage = process.env.STAGE;

if (!stage) {
    throw new Error("process.env.STAGE is required")
}

const app = new App();

new WidgetsStack(app, `MyStack-${stage}`);