import { APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { DynamoDB, GetItemCommandInput } from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { Widget } from '../widget';

export const handler: APIGatewayProxyHandlerV2 = async (event, context, ...rest) => {
    try {
        console.log('GET Widget', { event: JSON.stringify({ event, context, rest }, null, 4) });

        const id = event.pathParameters?.id;
        if (!id) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'id is required' })
            }
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
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'not found' })
            }
        }

        const parsedItem = unmarshall(results.Item);

        const data: Widget = {
            id: parsedItem.id,
            created: parsedItem.created,
            name: parsedItem.name,
        }

        return {
            statusCode: 200,
            body: JSON.stringify(data),
        }
    } catch (err) {
        console.error(err)

        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'something went wrong' })
        }
    }
}