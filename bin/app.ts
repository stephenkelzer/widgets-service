import { App } from 'aws-cdk-lib';
import WidgetsStack from '../lib/widgets-stack';

const environment = process.env.ENVIRONMENT || 'local';

const app = new App();

new WidgetsStack(app, `${environment}-MyStack`, {
    env: {
        account: "347554157673",
        region: "us-west-2"
    }
});