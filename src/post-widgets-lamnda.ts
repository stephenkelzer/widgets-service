import { APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda'

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> => {
    console.log('POST Widgets', { event })

    if (event.queryStringParameters?.error) {
        throw new Error('This is an error!')
    }

    return {
        statusCode: 201,
        body: JSON.stringify({ id: 123, name: 'Widget 123' })
    }
}