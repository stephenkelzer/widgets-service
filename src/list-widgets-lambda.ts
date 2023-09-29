import { APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDB, ScanInput } from '@aws-sdk/client-dynamodb'

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> => {
    console.log('LIST Widgets', { event })

    const dynamoClient = new DynamoDB({
        // region: 'us-west-2'
    })

    const scanTodo: ScanInput = {
        TableName: process.env.DYNAMO_TABLE_NAME,
        Limit: 10
    }

    try {

        const results = await dynamoClient.scan(scanTodo);
        console.log({ results })

        // const userData = Items ? Items.map(item => unmarshall(item)) : []

        return {
            statusCode: 200,
            body: JSON.stringify({ results })
        }

    } catch (err) {

        console.log(err)

        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'something went wrong'
            })
        }
    }
}