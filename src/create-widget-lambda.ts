import { APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda'
import { PendingWidget, Widget } from './widget';
import { DynamoDB, PutItemCommandInput } from '@aws-sdk/client-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { marshall } from '@aws-sdk/util-dynamodb';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> => {
    try {
        console.log('POST Widgets', { event })

        const body: PendingWidget = JSON.parse(event.body ?? '{}');
        if (!body.name || typeof body.name !== 'string' || body.name.length < 1) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'name is required' })
            }
        }

        const dynamoClient = new DynamoDB();

        const queryParams: PutItemCommandInput = {
            TableName: process.env.DYNAMO_TABLE_NAME,
            Item: marshall({
                id: uuidv4(),
                created: new Date().getTime(),
                name: body.name,
            }),
            ReturnValues: 'ALL_NEW',
        }

        console.log({ queryParams })

        const results = await dynamoClient.putItem(queryParams);
        console.log(JSON.stringify(results, null, 4));

        if (!results.Attributes) {
            throw new Error('Create called did not return any attributes')
        }

        return {
            statusCode: 201,
            body: JSON.stringify(new Widget(results.Attributes)),
        }
    } catch (err) {
        console.error(err)

        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'something went wrong' })
        }
    }
}