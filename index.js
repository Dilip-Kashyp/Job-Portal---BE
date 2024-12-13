const app = require("./app.js");
require("dotenv").config();

const port = process.env.PORT || 5400;

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
})