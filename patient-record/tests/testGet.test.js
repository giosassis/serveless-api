const chai = require("chai");
const sinon = require('sinon');
const sinonChai = require('sinon-chai')

const proxyquire = require('proxyquire').noCallThru()
const { expect } = chai

chai.should();
chai.use(sinonChai);

const patients = [{ Name: "John" }]

function createDocumentClientMock() {
  const scanSpy = sinon.spy(() => ({
    promise: async () => ({
      Items: patients
    })
  }))

  const getSpy = sinon.spy(() => ({
    promise: async () => ({
      Items: [{ Name: "John" }]
    })
  }))

  const DocumentClient = class {
    constructor() {
      this.scan = scanSpy
      this.get = getSpy
    }
  };

  return { DocumentClient, spy: { scanSpy } };
}

function createHandler(mock) {
  return proxyquire('../../handler', {
    'aws-sdk': {
      DynamoDB: {
        DocumentClient: mock.DocumentClient
      }
    }
  })
}

describe("API Patients", () => {
  describe("GET /patients", () => {
    it("should return a list of patients", async () => {
      const mock = createDocumentClientMock();
      const api = createHandler(mock);
      const response = await api.getPacient();
      expect(response.statusCode).to.be.equal(200);
      expect(mock.spy.scanSpy).to.have.been.called;
    });
  });
});
