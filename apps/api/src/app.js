import { express } from "express";
import { cors } from "cors";
import { authRoutes } from "../"

export default function buildApp(){
    const app = express();
    app.use(cors());
    app.use(express.json());;
    
    return app;
}