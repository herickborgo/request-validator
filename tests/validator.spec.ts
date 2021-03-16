import { Validator } from '../src/validator';
const fs = require('fs');

beforeEach(() => {
    jest.clearAllMocks();
});

describe('RequestValidator', () => {
    const greaterThanFive = (v: any) => v > 5 || "The :attribute field must be greater than 5";

    process.env.ACCEPT_LANGUAGE = 'en-US';

    test('Assert error message', () => {
        try {
            class TestRequest extends Validator {
                rules(): Object {
                    return {
                        'name': 'required|max:18',
                        'test': greaterThanFive,
                        'age': 'min:18|max:70',
                        'email': 'email',
                    };
                }
            }
            const testRequest = new TestRequest({ name: '', test: 4, age: 17 });
            testRequest.validate();
        } catch (error: any) {
            const message = JSON.parse(error.message);

            expect(message).toEqual({
                message: 'The given data was invalid.',
                errors: {
                  name: [ 'The name field is required' ],
                  test: [ 'The test field must be greater than 5' ],
                  email: [ 'The email field is invalid'],
                  age: ['The age field must be at least 18']
                }
              });
        }
    });

    test('Assert file message not exists', () => {
        jest.mock('fs');
        fs.existsSync = jest.fn(() => false);
        try {
            class TestRequest extends Validator {
                rules(): Object {
                    return {
                        'name': 'required|max:18',
                        'test': greaterThanFive,
                        'age': 'min:18|max:70',
                        'email': 'email',
                    };
                }
            }
            const testRequest = new TestRequest({ name: '', test: 4, email: 'test@example.com' });
            testRequest.validate();
        } catch (error: any) {
            const message = JSON.parse(error.message);

            expect(message).toEqual({
                message: 'The given data was invalid.',
                errors: {
                    name: ['The name field has an error'],
                    test: ['The test field must be greater than 5'],
                    age: ['The age field has an error'],
                }
            });
        }
    });

    test('Max rule type of string', () => {
        try {
            class TestRequest extends Validator {
                rules(): Object {
                    return {
                        'name': 'required|max:18',
                        'test': greaterThanFive,
                        'age': 'min:18|max:70',
                        'email': 'email',
                    };
                }
            }
            fs.existsSync = jest.fn(() => true);
            const testRequest = new TestRequest({ name: 'Herick Fernando Borgo' });
            testRequest.validate();
        } catch (error: any) {
            const message = JSON.parse(error.message);

            expect(message).toEqual({
                message: 'The given data was invalid.',
                errors: {
                  name: [ 'The name field must be a maximum of 18 characters' ],
                  test: [ 'The test field must be greater than 5' ],
                  age: [ 'The age field must be at least 18 characters' ],
                  email: [ 'The email field is invalid' ]
                }
              });
        }
    });

    test('Min rule type of string', () => {
        try {
            class TestRequest extends Validator {
                rules(): Object {
                    return {
                        'name': 'required|min:5'
                    };
                }
            }
            fs.existsSync = jest.fn(() => true);
            const testRequest = new TestRequest({ name: 'test' });
            testRequest.validate();
        } catch (error: any) {
            const message = JSON.parse(error.message);

            expect(message).toEqual({
                message: 'The given data was invalid.',
                errors: {
                  name: [ 'The name field must be at least 5 characters' ],
                }
              });
        }
    });

    test('Rule type array', () => {
        try {
            class TestRequest extends Validator {
                rules(): Object {
                    return {
                        'name': ['required', 'min:5'],
                    };
                }
            }
            fs.existsSync = jest.fn(() => true);
            const testRequest = new TestRequest({ name: 'test' });
            testRequest.validate();
        } catch (error: any) {
            const message = JSON.parse(error.message);

            expect(message).toEqual({
                message: 'The given data was invalid.',
                errors: {
                  name: [ 'The name field must be at least 5 characters' ],
                }
              });
        }
    });
})
