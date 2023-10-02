import { APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDB, QueryCommandInput, ScanCommandInput } from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { Widget } from '../widget';

interface Response {
    items: Widget[],
    nextCursor: string | null,
}

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> => {
    try {
        console.log('LIST Widgets', { event: JSON.stringify(event, null, 4) });

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

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }
    } catch (err) {
        console.error(err)

        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'something went wrong' })
        }
    }
}