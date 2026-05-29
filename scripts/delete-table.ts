import { DynamoDBClient, DeleteTableCommand } from "@aws-sdk/client-dynamodb";

const TABLE = process.env.DDB_TABLE ?? "AgentLedger";
const region = process.env.AWS_REGION ?? "us-east-1";
const client = new DynamoDBClient({ region });

async function main() {
  if (process.env.CONFIRM !== "yes") {
    console.error(`Refusing to delete "${TABLE}". Re-run with CONFIRM=yes to proceed.`);
    process.exit(1);
  }
  console.log(`Deleting table "${TABLE}" in ${region} ...`);
  await client.send(new DeleteTableCommand({ TableName: TABLE }));
  console.log("Delete requested.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
