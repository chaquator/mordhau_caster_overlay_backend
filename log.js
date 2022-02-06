import bunyan from 'bunyan'

const log = bunyan.createLogger({
    name: "mcob",
    level: process.env.NODE_ENV === "production" ? "info" : "debug"
});

export default log;
