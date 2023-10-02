import { APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { DynamoDB, GetItemCommandInput } from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { Widget } from '../widget';
import { jsonResponse } from '../json-response';

export const handler: APIGatewayProxyHandlerV2 = async (event, context, ...rest) => {
    try {
        console.log('GET Widget', { event: JSON.stringify({ event, context, rest }, null, 4) });

        const id = event.pathParameters?.id;
        if (!id) {
            return jsonResponse({ message: 'id is required' }, 400);
        }

        const dynamoClient = new DynamoDB();

        const queryParams: GetItemCommandInput = {
            TableName: process.env.DYNAMO_TABLE_NAME,
            Key: marshall({ id }),
        };

        console.log({ queryParams: JSON.stringify(queryParams, null, 4) })

        const results = await dynamoClient.getItem(queryParams);

        console.log({ results: JSON.stringify(results, null, 4) })

        if (!results.Item) {
            return jsonResponse({ message: 'not found' }, 404);
        }

        const parsedItem = unmarshall(results.Item);

        const data: Widget = {
            id: parsedItem.id,
            created: parsedItem.created,
            name: parsedItem.name,
        }

        return jsonResponse(data);
    } catch (err) {
        console.error(err)

        return jsonResponse({ message: 'something went wrong' }, 500);
    }
}