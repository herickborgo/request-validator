import { RequestValidator } from '../src/request_validator';
const fs = require('fs');

describe('RequestValidator', () => {
    const greaterThanFive = (v: any) => v > 5 || "The field :attribute must be greater than 5";
    class TestRequest extends RequestValidator {
        rules(): Object {
            return {
                'name': 'required',
                'test': greaterThanFive,
            };
        }
    }

    const testRequest = new TestRequest({ name: '', test: 4 });

    test('Assert error message', () => {
        try {
            testRequest.validate();
        } catch (error: any) {
            expect(error.message).toEqual('{"message":"Invalid Data","errors":[{"name":{"required":"The field name is required"}},{"test":{"greaterThanFive":"The field test must be greater than 5"}}]}');
        }
    });
    test('Assert file message not exists', () => {
        jest.mock('fs');
        fs.existsSync = jest.fn(() => false);
        try {
            testRequest.validate();
        } catch (error: any) {
            expect(error.message).toEqual('{"message":"Invalid Data","errors":[{"name":{"required":"The field name has an error"}},{"test":{"greaterThanFive":"The field test must be greater than 5"}}]}');
        }
    })
})
