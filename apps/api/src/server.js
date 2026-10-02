import { buildApp } from './app';

const app = buildApp();
try {
    await app.listen({
        port: 3030,
        host: "0.0.0.0"
    });

} catch (err) {
    app.log.err(err)
}