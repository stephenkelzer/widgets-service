import * as cdk from 'aws-cdk-lib';
import { WidgetsStack } from '../lib/widgets-stack';

const environment = process.env.ENVIRONMENT || 'local';

const app = new cdk.App();

new WidgetsStack(app, `${environment}-WidgetsStack`, {
    env: {
        // these are here temporarily. I really feel like these shouldn't be checked in.
        // I see lots of AWS documentation that says to check them in, but I don't like it.
        account: "347554157673",
        region: "us-west-2",
    },
});