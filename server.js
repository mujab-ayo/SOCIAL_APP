const app = require('./app');
const connectToDB = require('./config/db');

const PORT = process.env.PORT || 3000;


function startServer() {
    connectToDB();

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

startServer();