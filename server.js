const {db} = require("./db/connection");
const app = require("./src/app")
const port = 3000;

const startServer = async () => {
    try {
        // Sync the database with the 'force: true' flag if needed to reset it (e.g., for development)
        await db.sync(); // Ensure the DB sync happens before the server starts
        console.log("Database synced successfully");

        // Start the server
        app.listen(port, () => {
            console.log(`Listening at http://localhost:${port}`);
        });
    } catch (error) {
        console.error("Error syncing the database: ", error);
    }
};

startServer();