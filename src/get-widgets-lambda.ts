import { APIGatewayProxyHandler } from 'aws-lambda'

export const getWidgets: APIGatewayProxyHandler = async event => {
    switch (event.httpMethod) {
        case 'GET':
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'You made it!', event })
            }
        default:
            return {
                statusCode: 404,
                body: "Not Found"
            }
    }
}