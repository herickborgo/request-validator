import { RequestValidator } from "../src/request_validator";

describe('RequestValidator', () => {
    class TestRequest extends RequestValidator {
        rules(): Object {
            return {
                'test': 'required',
            };
        }
    }

    const testRequest = new TestRequest({ test: '' });

    test('test', () => {
        testRequest.validate();
    });
})
