import { v4 as uuidv4 } from 'uuid';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { PendingWidget, Widget } from '../widget';
import { marshall } from '@aws-sdk/util-dynamodb';
import { DynamoDB, PutItemCommandInput } from '@aws-sdk/client-dynamodb';

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
    try {
        console.log('Create Widget', { event, context })

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
            ReturnValues: 'ALL_OLD',
        }

        console.log({ queryParams })

        const results = await dynamoClient.putItem(queryParams);
        console.log(JSON.stringify(results, null, 4));

        return {
            statusCode: 201,
            body: JSON.stringify(new Widget({ ...results.Attributes, ...queryParams.Item })),
        }
    } catch (err) {
        console.error(err)

        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'something went wrong' })
        }
    }
}