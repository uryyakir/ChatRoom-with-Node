const expressApp = require('./express_app.js');
const port = 3000;

let variablesObj = new expressApp.Variables();
new expressApp.ExpressSetup(variablesObj);

expressApp.http.listen(port, () => console.log(`ChatApp app listening at http://localhost:${port}`));
