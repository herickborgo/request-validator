import { Annotation } from '@herickborgo/annotations';
import { ValidatorException } from './validator_exception';

const fs = require('fs');

abstract class RequestValidator extends Annotation {

    private defaultRules: any = {
        'required': (v: any) => !!v,
    };

    protected req: any = null;

    constructor(req?: object) {
        super();
        this.req = req;
    }

    abstract rules(): Object;

    public validate(): void {
        const rules: any = this.rules();
        const data = Object.keys(rules).map((key) => {
            const rule: any = rules[key];
            const result: any = {
                field: key,
                errors: [],
            };
            if (typeof rule === 'string') {
                result.errors.push({
                    rule,
                    result: this.defaultRules[rule](this.req[key]),
                });
            }
            if (typeof rule === 'function') {
                result.errors.push({
                    rule,
                    result: rules[key](this.req[key]),
                });
            }
            return result;
        });
        this.messages(data);
    }

    protected messages(validations: Array<object>) {
        const errors: Array<object> = []
        validations.forEach((validation: any) => {
            const field: string = validation.field;

            validation.errors.forEach((error: any) => {
                let message = this.getMessage(error.rule);
                const result: any = {};
                result[field] = {}

                if (!message) {
                    message = 'The field :attribute has an error';
                }

                if (typeof error.result === 'string') {
                    message = error.result;
                    error.rule = error.rule.name;
                    error.result = false;
                }

                if (!error.result) {
                    result[field][error.rule] = message.replace(':attribute', field);
                }
                errors.push(result);
            })
        });

        if (errors.length) {
            throw new ValidatorException(JSON.stringify({message: 'Invalid Data', errors}));
        }
    }

    private getMessage(key: string, language: string = 'en-US'): string {
        const fileMessage = `${__dirname}/messages/${language}.json`;
        if (fs.existsSync(fileMessage)) {
            const messages = require(fileMessage);
            return messages.validation[key] || '';
        }

        return '';
    }
};

export { RequestValidator };
