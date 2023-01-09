import { socialAppServer } from './setupServer';
import express,{ Express } from 'express';
import databaseConnection from './setupDatabase';
import { config } from './config';

class Application {
    public initialize():void {
        this.loadConfig();
        databaseConnection();
        const app:Express = express();
        const server: socialAppServer = new socialAppServer(app);
        server.start();
    }
    private loadConfig():void{
        config.validateConfig();
        config.cloudinaryConfig();
    }
}

const application: Application = new Application();
application.initialize();
