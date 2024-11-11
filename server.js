const express = require('express');
const searchRoutes = require('./routes/search'); // Import the router correctly
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Use the router in your main app
app.use('/', searchRoutes);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
