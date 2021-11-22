const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../handler");

chai.expect();
chai.use(chaiHttp);

describe("API Patients", () => {
  describe("GET /patients", () => {
    it("should return a list of patients", (done) => {
      chai.request("https://ri0ic4hh2m.execute-api.us-east-1.amazonaws.com/dev/patients")
      .get("/patients");
    });
  });
});