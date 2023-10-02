export const jsonResponse = (body: any, statusCode: number = 200) => ({
    statusCode,
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
});