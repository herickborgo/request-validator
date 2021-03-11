import { Annotation } from '@herickborgo/annotations';
import { ValidatorException } from './validator_exception';

const fs = require('fs');

abstract class RequestValidator extends Annotation {

    private defaultRules: Object = {
        'required': (v) => !!v,
    };

    protected req: any = null;

    constructor(req?: object) {
        super();
        this.req = req;
    }

    abstract rules(): Object;

    public validate(): void {
        const rules = this.rules();
        const data = Object.keys(rules).map((key) => {
            const result = {};
            result[key] = {};
            if (typeof rules[key] === 'string') {
                const rule = rules[key];
                result[key][rule] = this.defaultRules[rule](this.req[key]);
            }
            if (typeof rules[key] === 'function') {
                const rule = rules[key];
                result[key][rule] = rules[key](this.req[key]);
            }
            return result;
        });
        this.messages(data);
    }

    protected messages(validations: Array<object>) {
        const errors: Array<object> = []
        validations.forEach((validation) => {
            const fields = Object.keys(validation);
            fields.forEach((field) => {
                const rules = Object.keys(validation[field]);

                rules.forEach((rule) => {
                    if (!validation[field][rule]) {
                        const message = this.getMessage(rule);
                        const error = {};
                        error[field] = message.replace(':attribute', field);
                        errors.push(error);
                    }
                })
            })
        });

        if (errors.length) {
            throw new ValidatorException(JSON.stringify({message: 'Invalid Data', errors}));
        }
    }

    private getMessage(key: string, language: string = 'en-US') {
        const fileMessage = `${__dirname}/messages/${language}.json`;
        if (fs.existsSync(fileMessage)) {
            const messages = require(fileMessage);
            return messages.validation[key] || '';
        }

        return '';
    }
};

export { RequestValidator };
