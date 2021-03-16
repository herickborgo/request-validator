import { Annotation } from '@herickborgo/annotations';
import { Exception } from './exception';

const fs = require('fs');

abstract class Validator extends Annotation {

    private defaultRules: any = {
        'required': (v: any) => !!v,
        'max': (v: any, max: number) => !v ? true : typeof v === 'number' ? v <= max : v.length <= max,
        'min': (v: any, min: number) => !v ? false : typeof v === 'number' ? v >= min : v.length >= min,
        'email': (v:any) => /^.*(@)[a-z]{2,}(.).*/g.test(v),
        'number': (v:any) => Number(v) == v,
    };

    protected req: any = null;

    constructor(req?: object) {
        super();
        this.req = req;
    }

    abstract rules(): Object;

    public validate(): void {
        const acceptLanguage = process.env.ACCEPT_LANGUAGE;
        const rules: any = this.rules();
        const data = Object
            .keys(rules)
            .map((key) => ({
                field: key,
                rule: rules[key],
            }))
            .map((value) => ({
                field: value.field,
                rules: typeof value.rule === 'function' ? [ value.rule ] : typeof value.rule === 'string' ? value.rule.split('|') : value.rule,
            }))
            .map((value) => {
                const result: any = {};
                result[value.field] = {};
                value.rules.forEach((rule: any) => {
                    if (typeof rule === 'string') {
                        let ruleName: any = rule;
                        let param: any = null
                        if (rule.split(':').length > 1) {
                            ruleName = rule.split(':')[0];
                            param = rule.split(':')[1];
                        }
                        if (param) {
                            result[value.field][ruleName] = {
                                value: this.defaultRules[ruleName](this.req[value.field], param),
                                param,
                                type: typeof this.req[value.field],
                            };
                            return;
                        }
                        result[value.field][ruleName] = {
                            value: this.defaultRules[ruleName](this.req[value.field])
                        };
                    }

                    if (typeof rule === 'function') {
                        let ruleName: any = rule.name;
                        result[value.field][ruleName] = {
                            value: rule(this.req[value.field])
                        };
                    }
                })
                return result;
            });

        this.messages(data, acceptLanguage);
    }

    protected messages(validations: Array<object>, language: string = 'en-US') {
        const errors: any = {};

        validations.forEach((validation: any) => {
            const field = Object.keys(validation)[0];

            errors[field] = [];

            const rules = Object.keys(validation[field]);
            rules.forEach((key) => {
                if (validation[field][key].value === true) {
                    return;
                }

                let type = validation[field][key].type ?? null;
                if (type === 'undefined') {
                    type = 'string';
                }

                let message = this.getMessage(key, language, type);
                if (typeof validation[field][key].value === 'string') {
                    message = validation[field][key].value;
                }

                message = message.replace(':attribute', field)
                if (validation[field][key].param) {
                    message = message.replace(`:${key}`, validation[field][key].param);
                }

                errors[field].push(message);
            });

            if (errors[field].length === 0) {
                delete errors[field];
            }
        });

        Object.keys(errors).forEach((key) => {
            errors[key] = Array.from(new Set(errors[key]));
        });

        if (errors) {
            throw new Exception(JSON.stringify({ message: 'The given data was invalid.', errors }));
        }
    }

    private getMessage(key: string, language: string = 'en-US', type: any = null): string {
        const fileMessage = `${__dirname}/messages/${language}.json`;
        if (fs.existsSync(fileMessage)) {
            const messages = require(fileMessage);
            let message = messages.validation[key] || 'The :attribute field has an error';
            if (typeof message === 'string') {
                return message;
            }

            return message[type];
        }

        return 'The :attribute field has an error';
    }
};

export { Validator };
