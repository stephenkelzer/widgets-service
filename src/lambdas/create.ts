import { v4 as uuidv4 } from 'uuid';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { PendingWidget, Widget } from '../widget';
import { marshall } from '@aws-sdk/util-dynamodb';
import { DynamoDB, PutItemCommandInput } from '@aws-sdk/client-dynamodb';
import { jsonResponse } from '../json-response';

export const handler: APIGatewayProxyHandlerV2 = async (event, context, ...rest) => {
    try {
        console.log('Create Widget', JSON.stringify({ event, context, rest }, null, 4));

        const body: PendingWidget = JSON.parse(event.body ?? '{}');
        if (!body.name || typeof body.name !== 'string' || body.name.length < 1) {
            return jsonResponse({ message: 'name is required' }, 400);
        } else if (body.name.length < 5) {
            return jsonResponse({ message: 'name must be 5 or more characters in length' }, 400);
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

        return jsonResponse(new Widget({ ...results.Attributes, ...queryParams.Item }), 201);
    } catch (err) {
        console.error(err)

        return jsonResponse({ message: 'something went wrong' }, 500);
    }
}