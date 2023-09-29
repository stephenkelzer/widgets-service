import { APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda'

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> => {
    console.log('getWidgets', { event })

    if (event.queryStringParameters?.error) {
        throw new Error('This is an error!')
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'You made it!' })
    }
}