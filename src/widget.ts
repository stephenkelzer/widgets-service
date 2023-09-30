import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

export interface PendingWidget {
    name: string;
}

// move to builder pattern?
export class Widget {
    readonly id: string;
    readonly created: number;
    readonly name: string;

    constructor(dynamoItem: Record<string, AttributeValue>) {
        const unmarshalled: Record<string, any> = unmarshall(dynamoItem);

        this.id = unmarshalled.id;
        this.created = unmarshalled.created;
        this.name = unmarshalled.name;
    }
}