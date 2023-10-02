import { APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { DynamoDB, ScanCommandInput } from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { Widget } from '../widget';
import { jsonResponse } from '../json-response';

interface Response {
    items: Widget[],
    nextCursor: string | null,
}

export const handler: APIGatewayProxyHandlerV2 = async (event, context, ...rest) => {
    try {
        console.log('LIST Widgets', { event: JSON.stringify({ event, context, rest }, null, 4) });

        const pageSize = parseInt(event.queryStringParameters?.pageSize ?? '') || 10;
        const startId = event.queryStringParameters?.cursor;

        const dynamoClient = new DynamoDB();

        const scanParams: ScanCommandInput = {
            TableName: process.env.DYNAMO_TABLE_NAME,
            Limit: pageSize,
        };

        if (startId) {
            scanParams.ExclusiveStartKey = marshall({ id: startId })
        }

        console.log({ queryParams: JSON.stringify(scanParams, null, 4) })

        const results = await dynamoClient.scan(scanParams);

        console.log({ results: JSON.stringify(results, null, 4) })

        const items: Widget[] = results.Items ? results.Items.map(item => {
            let row = unmarshall(item);
            return {
                id: row.id,
                created: row.created,
                name: row.name
            } as Widget
        }) : []

        const data: Response = { items, nextCursor: results.LastEvaluatedKey?.id?.S ?? null }

        return jsonResponse(data);
    } catch (err) {
        console.error(err)

        return jsonResponse({ message: 'something went wrong' }, 500);
    }
}