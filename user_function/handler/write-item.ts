
import { randomBytes } from 'crypto';

const UUID = randomBytes(16).toString("hex");

import { DynamoDB } from 'aws-sdk';
// import { eventData, dbItem } from '../models/table_schema';
// import { dynamoParams } from '../shared/create_dynamo';
import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult
} from "aws-lambda";
const documentClient = new DynamoDB.DocumentClient({
    region: process.env.REGION
});

export const lambdaHandler = async (
    event: any
) => {
    console.log(event)
    console.log(event.requestContext.http.method)
    switch (event.requestContext.http.method) {

        case 'GET':
            return await getItem(event);
            break;
        case 'POST':

            return await saveItem(event);

            break;
        case 'DELETE':

            return await deleteItem(event);

            break;
        case 'PUT':

            return await updateItem(event);

            break;
        // case 'OPTIONS':
        //     sendResponse(200, JSON.stringify('OPTIONS'), callback);
        //     break;
        default:
            const response = {
                statusCode: 404,
                body: JSON.stringify(
                    {
                        message: `Unsupported method "${event.requestContext.http.method}"`
                    },
                    null,
                    2
                )
            }
            return response;

    }
}


async function saveItem(event: any) {
    try {
        console.log(event)
        const insertData = JSON.parse(event.body)
        insertData.Id = randomBytes(16).toString("hex");

        const dbInsertItem = {
            TableName: process.env.TABLE_NAME,
            Item: insertData
        }
        await documentClient.put(dbInsertItem).promise();
        const response = {
            statusCode: 200,
            body: JSON.stringify(
                {
                    message: 'success inserted !'
                },
                null,
                2
            )
        }
        return response;
    } catch (e) {
        return {
            statusCode: 500,
            body: JSON.stringify(e)
        };
    }
}

async function getItem(event: any) {
    if (event.rawPath != '/') {

        var id = event.rawPath.split('/')
        console.log(id)
        id = id[1]
        const params = {
            TableName: process.env.TABLE_NAME,
            Key: {
                Id: id,
            }
        };
        try {
            const data = await documentClient.get(params).promise();
            const response = {
                statusCode: 200,
                body: JSON.stringify(data.Item ? data.Item : { message: 'Item not found' })
            };
            return response;
        } catch (e) {
            return {
                statusCode: 500,
                body: JSON.stringify(e)
            };
        }


    } else {
        const params = {
            TableName: process.env.TABLE_NAME
        };
        try {
            const data = await documentClient.scan(params).promise();
            const response = {
                statusCode: 200,
                body: JSON.stringify(data.Items)
            };
            return response;
        } catch (e) {
            console.log(e)
            return {
                statusCode: 500,
                body: JSON.stringify(e)
            };
        }
    }
}
async function updateItem(event: any) {

    try {
        var id = event.rawPath.split('/')
        console.log(id)
        id = id[1]
        var eventData = JSON.parse(event.body)
        eventData["Id"]=id
        const dbInsertItem = {
            TableName: process.env.TABLE_NAME,
            Item: eventData
        }
        await documentClient.put(dbInsertItem).promise();
        const response = {
            statusCode: 200,
            body: JSON.stringify(
                {
                    message: 'success updated !'
                })
        };
        return response;
    } catch (e) {
        return {
            statusCode: 500,
            body: JSON.stringify(e)
        };
    }



}
async function deleteItem(event: any) {
    try {
        var id = event.rawPath.split('/')
        console.log(id)
        id = id[1]
        const params = {
            TableName: process.env.TABLE_NAME,
            Key: {
                Id: id,
            }
        };
        await documentClient.delete(params).promise();
        const response = {
            statusCode: 200,
            body: JSON.stringify(
                {
                    message: 'success deleted !'
                },
                null,
                2
            )
        }
        return response;
    } catch (e) {
        return {
            statusCode: 500,
            body: JSON.stringify(e)
        };
    }

}
