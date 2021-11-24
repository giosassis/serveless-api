"use strict";

const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const params = {
  TableName: "PATIENTS",
};

module.exports.getPacient = async (event) => {
  try {
    let data = await dynamoDb.scan(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(data.Items),
    };
  } catch (err) {
    console.error(err);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.name ? err.name : "Exception",
        message: err.message ? err.message : "Unknown error",
      }),
    };
  }
};

module.exports.getPacientByID = async (event) => {
  try {
    const { patientId } = event.pathParameters;

    const data = await dynamoDb
      .get({
        //select from where id
        ...params,
        Key: {
          patient_id: patientId,
        },
      })
      .promise();

    if (!data.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Patient not found" }, null, 2),
      };
    }
    const patient = data.Item;

    return {
      statusCode: 200,
      body: JSON.stringify(patient, null, 2),
    };
  } catch (err) {
    console.log("Error", err);
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      body: JSON.stringify({
        error: err.name ? err.name : "Exception",
        message: err.message ? err.message : "Unknown error",
      }),
    };
  }
};

module.exports.postPatient = async (event) => {
  try {
    const timestamp = new Date().getTime();

    let data = JSON.parse(event.body);

    const { name, birthdate, email, phoneNumber } = data;

    const patient = {
      patientId: uuidv4(),
      name,
      birthdate,
      email,
      phoneNumber,
      status: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await dynamoDb
      .put({
        TableName: "PATIENTS",
        Item: patient,
      })
      .promise();

    return {
      statusCode: 201,
    };
  } catch (err) {
    console.log("Error", err);
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      body: JSON.stringify({
        error: err.name ? err.name : "Exception",
        message: err.message ? err.message : "Unknown error",
      }),
    };
  }
};

module.exports.updatePatient = async (event) => {
  const { patientId } = event.pathParameters;

  try {
    const timestamp = new Date().getTime();

    let data = JSON.parse(event.body);

    const { name, birthdate, email, phoneNumber } = data;

    await dynamoDb
      .update({
        ...params,
        Key: {
          patient_id: patientId,
        },
        UpdateExpression:
          "SET nome = :name, birthdate = :dt, email = :email," +
          " phoneNumber = :phoneNumber, updatedAt = :updatedAt",
        ConditionExpression: "attribute_exists(patient_id)",
        ExpressionAttributeValues: {
          ":name": name,
          ":bd": birthdate,
          ":email": email,
          ":phoneNumber": phoneNumber,
          ":updatedAt": timestamp,
        },
      })
      .promise();

    return {
      statusCode: 204,
    };
  } catch (err) {
    console.log("Error", err);

    let error = err.name ? err.name : "Exception";
    let message = err.message ? err.message : "Unknown error";
    let statusCode = err.statusCode ? err.statusCode : 500;

    if (error == "ConditionalCheckFailedException") {
      error = "This patient does not exists";
      message = `This ${patientId} does not exists or cant not be updated`;
      statusCode = 404;
    }

    return {
      statusCode,
      body: JSON.stringify({
        error,
        message,
      }),
    };
  }
};

module.exports.deletePatient = async (event) => {
  const { patientId } = event.pathParameters;

  try {
    await dynamoDb
      .delete({
        ...params,
        Key: {
          patient_id: patientId,
        },
        ConditionExpression: "attribute_exists(patient_id)",
      })
      .promise();

    return {
      statusCode: 204,
    };
  } catch (err) {
    console.log("Error", err);

    let error = err.name ? err.name : "Exception";
    let message = err.message ? err.message : "Unknown error";
    let statusCode = err.statusCode ? err.statusCode : 500;

    if (error == "ConditionalCheckFailedException") {
      error = "Patient not found.";
      message = `The patient with ID ${patientId} does not exist or can't be deleted.`;
      statusCode = 404;
    }

    return {
      statusCode,
      body: JSON.stringify({
        error,
        message,
      }),
    };
  }
};
