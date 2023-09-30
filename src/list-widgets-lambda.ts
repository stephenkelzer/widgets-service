import { APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDB, QueryCommandInput } from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { Widget } from './widget';

interface Response {
    items: Widget[],
    nextCursor?: string
}

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> => {
    try {
        console.log('LIST Widgets', { event });

        const pageSize = parseInt(event.queryStringParameters?.pageSize ?? '') || 10;
        const startId = event.queryStringParameters?.cursor;

        const dynamoClient = new DynamoDB();

        const queryParams: QueryCommandInput = {
            TableName: process.env.DYNAMO_TABLE_NAME,
            Limit: pageSize,
        }

        if (startId) {
            queryParams.ExclusiveStartKey = marshall({ id: startId })
        }

        console.log({ queryParams })

        // if (startId) {
        //     queryParams.ExclusiveStartKey = marshall({ id: startId })
        // }

        const results = await dynamoClient.query(queryParams);

        console.log({ results })

        const items: Widget[] = results.Items ? results.Items.map(item => {
            let row = unmarshall(item);
            return {
                id: row.id,
                created: row.created,
                name: row.name
            } as Widget
        }) : []

        const data: Response = { items, nextCursor: results.LastEvaluatedKey?.id?.S }

        return {
            statusCode: 200,
            body: JSON.stringify(data),
        }
    } catch (err) {
        console.error(err)

        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'something went wrong'
            })
        }
    }
}