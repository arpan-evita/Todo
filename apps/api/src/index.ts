import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'operational', system: 'AutogrowX: Mission Control API' });
});

app.listen(port, () => {
  console.log(`[SYSTEM] Mission Control API active on port ${port}`);
});
