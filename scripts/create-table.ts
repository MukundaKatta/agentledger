import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
  waitUntilTableExists,
} from "@aws-sdk/client-dynamodb";

const TABLE = process.env.DDB_TABLE ?? "AgentLedger";
const region = process.env.AWS_REGION ?? "us-east-1";
const client = new DynamoDBClient({ region });

async function main() {
  try {
    await client.send(new DescribeTableCommand({ TableName: TABLE }));
    console.log(`Table "${TABLE}" already exists in ${region}. Nothing to do.`);
    return;
  } catch (e) {
    if ((e as { name?: string }).name !== "ResourceNotFoundException") throw e;
  }

  console.log(`Creating table "${TABLE}" in ${region} (on-demand billing) ...`);
  await client.send(
    new CreateTableCommand({
      TableName: TABLE,
      BillingMode: "PAY_PER_REQUEST",
      AttributeDefinitions: [
        { AttributeName: "pk", AttributeType: "S" },
        { AttributeName: "sk", AttributeType: "S" },
        { AttributeName: "GSI1PK", AttributeType: "S" },
        { AttributeName: "GSI1SK", AttributeType: "S" },
      ],
      KeySchema: [
        { AttributeName: "pk", KeyType: "HASH" },
        { AttributeName: "sk", KeyType: "RANGE" },
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: "GSI1",
          KeySchema: [
            { AttributeName: "GSI1PK", KeyType: "HASH" },
            { AttributeName: "GSI1SK", KeyType: "RANGE" },
          ],
          Projection: { ProjectionType: "ALL" },
        },
      ],
    }),
  );

  await waitUntilTableExists({ client, maxWaitTime: 120 }, { TableName: TABLE });
  console.log(`Table "${TABLE}" is ACTIVE and ready.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
