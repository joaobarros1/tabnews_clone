import database from "infra/database.js";

async function status(request, response) {
    const updatedAt = new Date().toISOString();

    const dataBaseVersionResult = await database.query({
        text: "SHOW server_version;",
    });

    const databaseVersionValue = dataBaseVersionResult.rows[0].server_version;

    const databaseMaxConnectionsResult = await database.query({
        text: "SHOW max_connections;",
    });
    const databaseMaxConnectionsValue = parseInt(
        databaseMaxConnectionsResult.rows[0].max_connections,
    );

    const databaseName = process.env.POSTGRES_DB;
    const databaseOpenedConnectionsResult = await database.query({
        text: `SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;`,
        values: [databaseName],
    });
    const databaseOpenedConnectionsValue =
        databaseOpenedConnectionsResult.rows[0].count;

    console.log(
        "databaseOpenedConnectionsValue",
        databaseOpenedConnectionsValue,
    );

    // Terminate all connections except the current one
    // await database.query(`
    //     SELECT pg_terminate_backend(pg_stat_activity.pid)
    //     FROM pg_stat_activity
    //     WHERE pg_stat_activity.datname = 'postgres'
    //       AND pid <> pg_backend_pid();
    //   `);

    response.status(200).json({
        updated_at: updatedAt,
        dependencies: {
            database: {
                version: databaseVersionValue,
                max_connections: databaseMaxConnectionsValue,
                opened_connections: databaseOpenedConnectionsValue,
            },
        },
    });
}

export default status;
