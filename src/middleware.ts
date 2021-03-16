import { Validator } from './validator';

class Middleware {
    public static handle(req: any, res: any, next: any) {
        console.log(req.path);
        next();
    }
}

export { Middleware };
