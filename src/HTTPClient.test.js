import HTTPClient from './HTTPClient';
import Cipher from './Cipher';
import crypto from 'crypto';

describe('HTTPClient', () => {
  it('signs the request', () => {
    const key = require('./secrets').key;
    const cipher = new Cipher(key);
    const httpClient = new HTTPClient(cipher);
    const httpMethod = 'GET';
    const url = 'https://secret-message-server.herokuapp.com/api/v1/secret_messages/1.json';
    const httpVersion = 'HTTP/1.1';
    const xhr = new XMLHttpRequest();
    const xhrAndCryptoProperties = httpClient.sign_request(xhr, httpMethod, url, httpVersion);

    const signed_xhr = xhrAndCryptoProperties.xhr;

    // This test verifies that signed_xhr is an Object that was created by
    //  XMLHttpRequest(). It does this byensuring that all of the
    //  XMLHttpRequest() keys exist in the signed_xhr object.
    expect(typeof signed_xhr).toEqual('object');
    const expectedXhrKeys = [ 'onabort',
                              'onerror',
                              'onload',
                              'onloadend',
                              'onloadstart',
                              'onprogress',
                              'ontimeout',
                              'upload',
                              'onreadystatechange' ];
    Object.keys(signed_xhr).map((key) => {
      expect(expectedXhrKeys).toContain(key);
    });

    // This comment is duplicated in the source for HTTPClient#sign_request()
    // It turns out that an XMLHttpRequest object has no method for getting the
    //   values of request headers once they have been set. See the docs, where
    //   there are methods for setting request headers and getting response
    //   headers, but no methods for getting request headers:
    //   https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
    // I'd still like to test that the signature is being generated, but I can't
    //   directly get the value of the Authorization header from the XHR object.
    // So, I'm going to return an object from this method that contains both the
    //   XHR object itself as well as the signature. This will make it possible
    //   to unit test that the signature is being generated. BUT, we are still
    //   not testing that the signature was set as a header in the request.
    // You can manually verify that the Authorization header is being set by
    //   uncommenting the following line and visually observing that the
    //   Authorization header exists and has a long string as its value.
    // console.log(signed_xhr);

    console.log('Want to test more thoroughly that the Authorization and IV headers are being set? Uncomment the console.log() above and look for an Authorization header with a long string as its value.')

    // Here, we test that a signature is generated by HTTPClient#sign_request(),
    //  although this does not test that this signature is assigned to an
    //  Authorization header, as per the comments above.
    const signature = xhrAndCryptoProperties.signature;
    expect(typeof signature).toEqual('string');

    // Test that the cipher's initialization vector is part of the output of
    //  HTTPClient#sign_request()
    const initialization_vector = xhrAndCryptoProperties.initialization_vector;
    expect(typeof initialization_vector).toEqual('string');
    expect(initialization_vector).toEqual(String(cipher.initialization_vector))

    // Test that the signature is indeed the encrypted HTTP request line
    const decrypted_signature = cipher.decrypt(signature);
    const request_line = httpMethod + ' ' + url + ' ' + httpVersion;
    expect(decrypted_signature).toEqual(request_line);
  });
});
