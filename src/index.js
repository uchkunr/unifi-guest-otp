const app = require('./app');
const sequelize = require('./database/mysql');

const PORT = process.env.PORT;
const HOST = process.env.HOST;

app.listen(PORT, HOST, async () => {
  await sequelize.authenticate();
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
