const { Router } = require('express');

let router: any = null;

const getRouter = () => {
    if (!router) {
        router = Router();
    }
    return router;
}

module.exports = getRouter();
