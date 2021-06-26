import express from 'express'

const port: number = 3000;
const app: express.Application = express();

app.use(express.static('/frontend/dist/'))

app.listen(port, () => {
  console.log(`listening on ${port}...`);
});