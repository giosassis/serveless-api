const sinon = require("sinon");
const proxyquire = require("proxyquire").noCallThru;


describe("DynamoDB Mock Test", () => {
  let AWS;
  let getPatient;

  before(() => {
    getPatient = sinon.stub();

    AWS = {
      DynamoDB: {
        DocumentClient: sinon.stub().returns({
          query: getPatient,
        }),
      },
    };
  });

  scriptToTest = proxyquire("../handler.js", {
    "aws-sdk": AWS,
  });
});

it("should return should return 200", async () => {
  getPatient.get.withArgs(sinon.match.any).yelds(null, {statusCode: 200});
});

/*const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../handler");

chai.expect();
chai.use(chaiHttp);

describe("API Patients", () => {
  describe("GET /patients", () => {
    it("should return a list of patients", (done) => {
      chai.request("http://localhost:3000/dev/patients")
      .get("/patients");
    });
  });
});*/
